import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const conn = await mysql.createConnection({
  uri: process.env.DATABASE_URL?.replace('?ssl-mode=REQUIRED', ''),
  ssl: { rejectUnauthorized: false },
});

// Select fields we want to inspect
const [rows] = await conn.execute(
  'SELECT id, username, shop_name, owner_name, category, subscription_status, renewal_date, plan_duration FROM shops'
);

console.log('\n📋 --- SHOPS (USERS) TABLE ---');
console.table(rows);

await conn.end();
