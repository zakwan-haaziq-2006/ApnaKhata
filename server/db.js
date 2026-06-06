import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
dotenv.config();

export const mysqlPool = mysql.createPool({
  uri: process.env.DATABASE_URL?.replace('?ssl-mode=REQUIRED', ''),
  multipleStatements: true,
  ssl: process.env.DATABASE_URL?.includes('ssl-mode=REQUIRED') ? { rejectUnauthorized: false } : false,
});

class ClientWrapper {
  constructor(connection) {
    this.connection = connection;
  }

  async query(sql, params = []) {
    const upperSql = sql.trim().toUpperCase();
    if (upperSql === 'BEGIN') {
      await this.connection.beginTransaction();
      return { rows: [], rowCount: 0 };
    }
    if (upperSql === 'COMMIT') {
      await this.connection.commit();
      return { rows: [], rowCount: 0 };
    }
    if (upperSql === 'ROLLBACK') {
      await this.connection.rollback();
      return { rows: [], rowCount: 0 };
    }

    const [result] = await this.connection.execute(sql, params);
    const rows = Array.isArray(result) ? result : [];
    const rowCount = Array.isArray(result) ? result.length : (result.affectedRows || 0);
    return { rows, rowCount };
  }

  release() {
    this.connection.release();
  }
}

export const pool = {
  async query(sql, params = []) {
    const [result] = await mysqlPool.execute(sql, params);
    const rows = Array.isArray(result) ? result : [];
    const rowCount = Array.isArray(result) ? result.length : (result.affectedRows || 0);
    return { rows, rowCount };
  },
  async connect() {
    const connection = await mysqlPool.getConnection();
    return new ClientWrapper(connection);
  }
};

// ─── DDL ─────────────────────────────────────────────────────────────────────
const DDL = `
CREATE TABLE IF NOT EXISTS shops (
  id                   VARCHAR(100) PRIMARY KEY,
  username             VARCHAR(100) UNIQUE NOT NULL,
  password             VARCHAR(255) NOT NULL,
  shop_name            VARCHAR(255) NOT NULL,
  owner_name           VARCHAR(255) NOT NULL,
  category             VARCHAR(100) NOT NULL DEFAULT 'Grocery',
  subscription_status  VARCHAR(50)  NOT NULL DEFAULT 'active',
  renewal_date         VARCHAR(100),
  plan_duration        INT NOT NULL DEFAULT 1,
  plan_price           INT NOT NULL DEFAULT 249,
  sales                INT NOT NULL DEFAULT 0,
  profit               INT NOT NULL DEFAULT 0,
  expenses             INT NOT NULL DEFAULT 0,
  items_sold           INT NOT NULL DEFAULT 0,
  customers_visited    INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS stock_items (
  id            BIGINT PRIMARY KEY,
  shop_id       VARCHAR(100) NOT NULL,
  name          VARCHAR(255) NOT NULL,
  category      VARCHAR(100) NOT NULL,
  stock         DECIMAL(10,2) NOT NULL DEFAULT 0,
  price         INT NOT NULL DEFAULT 0,
  buying_price  INT NOT NULL DEFAULT 0,
  min_stock     INT NOT NULL DEFAULT 5,
  is_loose      BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bills (
  id             VARCHAR(100) PRIMARY KEY,
  shop_id        VARCHAR(100) NOT NULL,
  time           VARCHAR(100) NOT NULL,
  date           VARCHAR(50) NOT NULL,
  items          INT NOT NULL DEFAULT 0,
  total          INT NOT NULL DEFAULT 0,
  amount         INT NOT NULL DEFAULT 0,
  payment_method VARCHAR(50) NOT NULL DEFAULT 'CASH',
  discount       INT NOT NULL DEFAULT 0,
  items_list     TEXT NOT NULL,
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS expenses (
  id             VARCHAR(100) PRIMARY KEY,
  shop_id        VARCHAR(100) NOT NULL,
  date           VARCHAR(50) NOT NULL,
  time           VARCHAR(100) NOT NULL,
  description    VARCHAR(255) NOT NULL,
  category       VARCHAR(100) NOT NULL,
  amount         INT NOT NULL DEFAULT 0,
  payment_method VARCHAR(50) NOT NULL DEFAULT 'CASH',
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
  id      BIGINT PRIMARY KEY,
  shop_id VARCHAR(100) NOT NULL,
  text    TEXT NOT NULL,
  time    VARCHAR(100) NOT NULL,
  \`read\`  BOOLEAN NOT NULL DEFAULT FALSE,
  type    VARCHAR(50) NOT NULL DEFAULT 'info',
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
);
`;

