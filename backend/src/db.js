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
        template_type TEXT NOT NULL,
        account_type  TEXT,
        amount        NUMERIC(18,2),
        exchange_rate NUMERIC(12,6),
        exchange_rate_currency TEXT,
        total_amount  NUMERIC(18,2),
        status        TEXT NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING','CONFIRMED','UNCONFIRMED')),
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
        subtitle      TEXT,
        footer_note   TEXT,
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
      ALTER TABLE account_types
      ADD COLUMN IF NOT EXISTS account_name TEXT;
    `);
    await client.query(`
      ALTER TABLE account_types
      ADD COLUMN IF NOT EXISTS account_number TEXT;
    `);
    await client.query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS exchange_rate_currency TEXT;
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
      INSERT INTO template_configs (template_type, display_name, accent_color, subtitle, footer_note, is_active)
      VALUES
        ('IMPORT_INVOICE', 'ใบแจ้งหนี้นำเข้า', '#1565c0', 'IMPORT INVOICE', 'กรุณายืนยันภายใน 24 ชั่วโมง', TRUE),
        ('CONFIRM', 'ยืนยันคำสั่งซื้อ', '#2e7d32', 'ORDER CONFIRMATION', 'คำสั่งซื้อได้รับการยืนยันเรียบร้อยแล้ว', TRUE),
        ('RECEIPT', 'ใบเสร็จรับเงิน', '#6a1b9a', 'RECEIPT', 'ใบเสร็จสำหรับรายการที่ยืนยันแล้ว', TRUE)
      ON CONFLICT (template_type) DO NOTHING;
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

    console.log('[db] Schema ready');
  } finally {
    client.release();
  }
}
