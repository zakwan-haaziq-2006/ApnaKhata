import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const conn = await mysql.createConnection({
  uri: process.env.DATABASE_URL?.replace('?ssl-mode=REQUIRED', ''),
  ssl: { rejectUnauthorized: false },
});

const [rows] = await conn.execute('SELECT id, username, subscription_status, renewal_date FROM shops');
console.log(JSON.stringify(rows, null, 2));
await conn.end();
