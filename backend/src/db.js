import pg from 'pg';
import 'dotenv/config';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT) || 5432,
  database: process.env.POSTGRES_DB || 'utm_tracking',
  user: process.env.POSTGRES_USER || 'utm_user',
  password: process.env.POSTGRES_PASSWORD,
});

export async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE SEQUENCE IF NOT EXISTS customer_seq START 1;
      CREATE SEQUENCE IF NOT EXISTS order_seq START 1;

      CREATE TABLE IF NOT EXISTS customers (
        id              SERIAL PRIMARY KEY,
        customer_code   TEXT NOT NULL UNIQUE,
        line_uid        TEXT UNIQUE,
        display_name    TEXT,
        picture_url     TEXT,
        source_type     TEXT DEFAULT 'LINE',
        is_blocked      BOOLEAN DEFAULT FALSE,
        created_at      TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS admin_users (
        id              SERIAL PRIMARY KEY,
        username        TEXT NOT NULL UNIQUE,
        password_hash   TEXT NOT NULL,
        display_name    TEXT,
        is_active       BOOLEAN NOT NULL DEFAULT TRUE,
        last_login_at   TIMESTAMPTZ,
        created_at      TIMESTAMPTZ DEFAULT NOW(),
        updated_at      TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS utm_sessions (
        id          SERIAL PRIMARY KEY,
        tracking_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
        utm_source  TEXT,
        utm_medium  TEXT,
        utm_campaign TEXT,
        utm_content TEXT,
        utm_term    TEXT,
        source_url  TEXT,
        ip          TEXT,
        user_agent  TEXT,
        line_uid            TEXT REFERENCES customers(line_uid) ON DELETE SET NULL,
        linked_at           TIMESTAMPTZ,
        follow_requested_at TIMESTAMPTZ,
        created_at          TIMESTAMPTZ DEFAULT NOW()
      );

      ALTER TABLE utm_sessions ADD COLUMN IF NOT EXISTS follow_requested_at TIMESTAMPTZ;

      CREATE TABLE IF NOT EXISTS orders (
        id            SERIAL PRIMARY KEY,
        order_code    TEXT NOT NULL UNIQUE,
        customer_id   INTEGER NOT NULL REFERENCES customers(id),
        parent_order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
        template_type TEXT NOT NULL,
        account_type  TEXT,
        amount        NUMERIC(18,2),
        exchange_rate NUMERIC(12,6),
        exchange_rate_currency TEXT,
        total_amount  NUMERIC(18,2),
        status        TEXT NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING','CONFIRMED','UNCONFIRMED','SENT')),
        stage         TEXT NOT NULL DEFAULT 'WAITING_ORDER_CONFIRMATION'
                        CHECK (stage IN (
                          'WAITING_ORDER_CONFIRMATION',
                          'ORDER_CONFIRMED',
                          'SELLER_SHIPPED',
                          'WAREHOUSE_RECEIVED',
                          'IMPORT_INVOICE_SENT',
                          'IMPORT_PAID',
                          'READY_FOR_DISPATCH',
                          'PICKUP_SCHEDULED',
                          'DISPATCHED',
                          'COMPLETED'
                        )),
        seller_tracking_no TEXT,
        seller_tracking_added_at TIMESTAMPTZ,
        thai_warehouse_received_at TIMESTAMPTZ,
        delivery_method TEXT CHECK (delivery_method IN ('PICKUP','DELIVERY')),
        delivery_provider TEXT,
        delivery_tracking_no TEXT,
        delivery_note TEXT,
        delivery_updated_at TIMESTAMPTZ,
        expires_at    TIMESTAMPTZ,
        confirmed_at  TIMESTAMPTZ,
        created_at    TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS message_logs (
        id            SERIAL PRIMARY KEY,
        customer_id   INTEGER REFERENCES customers(id),
        order_id      INTEGER REFERENCES orders(id),
        template_type TEXT,
        message_text  TEXT,
        line_error    TEXT,
        sent_at       TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS webhook_events (
        webhook_event_id TEXT PRIMARY KEY,
        processed_at     TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS webhook_logs (
        id               SERIAL PRIMARY KEY,
        source           TEXT NOT NULL,
        event_type       TEXT NOT NULL,
        status           TEXT NOT NULL CHECK (status IN ('SUCCESS','FAILED','SKIPPED')),
        webhook_event_id TEXT,
        line_uid         TEXT,
        payload          JSONB,
        error_message    TEXT,
        created_at       TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS template_configs (
        template_type TEXT PRIMARY KEY,
        display_name  TEXT NOT NULL,
        accent_color  TEXT NOT NULL DEFAULT '#1565c0',
        header_text_color TEXT NOT NULL DEFAULT '#ffffff',
        body_label_color TEXT NOT NULL DEFAULT '#6b7280',
        body_text_color TEXT NOT NULL DEFAULT '#111827',
        body_intro_text TEXT,
        body_intro_color TEXT NOT NULL DEFAULT '#0b57b7',
        footer_text_color TEXT NOT NULL DEFAULT '#4b5563',
        separator_color TEXT NOT NULL DEFAULT '#f3f4f6',
        footer_separator_color TEXT NOT NULL DEFAULT '#e5e7eb',
        subtitle      TEXT,
        footer_note   TEXT,
        button_confirm_label TEXT DEFAULT 'ยืนยัน',
        button_confirm_color TEXT NOT NULL DEFAULT '#16a34a',
        button_cancel_label TEXT DEFAULT 'ยกเลิก',
        detail_order_code_label TEXT NOT NULL DEFAULT 'เลขคำสั่งซื้อ',
        detail_document_type_label TEXT NOT NULL DEFAULT 'ประเภทเอกสาร',
        detail_account_type_label TEXT NOT NULL DEFAULT 'ประเภทบัญชี',
        detail_account_name_label TEXT NOT NULL DEFAULT 'ชื่อบัญชี',
        detail_account_number_label TEXT NOT NULL DEFAULT 'เลขบัญชี',
        detail_amount_label TEXT NOT NULL DEFAULT 'จำนวนเงิน',
        detail_exchange_rate_label TEXT NOT NULL DEFAULT 'อัตราแลกเปลี่ยน',
        detail_total_label TEXT NOT NULL DEFAULT 'ยอดฐาน',
        detail_vat_label TEXT NOT NULL DEFAULT 'VAT 7%',
        detail_withholding_label TEXT NOT NULL DEFAULT 'หัก ณ ที่จ่าย 3%',
        detail_net_total_label TEXT NOT NULL DEFAULT 'ยอดสุทธิ',
        is_active     BOOLEAN NOT NULL DEFAULT TRUE,
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS account_types (
        id          SERIAL PRIMARY KEY,
        code        TEXT NOT NULL UNIQUE,
        label       TEXT NOT NULL,
        account_name TEXT,
        account_number TEXT,
        is_active   BOOLEAN NOT NULL DEFAULT TRUE,
        sort_order  INTEGER NOT NULL DEFAULT 0,
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      ALTER TABLE template_configs
      ADD COLUMN IF NOT EXISTS header_text_color TEXT NOT NULL DEFAULT '#ffffff';
    `);
    await client.query(`
      ALTER TABLE template_configs
      ADD COLUMN IF NOT EXISTS body_label_color TEXT NOT NULL DEFAULT '#6b7280';
    `);
    await client.query(`
      ALTER TABLE template_configs
      ADD COLUMN IF NOT EXISTS body_text_color TEXT NOT NULL DEFAULT '#111827';
    `);
    await client.query(`
      ALTER TABLE template_configs
      ADD COLUMN IF NOT EXISTS body_intro_text TEXT;
    `);
    await client.query(`
      ALTER TABLE template_configs
      ADD COLUMN IF NOT EXISTS body_intro_color TEXT NOT NULL DEFAULT '#0b57b7';
    `);
    await client.query(`
      ALTER TABLE template_configs
      ADD COLUMN IF NOT EXISTS footer_text_color TEXT NOT NULL DEFAULT '#4b5563';
    `);
    await client.query(`
      ALTER TABLE template_configs
      ADD COLUMN IF NOT EXISTS separator_color TEXT NOT NULL DEFAULT '#f3f4f6';
    `);
    await client.query(`
      ALTER TABLE template_configs
      ADD COLUMN IF NOT EXISTS footer_separator_color TEXT NOT NULL DEFAULT '#e5e7eb';
    `);
    await client.query(`
      ALTER TABLE template_configs
      ADD COLUMN IF NOT EXISTS button_confirm_label TEXT DEFAULT 'ยืนยัน';
    `);
    await client.query(`
      ALTER TABLE template_configs
      ADD COLUMN IF NOT EXISTS button_confirm_color TEXT NOT NULL DEFAULT '#16a34a';
    `);
    await client.query(`
      ALTER TABLE template_configs
      ADD COLUMN IF NOT EXISTS button_cancel_label TEXT DEFAULT 'ยกเลิก';
    `);
    await client.query(`
      UPDATE template_configs
      SET button_confirm_label = COALESCE(button_confirm_label, 'ยืนยัน'),
          button_confirm_color = COALESCE(button_confirm_color, '#16a34a'),
          button_cancel_label = COALESCE(button_cancel_label, 'ยกเลิก');
    `);
    await client.query(`
      ALTER TABLE template_configs
      ADD COLUMN IF NOT EXISTS detail_order_code_label TEXT NOT NULL DEFAULT 'เลขคำสั่งซื้อ';
    `);
    await client.query(`
      ALTER TABLE template_configs
      ADD COLUMN IF NOT EXISTS detail_document_type_label TEXT NOT NULL DEFAULT 'ประเภทเอกสาร';
    `);
    await client.query(`
      ALTER TABLE template_configs
      ADD COLUMN IF NOT EXISTS detail_account_type_label TEXT NOT NULL DEFAULT 'ประเภทบัญชี';
    `);
    await client.query(`
      ALTER TABLE template_configs
      ADD COLUMN IF NOT EXISTS detail_account_name_label TEXT NOT NULL DEFAULT 'ชื่อบัญชี';
    `);
    await client.query(`
      ALTER TABLE template_configs
      ADD COLUMN IF NOT EXISTS detail_account_number_label TEXT NOT NULL DEFAULT 'เลขบัญชี';
    `);
    await client.query(`
      ALTER TABLE template_configs
      ADD COLUMN IF NOT EXISTS detail_amount_label TEXT NOT NULL DEFAULT 'จำนวนเงิน';
    `);
    await client.query(`
      ALTER TABLE template_configs
      ADD COLUMN IF NOT EXISTS detail_exchange_rate_label TEXT NOT NULL DEFAULT 'อัตราแลกเปลี่ยน';
    `);
    await client.query(`
      ALTER TABLE template_configs
      ADD COLUMN IF NOT EXISTS detail_total_label TEXT NOT NULL DEFAULT 'ยอดฐาน';
    `);
    await client.query(`
      ALTER TABLE template_configs
      ADD COLUMN IF NOT EXISTS detail_vat_label TEXT NOT NULL DEFAULT 'VAT 7%';
    `);
    await client.query(`
      ALTER TABLE template_configs
      ADD COLUMN IF NOT EXISTS detail_withholding_label TEXT NOT NULL DEFAULT 'หัก ณ ที่จ่าย 3%';
    `);
    await client.query(`
      ALTER TABLE template_configs
      ADD COLUMN IF NOT EXISTS detail_net_total_label TEXT NOT NULL DEFAULT 'ยอดสุทธิ';
    `);

    await client.query(`
      ALTER TABLE account_types
      ADD COLUMN IF NOT EXISTS account_name TEXT;
    `);
    await client.query(`
      ALTER TABLE account_types
      ADD COLUMN IF NOT EXISTS account_number TEXT;
    `);
    await client.query(`
      ALTER TABLE account_types
      ADD COLUMN IF NOT EXISTS account_note TEXT;
    `);
    await client.query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS exchange_rate_currency TEXT;
    `);
    await client.query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS parent_order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL;
    `);
    await client.query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS stage TEXT NOT NULL DEFAULT 'WAITING_ORDER_CONFIRMATION';
    `);
    await client.query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS seller_tracking_no TEXT;
    `);
    await client.query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS seller_tracking_added_at TIMESTAMPTZ;
    `);
    await client.query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS thai_warehouse_received_at TIMESTAMPTZ;
    `);
    await client.query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS delivery_method TEXT;
    `);
    await client.query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS delivery_provider TEXT;
    `);
    await client.query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS delivery_tracking_no TEXT;
    `);
    await client.query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS delivery_note TEXT;
    `);
    await client.query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS delivery_updated_at TIMESTAMPTZ;
    `);
    await client.query(`
      ALTER TABLE orders
      DROP CONSTRAINT IF EXISTS orders_status_check;
    `);
    await client.query(`
      ALTER TABLE orders
      ADD CONSTRAINT orders_status_check
      CHECK (status IN ('PENDING','CONFIRMED','UNCONFIRMED','SENT'));
    `);
    await client.query(`
      ALTER TABLE orders
      DROP CONSTRAINT IF EXISTS orders_stage_check;
    `);
    await client.query(`
      ALTER TABLE orders
      ADD CONSTRAINT orders_stage_check
      CHECK (stage IN (
        'WAITING_ORDER_CONFIRMATION',
        'ORDER_CONFIRMED',
        'SELLER_SHIPPED',
        'WAREHOUSE_RECEIVED',
        'IMPORT_INVOICE_SENT',
        'IMPORT_PAID',
        'READY_FOR_DISPATCH',
        'PICKUP_SCHEDULED',
        'DISPATCHED',
        'COMPLETED'
      ));
    `);
    await client.query(`
      ALTER TABLE orders
      DROP CONSTRAINT IF EXISTS orders_delivery_method_check;
    `);
    await client.query(`
      ALTER TABLE orders
      ADD CONSTRAINT orders_delivery_method_check
      CHECK (delivery_method IN ('PICKUP','DELIVERY') OR delivery_method IS NULL);
    `);
    await client.query(`
      UPDATE orders
      SET stage = CASE
        WHEN status = 'CONFIRMED' THEN 'ORDER_CONFIRMED'
        ELSE 'WAITING_ORDER_CONFIRMATION'
      END
      WHERE stage IS NULL;
    `);

    await client.query(`
      ALTER TABLE admin_users
      ADD COLUMN IF NOT EXISTS display_name TEXT;
    `);
    await client.query(`
      ALTER TABLE admin_users
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
    `);
    await client.query(`
      ALTER TABLE admin_users
      ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
    `);
    await client.query(`
      ALTER TABLE admin_users
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
    `);
    await client.query(`
      ALTER TABLE admin_users
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
    `);

    await client.query(`
      ALTER TABLE utm_sessions
      ADD COLUMN IF NOT EXISTS fbclid TEXT;
    `);

    await client.query(`
      ALTER TABLE template_configs
      ADD COLUMN IF NOT EXISTS button_receipt_label TEXT DEFAULT 'คลิกที่นี้';
    `);
    await client.query(`
      ALTER TABLE template_configs
      ADD COLUMN IF NOT EXISTS button_receipt_url TEXT DEFAULT NULL;
    `);

    await client.query(`
      INSERT INTO template_configs (template_type, display_name, accent_color, subtitle, footer_note, is_active)
      VALUES
        ('IMPORT_INVOICE', 'ใบแจ้งหนี้นำเข้า', '#1565c0', 'IMPORT INVOICE', 'กรุณาชำระค่าใช้จ่ายนำเข้าตามบิลนี้', TRUE),
        ('CONFIRM', 'คำสั่งซื้อสินค้า', '#2e7d32', 'PURCHASE ORDER', 'กรุณาตรวจสอบรายละเอียดและยืนยันคำสั่งซื้อ', TRUE),
        ('RECEIPT', 'ใบเสร็จรับเงิน', '#6a1b9a', 'RECEIPT', 'End-to-End Logistics Partner', TRUE)
      ON CONFLICT (template_type) DO NOTHING;
    `);

    await client.query(`
      UPDATE template_configs
      SET footer_note = 'End-to-End Logistics Partner'
      WHERE template_type = 'RECEIPT'
        AND (footer_note IS NULL OR footer_note = 'ใบเสร็จสำหรับรายการที่ยืนยันแล้ว');
    `);

    await client.query(`
      DELETE FROM template_configs
      WHERE template_type = 'INVOICE';
    `);

    await client.query(`
      INSERT INTO account_types (code, label, is_active, sort_order)
      VALUES
        ('KBANK', 'Kbank', TRUE, 10),
        ('SCB', 'SCB', TRUE, 20),
        ('BBL', 'Bangkok Bank', TRUE, 30)
      ON CONFLICT (code) DO NOTHING;
    `);

    const bootstrapUser = process.env.ADMIN_USER || 'admin';
    const bootstrapPass = process.env.ADMIN_PASS;
    const bootstrapDisplayName = process.env.ADMIN_DISPLAY_NAME || 'Administrator';

    if (bootstrapPass) {
      const passwordHash = await bcrypt.hash(bootstrapPass, 10);
      await client.query(
        `INSERT INTO admin_users (username, password_hash, display_name, is_active)
         VALUES ($1, $2, $3, TRUE)
         ON CONFLICT (username) DO NOTHING`,
        [bootstrapUser, passwordHash, bootstrapDisplayName],
      );
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS landing_blocks (
        id          SERIAL PRIMARY KEY,
        type        TEXT NOT NULL CHECK (type IN ('image', 'add_friend', 'hero-full-width')),
        image_url   TEXT,
        label       TEXT,
        button_url  TEXT,
        button_left_pct REAL NOT NULL DEFAULT 50,
        button_top_pct REAL NOT NULL DEFAULT 44,
        button_width_pct REAL NOT NULL DEFAULT 42,
        sort_order  INTEGER NOT NULL DEFAULT 0,
        is_active   BOOLEAN NOT NULL DEFAULT TRUE,
        created_at  TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await client.query(`
      ALTER TABLE landing_blocks ADD COLUMN IF NOT EXISTS label TEXT;
    `);
    await client.query(`
      ALTER TABLE landing_blocks ADD COLUMN IF NOT EXISTS button_url TEXT;
    `);
    await client.query(`
      ALTER TABLE landing_blocks ADD COLUMN IF NOT EXISTS button_left_pct REAL NOT NULL DEFAULT 50;
    `);
    await client.query(`
      ALTER TABLE landing_blocks ADD COLUMN IF NOT EXISTS button_top_pct REAL NOT NULL DEFAULT 44;
    `);
    await client.query(`
      ALTER TABLE landing_blocks ADD COLUMN IF NOT EXISTS button_width_pct REAL NOT NULL DEFAULT 42;
    `);
    await client.query(`
      ALTER TABLE landing_blocks ADD COLUMN IF NOT EXISTS block_height_px INTEGER;
    `);
    // Migrate constraint to include all block types
    await client.query(`
      ALTER TABLE landing_blocks DROP CONSTRAINT IF EXISTS landing_blocks_type_check;
    `);
    await client.query(`
      ALTER TABLE landing_blocks ADD CONSTRAINT landing_blocks_type_check
        CHECK (type IN ('image', 'add_friend', 'hero-full-width', 'hero-full-width-btn-left', 'add_friend_banner', 'add_friend_card', 'hero-with-dynamic-add-line'));
    `);

    // ── Site Config (header / footer) ──────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS site_config (
        key        TEXT PRIMARY KEY,
        value      JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await client.query(`
      INSERT INTO site_config (key, value) VALUES
      ('header', $1::jsonb)
      ON CONFLICT (key) DO NOTHING
    `, [JSON.stringify({
      logo_url: '/logo.png',
      brand_name: 'JAWANDA CARGO',
      nav_links: [
        { label: 'หน้าแรก',        href: 'https://jawandacargo-th.com/' },
        { label: 'เกี่ยวกับเรา',   href: 'https://jawandacargo-th.com/about-us' },
        { label: 'บริการของเรา',   href: 'https://jawandacargo-th.com/services' },
        { label: 'โปรโมชั่นพิเศษ', href: 'https://jawandacargo-th.com/' },
        { label: 'สินค้าแนะนำ',    href: 'https://jawandacargo-th.com/' },
        { label: 'สาระน่ารู้',     href: 'https://jawandacargo-th.com/' },
        { label: 'ติดต่อเรา',      href: 'https://jawandacargo-th.com/contact-us' },
      ],
    })]);
    await client.query(`
      INSERT INTO site_config (key, value) VALUES
      ('footer', $1::jsonb)
      ON CONFLICT (key) DO NOTHING
    `, [JSON.stringify({
      col1_title: 'ติดต่อเรา',
      col1_lines: [
        'โกดังสายไหม-เพิ่มสิน เขตสายไหม',
        'กรุงเทพมหานคร',
        'Line : @jawandacargo',
        'Facebook : @jawandacargo',
        'TEL. 02-165-0162',
        'TEL. 099-420-7491',
      ],
      col2_title: 'เกี่ยวกับเรา',
      col2_brand: 'บริษัท จาวานด้า คาร์โก้',
      col2_desc:  'ผู้ให้บริการสั่งของจากจีน นำเข้าสินค้าจากจีน ครบวงจร ประสบการณ์มากกว่า 10 ปี พร้อมให้คำปรึกษาฟรี ทีมงานไทย-จีนคอยดูแล',
      col3_title: 'ช่องทางการติดต่อ',
      col3_links: [
        { label: 'สอบถาม / เพิ่มเพื่อน คลิกที่นี้', href: 'https://lin.ee/8NQIBi9',                        color: '#06c755' },
        { label: 'ปรึกษาฟรีได้ที่ Facebook',         href: 'https://www.facebook.com/jawandacargo',        color: '#1877f2' },
        { label: 'สายด่วน 099-420-7491',              href: 'tel:0994207491',                               color: '#374151' },
      ],
      copyright: '2026 © Jawanda Cargo · jawandacargo-th.com',
    })]);

    console.log('[db] Schema ready');
  } finally {
    client.release();
  }
}
