/**
 * reset-followers.js
 *
 * Fetch followers from LINE API and/or clear their data from the local DB
 * so you can re-test follow / add-friend events cleanly.
 *
 * Usage:
 *   node scripts/reset-followers.js --list              list all follower IDs from LINE API
 *   node scripts/reset-followers.js --all               reset every LINE user in the DB
 *   node scripts/reset-followers.js <userId> [userId2]  reset specific users
 */

const path = require('path');
const https = require('https');
const Database = require('better-sqlite3');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const dbPath = path.join(__dirname, '..', 'data', 'tracking.db');

if (!TOKEN) {
  console.error('[ERROR] LINE_CHANNEL_ACCESS_TOKEN is not set in .env');
  process.exit(1);
}

const db = new Database(dbPath);

// --- LINE API helper ---
function lineGet(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.line.me',
      path,
      method: 'GET',
      headers: { Authorization: `Bearer ${TOKEN}` },
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

// Fetch all follower IDs (paginated)
async function fetchAllFollowers() {
  const ids = [];
  let next = null;
  do {
    const url = next
      ? `/v2/bot/followers/ids?continuationToken=${next}`
      : '/v2/bot/followers/ids';
    const { status, data } = await lineGet(url);
    if (status !== 200) {
      console.error(`[ERROR] LINE API returned ${status}:`, data);
      process.exit(1);
    }
    ids.push(...(data.userIds || []));
    next = data.next || null;
  } while (next);
  return ids;
}

// --- DB helpers ---
function resetUser(userId) {
  const record = db.prepare('SELECT * FROM leads WHERE line_user_id = ?').get(userId);
  if (!record) {
    console.log(`  [SKIP] ${userId} — not found in DB`);
    return;
  }

  const hasUtm = record.utm_source || record.utm_medium || record.utm_campaign;
  if (hasUtm) {
    // Keep the UTM record, just wipe LINE fields so follow event can re-link it
    db.prepare(`
      UPDATE leads SET
        line_user_id = NULL, line_display_name = NULL,
        line_picture = NULL, line_status_message = NULL, linked_at = NULL
      WHERE line_user_id = ?
    `).run(userId);
    console.log(`  [CLEAR] ${userId} — LINE data cleared (UTM record kept)`);
  } else {
    // Pure direct- record with no UTM — delete entirely
    db.prepare('DELETE FROM leads WHERE line_user_id = ?').run(userId);
    console.log(`  [DELETE] ${userId} — direct record deleted`);
  }
}

// --- Main ---
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage:');
    console.log('  node scripts/reset-followers.js --list              list followers from LINE API');
    console.log('  node scripts/reset-followers.js --all               reset all LINE users in DB');
    console.log('  node scripts/reset-followers.js <userId> [...]      reset specific users');
    process.exit(0);
  }

  if (args[0] === '--list') {
    console.log('Fetching followers from LINE API...');
    const ids = await fetchAllFollowers();
    console.log(`Total followers: ${ids.length}`);
    ids.forEach((id) => console.log(' ', id));
    return;
  }

  if (args[0] === '--all') {
    console.log('Fetching followers from LINE API...');
    const ids = await fetchAllFollowers();
    console.log(`Found ${ids.length} followers. Resetting DB records...`);
    ids.forEach(resetUser);

    // Also delete any direct- records not covered above
    const { changes } = db.prepare(`
      DELETE FROM leads WHERE tracking_id LIKE 'direct-%'
        AND line_user_id IS NULL
        AND utm_source IS NULL AND utm_medium IS NULL AND utm_campaign IS NULL
    `).run();
    if (changes > 0) console.log(`  [DELETE] ${changes} orphan direct- record(s) removed`);

    console.log('Done. Users can now re-follow to trigger fresh follow events.');
    return;
  }

  // Specific user IDs
  for (const userId of args) {
    resetUser(userId);
  }
  console.log('Done.');
}

main().catch((err) => {
  console.error('[ERROR]', err.message || err);
  process.exit(1);
});
