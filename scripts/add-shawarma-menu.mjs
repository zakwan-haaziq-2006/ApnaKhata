import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const conn = await mysql.createConnection({
  uri: process.env.DATABASE_URL?.replace('?ssl-mode=REQUIRED', ''),
  ssl: { rejectUnauthorized: false },
});

console.log('🔌 Connected to database...');

// 1. Check if the Shawarma Corner shop exists
let [shops] = await conn.execute('SELECT id, shop_name FROM shops WHERE shop_name LIKE ?', ['%Shawarma%']);

if (shops.length === 0) {
  console.log('📝 Shawarma Corner shop not found. Creating it now...');
  const passwordHash = await bcrypt.hash('password', 10);
  const renewalDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  await conn.execute(
    `INSERT INTO shops (id, username, password, shop_name, owner_name, category, subscription_status, renewal_date, plan_duration, plan_price, sales, profit, expenses, items_sold, customers_visited)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['shawarma_corner', 'shawarma', passwordHash, 'Shawarma Corner', 'Zakwan', 'Food Hotel', 'active', renewalDate, 1, 149, 0, 0, 0, 0, 0]
  );
  
  // Re-fetch
  [shops] = await conn.execute('SELECT id, shop_name FROM shops WHERE id = ?', ['shawarma_corner']);
  console.log('✅ Shawarma Corner shop created (username: shawarma, password: password).');
}

const shop = shops[0];
console.log(`🎯 Targeting shop: ${shop.shop_name} (ID: ${shop.id})`);

// 2. Clear existing items for this shop to avoid duplication
await conn.execute('DELETE FROM stock_items WHERE shop_id = ?', [shop.id]);
console.log('🧹 Cleared existing menu items for this shop.');

// 3. Define the menu items to insert
const rawMenu = [
  // Special Hyderabad Biriyani
  { name: 'Hyd Biryani (Quarter)', category: 'Biryani', price: 70 },
  { name: 'Hyd Biryani (Half)', category: 'Biryani', price: 140 },

  // Shawarma Roll
  { name: 'Arabian Shawarma Roll', category: 'Starters', price: 90 },
  { name: 'Mexican Shawarma Roll', category: 'Starters', price: 100 },
  { name: 'Special Arabian Shawarma Roll', category: 'Starters', price: 110 },
  { name: 'Special Mexican Shawarma Roll', category: 'Starters', price: 120 },

  // Shawarma Plate
  { name: 'Arabian Shawarma Plate', category: 'Starters', price: 110 },
  { name: 'Mexican Shawarma Plate', category: 'Starters', price: 120 },
  { name: 'Special Arabian Shawarma Plate', category: 'Starters', price: 130 },
  { name: 'Special Mexican Shawarma Plate', category: 'Starters', price: 140 },

  // Tikka
  { name: 'Chicken Tikka', category: 'Starters', price: 120 },
  { name: 'Malai Tikka', category: 'Starters', price: 120 },
  { name: 'Hariyali Tikka', category: 'Starters', price: 120 },
  { name: 'Alfaham Tikka', category: 'Starters', price: 120 },

  // Tandoori
  { name: 'Tandoori (Full)', category: 'Starters', price: 450 },
  { name: 'Tandoori (Half)', category: 'Starters', price: 240 },
  { name: 'Tandoori (Quarter)', category: 'Starters', price: 120 },

  // Alfaham
  { name: 'Alfaham (Full)', category: 'Starters', price: 450 },
  { name: 'Alfaham (Half)', category: 'Starters', price: 240 },
  { name: 'Alfaham (Quarter)', category: 'Starters', price: 120 },

  // Afghani
  { name: 'Afghani (Full)', category: 'Starters', price: 450 },
  { name: 'Afghani (Half)', category: 'Starters', price: 240 },
  { name: 'Afghani (Quarter)', category: 'Starters', price: 120 },

  // Pepper Chicken
  { name: 'Pepper Chicken (Full)', category: 'Starters', price: 450 },
  { name: 'Pepper Chicken (Half)', category: 'Starters', price: 240 },
  { name: 'Pepper Chicken (Quarter)', category: 'Starters', price: 120 },

  // BBQ Chicken
  { name: 'BBQ Chicken (Full)', category: 'Starters', price: 450 },
  { name: 'BBQ Chicken (Half)', category: 'Starters', price: 240 },
  { name: 'BBQ Chicken (Quarter)', category: 'Starters', price: 120 },

  // Hariyali Chicken
  { name: 'Hariyali Chicken (Full)', category: 'Starters', price: 450 },
  { name: 'Hariyali Chicken (Half)', category: 'Starters', price: 240 },
  { name: 'Hariyali Chicken (Quarter)', category: 'Starters', price: 120 },

  // Chicken Dry
  { name: 'Chilli Chicken', category: 'Starters', price: 150 },
  { name: 'Chicken Manchurian', category: 'Starters', price: 150 },
  { name: 'Dragon Chicken', category: 'Starters', price: 150 },
  { name: 'Chicken 65', category: 'Starters', price: 120 },
  { name: 'Hydrabadi Chicken', category: 'Starters', price: 150 },
  { name: 'Chicken Lollipop (6 pcs)', category: 'Starters', price: 120 },
  { name: 'Lollipop Manchurian', category: 'Starters', price: 150 },
  { name: 'Garlic Manchurian', category: 'Starters', price: 150 },
  { name: 'Ginger Manchurian', category: 'Starters', price: 150 },

  // Gravy
  { name: 'Butter Chicken', category: 'Main Course', price: 170 },
  { name: 'Kadai Chicken', category: 'Main Course', price: 170 },
  { name: 'Pepper Chicken (Gravy)', category: 'Main Course', price: 170 },
  { name: 'Chicken Masala', category: 'Main Course', price: 170 },
  { name: 'Punjabi Chicken Gravy', category: 'Main Course', price: 170 },
  { name: 'Tandoori (Butter Chicken)', category: 'Main Course', price: 200 },
  { name: 'Tikka (Butter Chicken)', category: 'Main Course', price: 200 },
  { name: 'Chettinad Chicken Gravy', category: 'Main Course', price: 170 },

  // Roti / Naan
  { name: 'Tandoori Roti', category: 'Breads', price: 20 },
  { name: 'Butter Tandoori Roti', category: 'Breads', price: 25 },
  { name: 'Naan', category: 'Breads', price: 25 },
  { name: 'Butter Naan', category: 'Breads', price: 30 },
  { name: 'Romali Roti', category: 'Breads', price: 25 },
  { name: 'Plain Naan', category: 'Breads', price: 25 },
  { name: 'Butter Kulcha', category: 'Breads', price: 20 },
  { name: 'Masala Kulcha', category: 'Breads', price: 25 },
  { name: 'Plain Kulcha', category: 'Breads', price: 20 },
  { name: 'Coriander Naan', category: 'Breads', price: 25 },
  { name: 'Pudina Naan', category: 'Breads', price: 25 },
  { name: 'Masala Naan', category: 'Breads', price: 30 },
  { name: 'Garlic Naan', category: 'Breads', price: 30 },

  // Fried Rice
  { name: 'Veg Fried Rice', category: 'Main Course', price: 110 },
  { name: 'Egg Fried Rice', category: 'Main Course', price: 110 },
  { name: 'Chicken Fried Rice', category: 'Main Course', price: 120 },
  { name: 'Schez Chicken Fried Rice', category: 'Main Course', price: 130 },
  { name: 'Schez Veg Fried Rice', category: 'Main Course', price: 120 },
  { name: 'Schez Egg Fried Rice', category: 'Main Course', price: 120 },

  // Noodles
  { name: 'Veg Noodles', category: 'Main Course', price: 110 },
  { name: 'Egg Noodles', category: 'Main Course', price: 110 },
  { name: 'Chicken Noodles', category: 'Main Course', price: 120 },
  { name: 'Schez Chicken Noodles', category: 'Main Course', price: 130 },
  { name: 'Schez Veg Noodles', category: 'Main Course', price: 120 },
  { name: 'Schez Egg Noodles', category: 'Main Course', price: 120 },

  // Parotta
  { name: 'Parotta (1)', category: 'Breads', price: 25 },
  { name: 'Ceylon Parotta', category: 'Breads', price: 30 },
  { name: 'Spl Egg Parotta', category: 'Breads', price: 40 },
  { name: 'Mughal Parotta', category: 'Breads', price: 100 },
  { name: 'Spl Mughal Parotta', category: 'Breads', price: 140 },

  // Chicken Roll
  { name: 'Egg Roll', category: 'Starters', price: 100 },
  { name: 'Chicken Roll', category: 'Starters', price: 110 },
  { name: 'Basha Roll', category: 'Starters', price: 150 },

  // Soup
  { name: 'Sweet Corn Soup', category: 'Beverages', price: 80 },
  { name: 'Hot & Sour Soup', category: 'Beverages', price: 100 },

  // Sea Food
  { name: 'Fish', category: 'Main Course', price: 120 },
  { name: 'Finger Fish', category: 'Main Course', price: 120 }
];

let insertedCount = 0;
for (const item of rawMenu) {
  const itemId = Date.now() + insertedCount; // unique timestamp ID
  const localizedName = JSON.stringify({
    en: item.name,
    ta: item.name,
    ur: item.name
  });
  
  // Set buying price as approx 60% of price for demo reports, stock 999999 for restaurant unlimited
  const buyingPrice = Math.round(item.price * 0.6);

  await conn.execute(
    'INSERT INTO stock_items (id, shop_id, name, category, stock, price, buying_price, min_stock, is_loose) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [itemId, shop.id, localizedName, item.category, 999999, item.price, buyingPrice, 0, false]
  );
  insertedCount++;
}

console.log(`\n🎉 Success! Seeded ${insertedCount} menu items for ${shop.shop_name}!`);
console.log('🔑 Credentials:');
console.log('   Username: shawarma');
console.log('   Password: password');
await conn.end();