// ─── Public API ──────────────────────────────────────────────────────────────
export async function initDb() {
  const connection = await mysqlPool.getConnection();
  try {
    await connection.beginTransaction();

    // Execute DDL statements to ensure tables exist
    const statements = DDL.split(';').map(s => s.trim()).filter(s => s.length > 0);
    for (const statement of statements) {
      await connection.query(statement);
    }

    // Incremental column check for existing database
    const [shopsColumns] = await connection.query("SHOW COLUMNS FROM shops");
    const columnNames = shopsColumns.map(c => c.Field.toLowerCase());
    
    if (!columnNames.includes('plan_duration')) {
      await connection.query("ALTER TABLE shops ADD COLUMN plan_duration INT NOT NULL DEFAULT 1");
    }
    if (!columnNames.includes('plan_price')) {
      await connection.query("ALTER TABLE shops ADD COLUMN plan_price INT NOT NULL DEFAULT 249");
    }

    // Seed Demo Data ONLY if explicit environment flag SEED_DEMO_DATA=true is set
    if (process.env.SEED_DEMO_DATA === 'true') {
      console.log('🔄 Seeding demo data into database...');
      await connection.query('SET FOREIGN_KEY_CHECKS = 0');
      await connection.query('TRUNCATE TABLE notifications');
      await connection.query('TRUNCATE TABLE expenses');
      await connection.query('TRUNCATE TABLE bills');
      await connection.query('TRUNCATE TABLE stock_items');
      await connection.query('TRUNCATE TABLE shops');
      await connection.query('SET FOREIGN_KEY_CHECKS = 1');

      const todayStr = new Date().toISOString().split('T')[0];
      
      const hashedTestPassword = await bcrypt.hash('test@123', 10);
      const hashedPassword = await bcrypt.hash('password', 10);

      // 1. Seed Shops
      await connection.query(`
        INSERT INTO shops (id, username, password, shop_name, owner_name, category, subscription_status, renewal_date, plan_duration, plan_price, sales, profit, expenses, items_sold, customers_visited) VALUES
        ('test_merchant', 'test', ?, 'Kirana Bazaar', 'Rajesh Kumar', 'Grocery', 'active', DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 30 DAY), '%Y-%m-%d'), 12, 1599, 14500, 4200, 2300, 320, 85),
        ('shop_bata', 'bata', ?, 'Bata Footwear', 'Anil Sharma', 'Clothing', 'active', DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 60 DAY), '%Y-%m-%d'), 6, 799, 28000, 9500, 4500, 140, 210),
        ('shop_care', 'care', ?, 'Care Pharmacy', 'Dr. Sunita Patel', 'Pharmacy', 'expired', 'Expired', 1, 149, 42000, 12500, 6800, 980, 450)
      `, [hashedTestPassword, hashedPassword, hashedPassword]);

      // 2. Seed Stock Items for test_merchant
      await connection.query(`
        INSERT INTO stock_items (id, shop_id, name, category, stock, price, buying_price, min_stock, is_loose) VALUES
        (1, 'test_merchant', 'Parle-G Biscuit', 'Biscuits', 45.00, 12, 8, 10, FALSE),
        (2, 'test_merchant', 'Tata Salt 1kg', 'Groceries', 32.00, 26, 20, 8, FALSE),
        (3, 'test_merchant', 'Surf Excel 500g', 'Detergents', 15.00, 70, 55, 5, FALSE),
        (4, 'test_merchant', 'Maggi Noodles', 'Packaged Food', 4.00, 25, 18, 12, FALSE),
        (5, 'test_merchant', 'Colgate 150g', 'Personal Care', 22.00, 40, 30, 6, FALSE),
        (6, 'test_merchant', 'Aashirvaad Atta 5kg', 'Groceries', 2.00, 240, 200, 5, FALSE),
        (7, 'test_merchant', 'Tata Tea 250g', 'Groceries', 1.00, 110, 90, 4, FALSE),
        (8, 'test_merchant', 'Fresh Potatoes (per Kg)', 'Vegetables', 80.00, 30, 18, 15, TRUE),
        (9, 'test_merchant', 'Onions Nasik (per Kg)', 'Vegetables', 9.00, 40, 25, 15, TRUE)
      `);

      // 3. Seed Bills for test_merchant
      const seedDateStr = todayStr.replace(/-/g, '');
      await connection.query(`
        INSERT INTO bills (id, shop_id, time, date, items, total, amount, payment_method, discount, items_list) VALUES
        (?, 'test_merchant', '10:15 AM', ?, 3, 108, 108, 'CASH', 0, 'Parle-G Biscuit, Tata Salt 1kg, Surf Excel 500g'),
        (?, 'test_merchant', '12:30 PM', ?, 3, 135, 120, 'UPI', 15, 'Maggi Noodles, Colgate 150g, Fresh Potatoes (per Kg)'),
        (?, 'test_merchant', '02:45 PM', ?, 2, 350, 350, 'CARD', 0, 'Aashirvaad Atta 5kg, Tata Tea 250g')
      `, [
        `KB-${seedDateStr}-01`, todayStr,
        `KB-${seedDateStr}-02`, todayStr,
        `KB-${seedDateStr}-03`, todayStr
      ]);

      // 4. Seed Expenses for test_merchant
      await connection.query(`
        INSERT INTO expenses (id, shop_id, date, time, description, category, amount, payment_method) VALUES
        ('exp_01', 'test_merchant', ?, '09:30 AM', 'Electricity Bill', 'Utilities', 1200, 'UPI'),
        ('exp_02', 'test_merchant', ?, '11:00 AM', 'Store Assistant Wage', 'Salaries', 800, 'CASH'),
        ('exp_03', 'test_merchant', ?, '04:00 PM', 'Repaired Front Door Lock', 'Repairs', 300, 'CASH')
      `, [todayStr, todayStr, todayStr]);

      // 5. Seed Notifications for test_merchant
      await connection.query(`
        INSERT INTO notifications (id, shop_id, text, time, \`read\`, type) VALUES
        (1001, 'test_merchant', 'Aashirvaad Atta 5kg is low in stock! Only 2 left.', '1 hour ago', FALSE, 'warning'),
        (1002, 'test_merchant', 'Tata Tea 250g is low in stock! Only 1 left.', '2 hours ago', FALSE, 'warning'),
        (1003, 'test_merchant', 'Daily sales target of ₹5,000 achieved!', '3 hours ago', FALSE, 'info')
      `);
    }

    await connection.commit();
    console.log('✅ ApnaKhata MySQL database initialized successfully.');
  } catch (err) {
    await connection.rollback();
    console.error('❌ Database initialization failed:', err.message);
    throw err;
  } finally {
    connection.release();
  }
}
