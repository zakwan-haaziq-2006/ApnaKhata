import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const conn = await mysql.createConnection({
  uri: process.env.DATABASE_URL?.replace('?ssl-mode=REQUIRED', ''),
  ssl: { rejectUnauthorized: false },
});

await conn.execute('SET FOREIGN_KEY_CHECKS = 0');
await conn.execute('TRUNCATE TABLE notifications');
await conn.execute('TRUNCATE TABLE expenses');
await conn.execute('TRUNCATE TABLE bills');
await conn.execute('TRUNCATE TABLE stock_items');
await conn.execute('TRUNCATE TABLE shops');
await conn.execute('SET FOREIGN_KEY_CHECKS = 1');

console.log('✅ All data cleared from database.');
await conn.end();
