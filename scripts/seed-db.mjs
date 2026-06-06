import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const conn = await mysql.createConnection({
  uri: process.env.DATABASE_URL?.replace('?ssl-mode=REQUIRED', ''),
  ssl: { rejectUnauthorized: false },
});

console.log('🔌 Connected — wiping and reseeding...');

// Force wipe
await conn.execute('SET FOREIGN_KEY_CHECKS = 0');
await conn.execute('TRUNCATE TABLE notifications');
await conn.execute('TRUNCATE TABLE expenses');
await conn.execute('TRUNCATE TABLE bills');
await conn.execute('TRUNCATE TABLE stock_items');
await conn.execute('TRUNCATE TABLE shops');
await conn.execute('SET FOREIGN_KEY_CHECKS = 1');
console.log('🗑️  All tables cleared');

const todayStr  = new Date().toISOString().split('T')[0];
const renewal30 = new Date(Date.now() + 30  * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const renewal60 = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

const testHash    = await bcrypt.hash('test@123', 10);
const defaultHash = await bcrypt.hash('password', 10);

// Insert shops one by one to avoid multi-row param issue
await conn.execute(
  `INSERT INTO shops (id,username,password,shop_name,owner_name,category,subscription_status,renewal_date,plan_duration,plan_price,sales,profit,expenses,items_sold,customers_visited)
   VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  ['test_merchant','test',testHash,'Kirana Bazaar','Rajesh Kumar','Grocery','active',renewal30,12,1999,14500,4200,2300,320,85]
);
await conn.execute(
  `INSERT INTO shops (id,username,password,shop_name,owner_name,category,subscription_status,renewal_date,plan_duration,plan_price,sales,profit,expenses,items_sold,customers_visited)
   VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  ['shop_bata','bata',defaultHash,'Bata Footwear','Anil Sharma','Clothing','active',renewal60,6,1199,28000,9500,4500,140,210]
);
await conn.execute(
  `INSERT INTO shops (id,username,password,shop_name,owner_name,category,subscription_status,renewal_date,plan_duration,plan_price,sales,profit,expenses,items_sold,customers_visited)
   VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  ['shop_care','care',defaultHash,'Care Pharmacy','Dr. Sunita Patel','Pharmacy','expired','Expired',1,249,42000,12500,6800,980,450]
);
console.log('✅ Shops inserted');

// Stock items
const stockItems = [
  [1,'test_merchant','Parle-G Biscuit',       'Biscuits',      45, 12,  8, 10, false],
  [2,'test_merchant','Tata Salt 1kg',          'Groceries',     32, 26, 20,  8, false],
  [3,'test_merchant','Surf Excel 500g',        'Detergents',    15, 70, 55,  5, false],
  [4,'test_merchant','Maggi Noodles',          'Packaged Food',  4, 25, 18, 12, false],
  [5,'test_merchant','Colgate 150g',           'Personal Care', 22, 40, 30,  6, false],
  [6,'test_merchant','Aashirvaad Atta 5kg',    'Groceries',      2,240,200,  5, false],
  [7,'test_merchant','Tata Tea 250g',          'Groceries',      1,110, 90,  4, false],
  [8,'test_merchant','Fresh Potatoes (per Kg)','Vegetables',    80, 30, 18, 15, true],
  [9,'test_merchant','Onions Nasik (per Kg)',  'Vegetables',     9, 40, 25, 15, true],
];
for (const row of stockItems) {
  await conn.execute(
    'INSERT INTO stock_items (id,shop_id,name,category,stock,price,buying_price,min_stock,is_loose) VALUES (?,?,?,?,?,?,?,?,?)',
    row
  );
}
console.log('✅ Stock items inserted');

// Bills
const seedDateStr = todayStr.replace(/-/g, '');
const bills = [
  [`KB-${seedDateStr}-01`,'test_merchant','10:15 AM',todayStr,3,108,108,'CASH', 0,'Parle-G Biscuit, Tata Salt 1kg, Surf Excel 500g'],
  [`KB-${seedDateStr}-02`,'test_merchant','12:30 PM',todayStr,3,135,120,'UPI', 15,'Maggi Noodles, Colgate 150g, Fresh Potatoes (per Kg)'],
  [`KB-${seedDateStr}-03`,'test_merchant','02:45 PM',todayStr,2,350,350,'CARD', 0,'Aashirvaad Atta 5kg, Tata Tea 250g'],
];
for (const row of bills) {
  await conn.execute(
    'INSERT INTO bills (id,shop_id,time,date,items,total,amount,payment_method,discount,items_list) VALUES (?,?,?,?,?,?,?,?,?,?)',
    row
  );
}
console.log('✅ Bills inserted');

// Expenses
const expenses = [
  ['exp_01','test_merchant',todayStr,'09:30 AM','Electricity Bill',        'Utilities',1200,'UPI'],
  ['exp_02','test_merchant',todayStr,'11:00 AM','Store Assistant Wage',    'Salaries',  800,'CASH'],
  ['exp_03','test_merchant',todayStr,'04:00 PM','Repaired Front Door Lock','Repairs',   300,'CASH'],
];
for (const row of expenses) {
  await conn.execute(
    'INSERT INTO expenses (id,shop_id,date,time,description,category,amount,payment_method) VALUES (?,?,?,?,?,?,?,?)',
    row
  );
}
console.log('✅ Expenses inserted');

// Notifications
await conn.execute('INSERT INTO notifications (id,shop_id,text,time,`read`,type) VALUES (?,?,?,?,?,?)',
  [1001,'test_merchant','Aashirvaad Atta 5kg is low in stock! Only 2 left.','1 hour ago',false,'warning']);
await conn.execute('INSERT INTO notifications (id,shop_id,text,time,`read`,type) VALUES (?,?,?,?,?,?)',
  [1002,'test_merchant','Tata Tea 250g is low in stock! Only 1 left.','2 hours ago',false,'warning']);
await conn.execute('INSERT INTO notifications (id,shop_id,text,time,`read`,type) VALUES (?,?,?,?,?,?)',
  [1003,'test_merchant','Daily sales target of ₹5,000 achieved!','3 hours ago',false,'info']);
console.log('✅ Notifications inserted');

await conn.end();
console.log('\n🎉 Done! Login: test / test@123');
