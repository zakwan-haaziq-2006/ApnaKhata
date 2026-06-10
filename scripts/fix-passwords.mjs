// One-time script to re-hash all plaintext passwords in Aiven MySQL
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const pool = await mysql.createConnection({
  uri: process.env.DATABASE_URL?.replace('?ssl-mode=REQUIRED', ''),
  ssl: { rejectUnauthorized: false },
});

console.log('🔌 Connected to Aiven MySQL');

// Known plaintext passwords per username
const credentials = [
  { username: 'test',  plaintext: 'test@123' },
  { username: 'bata',  plaintext: 'password' },
  { username: 'care',  plaintext: 'password' },
];

for (const { username, plaintext } of credentials) {
  // Check if password is already a bcrypt hash (starts with $2b$ or $2a$)
  const [rows] = await pool.execute('SELECT id, password FROM shops WHERE username = ?', [username]);
  if (rows.length === 0) {
    console.log(`⚠️  User "${username}" not found — skipping`);
    continue;
  }
  const current = rows[0].password;
  if (current.startsWith('$2b$') || current.startsWith('$2a$')) {
    console.log(`✅ "${username}" already has bcrypt hash — skipping`);
    continue;
  }
  const hash = await bcrypt.hash(plaintext, 10);
  await pool.execute('UPDATE shops SET password = ? WHERE username = ?', [hash, username]);
  console.log(`✅ "${username}" password updated to bcrypt hash`);
}

await pool.end();
console.log('\n🎉 Done! All passwords are now bcrypt hashed.');
