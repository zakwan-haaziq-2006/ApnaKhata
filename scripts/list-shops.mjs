import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const conn = await mysql.createConnection({
  uri: process.env.DATABASE_URL?.replace('?ssl-mode=REQUIRED', ''),
  ssl: { rejectUnauthorized: false },
});

const [rows] = await conn.execute('SELECT id, username, shop_name, category FROM shops');
console.log('Registered Shops:', rows);
await conn.end();
