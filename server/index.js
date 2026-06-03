import crypto from 'node:crypto';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import Razorpay from 'razorpay';
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
      'SELECT * FROM shops WHERE username=$1 AND password=$2', [username, password]
    );
    if (rows.length === 0) return res.status(401).json({ error: 'Incorrect username or password' });
    const shop = rows[0];
    if (shop.subscription_status !== 'active') {
      return res.status(403).json({ error: 'Account payment is pending', shopId: shop.id, shopName: shop.shop_name });
    }
    res.json({ shop: shopRowToClient(shop) });
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
    const { rows } = await pool.query('SELECT * FROM shops WHERE id=$1', [shopId]);
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
    const existing = await pool.query('SELECT id FROM shops WHERE username=$1', [username]);
    if (existing.rowCount > 0) return res.status(409).json({ error: 'Username already exists' });

    const durInt = parseInt(duration) || 1;
    let planPrice = 249;
    if (durInt === 3) planPrice = 699;
    else if (durInt === 12) planPrice = 2499;

    const renewalDate = new Date(Date.now() + durInt * 30 * 24 * 60 * 60 * 1000)
      .toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    await pool.query(
      `INSERT INTO shops (id,username,password,shop_name,owner_name,category,subscription_status,renewal_date,plan_duration,plan_price)
       VALUES ($1,$2,$3,$4,$5,$6,'active',$7,$8,$9)`,
      [username, username, password, shopName, ownerName, category, renewalDate, durInt, planPrice]
    );
    const { rows } = await pool.query('SELECT * FROM shops WHERE id=$1', [username]);
    res.status(201).json({ shop: shopRowToClient(rows[0]) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/shops/:shopId/subscription', async (req, res) => {
  try {
    const { shopId } = req.params;
    const { duration, subscriptionStatus, renewalDate } = req.body || {};
    const existing = await pool.query('SELECT * FROM shops WHERE id=$1', [shopId]);
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
      `UPDATE shops SET subscription_status=$1, renewal_date=$2, plan_duration=$3, plan_price=$4 WHERE id=$5`,
      [nextStatus, nextDate, nextDuration, nextPrice, shopId]
    );

    const { rows } = await pool.query('SELECT * FROM shops WHERE id=$1', [shopId]);
    res.json({ shop: shopRowToClient(rows[0]) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── INVENTORY ────────────────────────────────────────────────────────────────
app.get('/api/shops/:shopId/inventory', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM stock_items WHERE shop_id=$1 ORDER BY id',
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
    const shopCheck = await pool.query('SELECT id FROM shops WHERE id=$1', [shopId]);
    if (shopCheck.rowCount === 0) return res.status(404).json({ error: 'Shop not found' });

    const { name, category, stock, price, minStock = 5, buyingPrice = 0, isLoose = false } = req.body;
    if (!name || !category || stock === undefined || price === undefined) {
      return res.status(400).json({ error: 'name, category, stock, and price are required' });
    }
    const itemId = Date.now();
    await pool.query(
      `INSERT INTO stock_items (id,shop_id,name,category,stock,price,buying_price,min_stock,is_loose)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [itemId, shopId, name, category, Number(stock), Number(price),
       Number(buyingPrice), Number(minStock), Boolean(isLoose)]
    );
    const { rows } = await pool.query('SELECT * FROM stock_items WHERE id=$1', [itemId]);
    res.status(201).json({ shopId, item: stockRowToClient(rows[0]) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/shops/:shopId/inventory/:itemId', async (req, res) => {
  try {
    const { shopId, itemId } = req.params;
    const existing = await pool.query(
      'SELECT * FROM stock_items WHERE shop_id=$1 AND id=$2', [shopId, itemId]
    );
    if (existing.rowCount === 0) return res.status(404).json({ error: 'Item not found' });

    const current = existing.rows[0];
    const updated = { ...current, ...req.body };
    await pool.query(
      `UPDATE stock_items SET name=$1,category=$2,stock=$3,price=$4,buying_price=$5,min_stock=$6,is_loose=$7
       WHERE shop_id=$8 AND id=$9`,
      [updated.name, updated.category, updated.stock, updated.price,
       updated.buying_price || updated.buyingPrice || current.buying_price,
       updated.min_stock || updated.minStock || current.min_stock,
       updated.is_loose ?? updated.isLoose ?? current.is_loose,
       shopId, itemId]
    );
    const { rows } = await pool.query('SELECT * FROM stock_items WHERE id=$1', [itemId]);
    res.json({ shopId, item: stockRowToClient(rows[0]) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── BILLS ────────────────────────────────────────────────────────────────────
app.get('/api/shops/:shopId/bills', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM bills WHERE shop_id=$1 ORDER BY date DESC, time DESC',
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

    // Insert bill
    await client.query(
      `INSERT INTO bills (id,shop_id,time,date,items,total,amount,payment_method,discount,items_list)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [id, shopId, time, date, items || 0, total, amount || total,
       paymentMethod || 'CASH', discount || 0, itemsList || '']
    );

    // Decrement stock for each cart item
    if (Array.isArray(cartItems)) {
      for (const ci of cartItems) {
        await client.query(
          `UPDATE stock_items SET stock = GREATEST(0, stock - $1) WHERE shop_id=$2 AND id=$3`,
          [ci.qty, shopId, ci.id]
        );
      }
    }

    // Calculate actual profit based on (price - buying_price) * qty
    let calculatedProfit = 0;
    if (Array.isArray(cartItems) && cartItems.length > 0) {
      for (const ci of cartItems) {
        const { rows: itemRows } = await client.query(
          `SELECT price, buying_price FROM stock_items WHERE shop_id = $1 AND id = $2`,
          [shopId, ci.id]
        );
        if (itemRows.length > 0) {
          const sellingPrice = Number(itemRows[0].price || 0);
          const buyingPrice = Number(itemRows[0].buying_price || 0);
          calculatedProfit += (sellingPrice - buyingPrice) * ci.qty;
        }
      }
    }
    const discountAmt = Number(discount) || 0;
    const profit = (Array.isArray(cartItems) && cartItems.length > 0)
      ? Math.max(0, calculatedProfit - discountAmt)
      : Math.max(0, Math.round(total * 0.28));

    const itemCount = Array.isArray(cartItems) ? cartItems.reduce((s, ci) => s + ci.qty, 0) : (items || 0);
    await client.query(
      `UPDATE shops SET
         sales = sales + $1,
         profit = profit + $2,
         items_sold = items_sold + $3,
         customers_visited = customers_visited + 1
       WHERE id=$4`,
      [total, profit, itemCount, shopId]
    );

    await client.query('COMMIT');

    // Return updated shop metrics
    const { rows } = await pool.query('SELECT * FROM shops WHERE id=$1', [shopId]);
    res.status(201).json({ success: true, metrics: rows.length > 0 ? shopRowToClient(rows[0]).metrics : {} });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ─── EXPENSES ─────────────────────────────────────────────────────────────────
app.get('/api/shops/:shopId/expenses', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM expenses WHERE shop_id=$1 ORDER BY date DESC, time DESC',
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
      `INSERT INTO expenses (id,shop_id,date,time,description,category,amount,payment_method)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [id, shopId, date, time, description, category || 'Other', Number(amount), paymentMethod || 'CASH']
    );

    await client.query(
      `UPDATE shops SET expenses = expenses + $1 WHERE id=$2`,
      [Number(amount), shopId]
    );

    await client.query('COMMIT');

    const { rows } = await pool.query('SELECT * FROM shops WHERE id=$1', [shopId]);
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
      'SELECT * FROM notifications WHERE shop_id=$1 ORDER BY id DESC',
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
      `INSERT INTO notifications (id,shop_id,text,time,\`read\`,type) VALUES ($1,$2,$3,$4,$5,$6)`,
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
    await pool.query('UPDATE notifications SET `read`=true WHERE shop_id=$1', [req.params.shopId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/shops/:shopId/notifications/:notifId', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM notifications WHERE shop_id=$1 AND id=$2',
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
    const { rows } = await pool.query('SELECT * FROM shops WHERE id=$1', [shopId]);
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

    const next = new Date();
    next.setMonth(next.getMonth() + months);
    const renewalDate = next.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    await pool.query(
      `UPDATE shops SET subscription_status='active', renewal_date=?, plan_duration=?, plan_price=? WHERE id=?`,
      [renewalDate, months, orderAmount, shopId]
    );
    const { rows } = await pool.query('SELECT * FROM shops WHERE id=?', [shopId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Shop not found' });
    res.json({ success: true, shop: shopRowToClient(rows[0]) });
  } catch (err) {
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
