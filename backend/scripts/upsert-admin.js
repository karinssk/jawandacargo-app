import bcrypt from 'bcryptjs';
import { pool } from '../src/db.js';

async function main() {
  const [, , usernameArg, passwordArg, displayNameArg] = process.argv;
  const username = usernameArg?.trim();
  const password = passwordArg || '';
  const displayName = displayNameArg?.trim() || username;

  if (!username || !password) {
    console.error('Usage: npm run admin:upsert -- <username> <password> [displayName]');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await pool.query(
    `INSERT INTO admin_users (username, password_hash, display_name, is_active)
     VALUES ($1, $2, $3, TRUE)
     ON CONFLICT (username) DO UPDATE
       SET password_hash = EXCLUDED.password_hash,
           display_name = EXCLUDED.display_name,
           is_active = TRUE,
           updated_at = NOW()`,
    [username, passwordHash, displayName],
  );

  console.log(`[admin] Upserted admin user: ${username}`);
}

main()
  .catch((err) => {
    console.error('[admin] Failed to upsert admin user:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
