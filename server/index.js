import crypto from 'node:crypto';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import Razorpay from 'razorpay';
import bcrypt from 'bcryptjs';
import { pool, initDb } from './db.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const monthlyFee = 499;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ─── Razorpay helper ─────────────────────────────────────────────────────────
function getRazorpayClient() {
  const isMock = !process.env.RAZORPAY_KEY_ID || 
                 process.env.RAZORPAY_KEY_ID.includes('your_key_id') || 
                 !process.env.RAZORPAY_KEY_SECRET || 
                 process.env.RAZORPAY_KEY_SECRET.includes('your_test_key_secret');
  if (isMock) {
    return null;
  }
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
}

function makeNextRenewalDate() {
  const next = new Date();
  next.setMonth(next.getMonth() + 1);
  return next.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Map postgres snake_case row → camelCase for frontend
function shopRowToClient(row) {
  return {
    id: row.id,
    username: row.username,
    shopName: row.shop_name,
    ownerName: row.owner_name,
    category: row.category,
    subscriptionStatus: row.subscription_status,
    renewalDate: row.renewal_date,
    planDuration: row.plan_duration !== undefined && row.plan_duration !== null ? Number(row.plan_duration) : 1,
    planPrice: row.plan_price !== undefined && row.plan_price !== null ? Number(row.plan_price) : 249,
    metrics: {
      sales: Number(row.sales),
      profit: Number(row.profit),
      expenses: Number(row.expenses),
      itemsSold: Number(row.items_sold),
      customersVisited: Number(row.customers_visited),
    }
  };
}

function stockRowToClient(row) {
  return {
    id: Number(row.id),
    name: row.name,
    category: row.category,
    stock: Number(row.stock),
    price: Number(row.price),
    buyingPrice: Number(row.buying_price),
    minStock: Number(row.min_stock),
    isLoose: row.is_loose,
  };
}

function billRowToClient(row) {
  return {
    id: row.id,
    time: row.time,
    date: row.date,
    items: Number(row.items),
    total: Number(row.total),
    amount: Number(row.amount),
    paymentMethod: row.payment_method,
    discount: Number(row.discount),
    itemsList: row.items_list,
  };
}

function expenseRowToClient(row) {
  return {
    id: row.id,
    date: row.date,
    time: row.time,
    description: row.description,
    category: row.category,
    amount: Number(row.amount),
    paymentMethod: row.payment_method,
  };
}

function notifRowToClient(row) {
  return {
    id: Number(row.id),
    text: row.text,
    time: row.time,
    read: row.read,
    type: row.type,
  };
}

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ ok: true }));

// ─── AUTH ─────────────────────────────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const { rows } = await pool.query(
      'SELECT * FROM shops WHERE username = ?', [username]
    );
    if (rows.length === 0) return res.status(401).json({ error: 'Incorrect username or password' });
    const shop = rows[0];
    
    // verify with bcryptjs
    const match = await bcrypt.compare(password, shop.password);
    if (!match) return res.status(401).json({ error: 'Incorrect username or password' });

    if (shop.subscription_status !== 'active') {
      return res.status(403).json({ error: 'Account payment is pending', shopId: shop.id, shopName: shop.shop_name });
    }
    res.json({ shop: shopRowToClient(shop) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/admin-login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const adminUser = process.env.ADMIN_USER || 'zakwan_admin';
    const adminPass = process.env.ADMIN_PASS || 'zakwan@apnakhata';
    
    if (username === adminUser && password === adminPass) {
      res.json({ success: true, user: adminUser, role: 'admin' });
    } else {
      res.status(401).json({ error: 'Invalid Super Admin credentials' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── SHOPS ────────────────────────────────────────────────────────────────────
app.get('/api/shops', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM shops ORDER BY id');
    res.json({ shops: rows.map(shopRowToClient) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/shops/:shopId', async (req, res) => {
  try {
    const { shopId } = req.params;
    const { rows } = await pool.query('SELECT * FROM shops WHERE id = ?', [shopId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Shop not found' });
    res.json({ shop: shopRowToClient(rows[0]) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/shops', async (req, res) => {
  try {
    const { username, password, shopName, ownerName, category = 'Grocery', duration = 1 } = req.body;
    if (!username || !password || !shopName || !ownerName) {
      return res.status(400).json({ error: 'username, password, shopName, and ownerName are required' });
    }
    const existing = await pool.query('SELECT id FROM shops WHERE username = ?', [username]);
    if (existing.rowCount > 0) return res.status(409).json({ error: 'Username already exists' });

    const durInt = parseInt(duration) || 1;
    let planPrice = 249;
    if (durInt === 3) planPrice = 699;
    else if (durInt === 12) planPrice = 2499;

    const renewalDate = new Date(Date.now() + durInt * 30 * 24 * 60 * 60 * 1000)
      .toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO shops (id, username, password, shop_name, owner_name, category, subscription_status, renewal_date, plan_duration, plan_price)
       VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)`,
      [username, username, hashedPassword, shopName, ownerName, category, renewalDate, durInt, planPrice]
    );
    const { rows } = await pool.query('SELECT * FROM shops WHERE id = ?', [username]);
    res.status(201).json({ shop: shopRowToClient(rows[0]) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/shops/:shopId/subscription', async (req, res) => {
  try {
    const { shopId } = req.params;
    const { duration, subscriptionStatus, renewalDate } = req.body || {};
    const existing = await pool.query('SELECT * FROM shops WHERE id = ?', [shopId]);
    if (existing.rowCount === 0) return res.status(404).json({ error: 'Shop not found' });

    const current = existing.rows[0];

    let nextStatus = current.subscription_status;
    let nextDuration = current.plan_duration;
    let nextPrice = current.plan_price;
    let nextDate = current.renewal_date;

    if (subscriptionStatus !== undefined || duration !== undefined || renewalDate !== undefined) {
      if (subscriptionStatus !== undefined) {
        nextStatus = subscriptionStatus;
      }
      if (duration !== undefined) {
        nextDuration = parseInt(duration) || 1;
        if (nextDuration === 3) nextPrice = 699;
        else if (nextDuration === 12) nextPrice = 2499;
        else nextPrice = 249;
      }
      if (renewalDate !== undefined) {
        nextDate = renewalDate;
      } else if (duration !== undefined || subscriptionStatus !== undefined) {
        if (nextStatus === 'active') {
          const next = new Date();
          next.setMonth(next.getMonth() + nextDuration);
          nextDate = next.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
        } else {
          nextDate = 'Expired';
        }
      }
    } else {
      // Default toggle logic (if no body params are provided)
      nextStatus = current.subscription_status === 'active' ? 'expired' : 'active';
      if (nextStatus === 'active') {
        const next = new Date();
        next.setMonth(next.getMonth() + (parseInt(current.plan_duration) || 1));
        nextDate = next.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
      } else {
        nextDate = 'Expired';
      }
    }

    await pool.query(
      `UPDATE shops SET subscription_status = ?, renewal_date = ?, plan_duration = ?, plan_price = ? WHERE id = ?`,
      [nextStatus, nextDate, nextDuration, nextPrice, shopId]
    );

    const { rows } = await pool.query('SELECT * FROM shops WHERE id = ?', [shopId]);
    res.json({ shop: shopRowToClient(rows[0]) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── INVENTORY ────────────────────────────────────────────────────────────────
app.get('/api/shops/:shopId/inventory', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM stock_items WHERE shop_id = ? ORDER BY id',
      [req.params.shopId]
    );
    res.json({ shopId: req.params.shopId, items: rows.map(stockRowToClient) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/shops/:shopId/inventory', async (req, res) => {
  try {
    const { shopId } = req.params;
    const shopCheck = await pool.query('SELECT id FROM shops WHERE id = ?', [shopId]);
    if (shopCheck.rowCount === 0) return res.status(404).json({ error: 'Shop not found' });

    const { name, category, stock, price, minStock = 5, buyingPrice = 0, isLoose = false } = req.body;
    if (!name || !category || stock === undefined || price === undefined) {
      return res.status(400).json({ error: 'name, category, stock, and price are required' });
    }

    // Validate numeric values
    if (isNaN(Number(stock)) || Number(stock) < 0) return res.status(400).json({ error: 'Invalid stock value' });
    if (isNaN(Number(price)) || Number(price) < 0) return res.status(400).json({ error: 'Invalid price value' });
    if (isNaN(Number(buyingPrice)) || Number(buyingPrice) < 0) return res.status(400).json({ error: 'Invalid buying price value' });
    if (isNaN(Number(minStock)) || Number(minStock) < 0) return res.status(400).json({ error: 'Invalid min stock value' });

    const itemId = Date.now();
    await pool.query(
      `INSERT INTO stock_items (id, shop_id, name, category, stock, price, buying_price, min_stock, is_loose)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [itemId, shopId, name, category, Number(stock), Math.round(Number(price)),
       Math.round(Number(buyingPrice)), Math.round(Number(minStock)), Boolean(isLoose)]
    );
    const { rows } = await pool.query('SELECT * FROM stock_items WHERE id = ?', [itemId]);
    res.status(201).json({ shopId, item: stockRowToClient(rows[0]) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/shops/:shopId/inventory/:itemId', async (req, res) => {
  try {
    const { shopId, itemId } = req.params;
    const existing = await pool.query(
      'SELECT * FROM stock_items WHERE shop_id = ? AND id = ?', [shopId, itemId]
    );
    if (existing.rowCount === 0) return res.status(404).json({ error: 'Item not found' });

    const current = existing.rows[0];

    const nextName = req.body.name ?? current.name;
    const nextCategory = req.body.category ?? current.category;
    
    // Numeric inputs parsing & validation
    let nextStock = current.stock;
    if (req.body.stock !== undefined) {
      const parsedStock = Number(req.body.stock);
      if (isNaN(parsedStock) || parsedStock < 0) {
        return res.status(400).json({ error: 'Invalid stock value (must be a positive number)' });
      }
      nextStock = parsedStock;
    }

    let nextPrice = current.price;
    if (req.body.price !== undefined) {
      const parsedPrice = Number(req.body.price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ error: 'Invalid price value (must be a positive number)' });
      }
      nextPrice = Math.round(parsedPrice);
    }

    let nextBuyingPrice = current.buying_price;
    const inputBuyingPrice = req.body.buying_price ?? req.body.buyingPrice;
    if (inputBuyingPrice !== undefined) {
      const parsedBPrice = Number(inputBuyingPrice);
      if (isNaN(parsedBPrice) || parsedBPrice < 0) {
        return res.status(400).json({ error: 'Invalid buying price value (must be a positive number)' });
      }
      nextBuyingPrice = Math.round(parsedBPrice);
    }

    let nextMinStock = current.min_stock;
    const inputMinStock = req.body.min_stock ?? req.body.minStock;
    if (inputMinStock !== undefined) {
      const parsedMStock = Number(inputMinStock);
      if (isNaN(parsedMStock) || parsedMStock < 0) {
        return res.status(400).json({ error: 'Invalid min stock value (must be a positive number)' });
      }
      nextMinStock = Math.round(parsedMStock);
    }

    const nextIsLoose = req.body.is_loose ?? req.body.isLoose ?? current.is_loose;

    await pool.query(
      `UPDATE stock_items SET name = ?, category = ?, stock = ?, price = ?, buying_price = ?, min_stock = ?, is_loose = ?
       WHERE shop_id = ? AND id = ?`,
      [nextName, nextCategory, nextStock, nextPrice, nextBuyingPrice, nextMinStock, nextIsLoose, shopId, itemId]
    );

    const { rows } = await pool.query('SELECT * FROM stock_items WHERE id = ?', [itemId]);
    res.json({ shopId, item: stockRowToClient(rows[0]) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── BILLS ────────────────────────────────────────────────────────────────────
app.get('/api/shops/:shopId/bills', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM bills WHERE shop_id = ? ORDER BY date DESC, time DESC',
      [req.params.shopId]
    );
    res.json({ shopId: req.params.shopId, bills: rows.map(billRowToClient) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/shops/:shopId/bills', async (req, res) => {
  const client = await pool.connect();
  try {
    const { shopId } = req.params;
    const { id, time, date, items, total, amount, paymentMethod, discount, itemsList, cartItems } = req.body;

    if (!id || !time || !date || total === undefined) {
      return res.status(400).json({ error: 'id, time, date, and total are required' });
    }

    await client.query('BEGIN');

    // Verify stock levels first and lock the item rows
    let calculatedProfit = 0;
    if (Array.isArray(cartItems)) {
      for (const ci of cartItems) {
        const { rows: itemRows } = await client.query(
          `SELECT name, stock, price, buying_price FROM stock_items WHERE shop_id = ? AND id = ? FOR UPDATE`,
          [shopId, ci.id]
        );
        if (itemRows.length === 0) {
          const err = new Error(`Item "${ci.name || ci.id}" not found in inventory.`);
          err.statusCode = 404;
          throw err;
        }
        const item = itemRows[0];
        const currentStock = Number(item.stock);
        if (currentStock < ci.qty) {
          const err = new Error(`Insufficient stock for item "${item.name}".`);
          err.statusCode = 400;
          err.name = item.name;
          err.available = currentStock;
          throw err;
        }

        // Decrement stock
        await client.query(
          `UPDATE stock_items SET stock = stock - ? WHERE shop_id = ? AND id = ?`,
          [ci.qty, shopId, ci.id]
        );

        // Accumulate profit
        const sellingPrice = Number(item.price || 0);
        const buyingPrice = Number(item.buying_price || 0);
        calculatedProfit += (sellingPrice - buyingPrice) * ci.qty;
      }
    }

    // Insert bill record
    await client.query(
      `INSERT INTO bills (id, shop_id, time, date, items, total, amount, payment_method, discount, items_list)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, shopId, time, date, items || 0, total, amount || total,
       paymentMethod || 'CASH', discount || 0, itemsList || '']
    );

    const discountAmt = Number(discount) || 0;
    const profit = (Array.isArray(cartItems) && cartItems.length > 0)
      ? Math.max(0, calculatedProfit - discountAmt)
      : Math.max(0, Math.round(total * 0.28));

    const itemCount = Array.isArray(cartItems) ? cartItems.reduce((s, ci) => s + ci.qty, 0) : (items || 0);
    await client.query(
      `UPDATE shops SET
         sales = sales + ?,
         profit = profit + ?,
         items_sold = items_sold + ?,
         customers_visited = customers_visited + 1
       WHERE id = ?`,
      [total, profit, itemCount, shopId]
    );

    await client.query('COMMIT');

    // Return updated shop metrics
    const { rows } = await pool.query('SELECT * FROM shops WHERE id = ?', [shopId]);
    res.status(201).json({ success: true, metrics: rows.length > 0 ? shopRowToClient(rows[0]).metrics : {} });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        error: err.message,
        name: err.name,
        available: err.available
      });
    }
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ─── EXPENSES ─────────────────────────────────────────────────────────────────
app.get('/api/shops/:shopId/expenses', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM expenses WHERE shop_id = ? ORDER BY date DESC, time DESC',
      [req.params.shopId]
    );
    res.json({ shopId: req.params.shopId, expenses: rows.map(expenseRowToClient) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/shops/:shopId/expenses', async (req, res) => {
  const client = await pool.connect();
  try {
    const { shopId } = req.params;
    const { id, date, time, description, category, amount, paymentMethod } = req.body;

    if (!id || !description || amount === undefined) {
      return res.status(400).json({ error: 'id, description, and amount are required' });
    }

    await client.query('BEGIN');

    await client.query(
      `INSERT INTO expenses (id, shop_id, date, time, description, category, amount, payment_method)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, shopId, date, time, description, category || 'Other', Number(amount), paymentMethod || 'CASH']
    );

    await client.query(
      `UPDATE shops SET expenses = expenses + ? WHERE id = ?`,
      [Number(amount), shopId]
    );

    await client.query('COMMIT');

    const { rows } = await pool.query('SELECT * FROM shops WHERE id = ?', [shopId]);
    res.status(201).json({ success: true, metrics: rows.length > 0 ? shopRowToClient(rows[0]).metrics : {} });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
app.get('/api/shops/:shopId/notifications', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM notifications WHERE shop_id = ? ORDER BY id DESC',
      [req.params.shopId]
    );
    res.json({ shopId: req.params.shopId, notifications: rows.map(notifRowToClient) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/shops/:shopId/notifications', async (req, res) => {
  try {
    const { shopId } = req.params;
    const { id, text, time, read = false, type = 'info' } = req.body;
    await pool.query(
      `INSERT INTO notifications (id, shop_id, text, time, \`read\`, type) VALUES (?, ?, ?, ?, ?, ?)`,
      [id || Date.now(), shopId, text, time, read, type]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/shops/:shopId/notifications', async (req, res) => {
  try {
    // Mark all as read
    await pool.query('UPDATE notifications SET `read` = true WHERE shop_id = ?', [req.params.shopId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/shops/:shopId/notifications/:notifId', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM notifications WHERE shop_id = ? AND id = ?',
      [req.params.shopId, req.params.notifId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PAYMENTS ─────────────────────────────────────────────────────────────────
app.post('/api/payments/create-order', async (req, res) => {
  try {
    const { shopId, amount = 249, month } = req.body;
    const { rows } = await pool.query('SELECT * FROM shops WHERE id = ?', [shopId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Shop not found' });

    const razorpay = getRazorpayClient();
    if (!razorpay) {
      return res.json({
        keyId: 'mock_key_id',
        isMock: true,
        order: {
          id: `order_mock_${Date.now()}`,
          amount: Number(amount) * 100,
          currency: 'INR',
          notes: { shopId, amount: String(amount) }
        }
      });
    }

    const order = await razorpay.orders.create({
      amount: Number(amount) * 100,
      currency: 'INR',
      receipt: `${shopId}_${Date.now()}`,
      notes: { shopId, shopName: rows[0].shop_name, amount: String(amount) }
    });
    res.json({ keyId: process.env.RAZORPAY_KEY_ID, order });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unable to create Razorpay order' });
  }
});

app.post('/api/payments/verify', async (req, res) => {
  try {
    const { shopId, razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;
    
    let orderAmount = Number(amount) || 249;

    const razorpay = getRazorpayClient();
    if (razorpay) {
      if (!shopId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ error: 'Payment verification details are required' });
      }

      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ error: 'Invalid payment signature' });
      }

      const order = await razorpay.orders.fetch(razorpay_order_id);
      orderAmount = Number(order.amount) / 100;
    }

    let months = 1;
    if (orderAmount === 699) {
      months = 3;
    } else if (orderAmount === 2499) {
      months = 12;
    }

    const { rows: shopRows } = await pool.query('SELECT subscription_status, renewal_date FROM shops WHERE id=?', [shopId]);
    if (shopRows.length === 0) return res.status(404).json({ error: 'Shop not found' });
    const shop = shopRows[0];

    let startDate = new Date();
    if (shop.subscription_status === 'active' && shop.renewal_date) {
      const currentRenewal = new Date(shop.renewal_date);
      if (!isNaN(currentRenewal.getTime()) && currentRenewal > startDate) {
        startDate = currentRenewal;
      }
    }
    startDate.setMonth(startDate.getMonth() + months);
    const renewalDate = startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    await pool.query(
      `UPDATE shops SET subscription_status='active', renewal_date=?, plan_duration=?, plan_price=? WHERE id=?`,
      [renewalDate, months, orderAmount, shopId]
    );
    const { rows } = await pool.query('SELECT * FROM shops WHERE id=?', [shopId]);
    res.json({ success: true, shop: shopRowToClient(rows[0]) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/payments/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      const shasum = crypto.createHmac('sha256', webhookSecret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest('hex');
      if (digest !== signature) {
        return res.status(400).json({ error: 'Invalid webhook signature' });
      }
    }

    const event = req.body.event;
    if (event === 'order.paid') {
      const order = req.body.payload.order.entity;
      const shopId = order.notes?.shopId;
      const orderAmount = Number(order.amount) / 100;

      if (shopId) {
        let months = 1;
        if (orderAmount === 699) {
          months = 3;
        } else if (orderAmount === 2499) {
          months = 12;
        }

        const { rows: shopRows } = await pool.query('SELECT subscription_status, renewal_date FROM shops WHERE id=?', [shopId]);
        let startDate = new Date();
        if (shopRows.length > 0) {
          const shop = shopRows[0];
          if (shop.subscription_status === 'active' && shop.renewal_date) {
            const currentRenewal = new Date(shop.renewal_date);
            if (!isNaN(currentRenewal.getTime()) && currentRenewal > startDate) {
              startDate = currentRenewal;
            }
          }
        }
        startDate.setMonth(startDate.getMonth() + months);
        const renewalDate = startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

        await pool.query(
          `UPDATE shops SET subscription_status='active', renewal_date=?, plan_duration=?, plan_price=? WHERE id=?`,
          [renewalDate, months, orderAmount, shopId]
        );
        console.log(`✅ Webhook: Successfully activated subscription for shop: ${shopId} (${months} months)`);
      }
    }

    res.json({ status: 'ok' });
  } catch (err) {
    console.error('❌ Webhook error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────
initDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`🚀 ApnaKhata backend running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database. Server not started.', err.message);
    process.exit(1);
  });
