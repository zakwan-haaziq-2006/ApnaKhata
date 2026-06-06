import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from './LanguageContext.js';
import {
  IndianRupee,
  Bell,
  TrendingUp,
  ArrowDownRight,
  Package,
  ShoppingBag,
  AlertTriangle,
  Plus,
  Search,
  Check,
  ChevronRight,
  TrendingDown,
  Filter,
  Calendar,
  X,
  PlusCircle,
  MinusCircle,
  FileText,
  Clock,
  User,
  RefreshCw,
  Users,
  Percent,
  Award,
  BarChart3,
  PieChart as PieIcon,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  ShieldAlert,
  UserCheck,
  CreditCard,
  ToggleLeft,
  ToggleRight,
  DollarSign,
  Smartphone
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie
} from 'recharts';

// --- Native Browser Cookie Helpers ---
const setCookie = (name, value, days = 7) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (encodeURIComponent(value) || "") + expires + "; path=/";
};

const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  return null;
};

const deleteCookie = (name) => {
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

// --- Invoice Prefix Generator ---
// Takes a shop name like "Rajan Stores" and returns initials like "RS"
const getStorePrefix = (shopName = '') => {
  return shopName
    .split(' ')
    .filter(w => w.length > 0)
    .map(w => w[0].toUpperCase())
    .join('');
};

const getMockStockForCategory = (category = 'Grocery') => {
  const cat = category.toLowerCase();
  if (cat === 'medical' || cat === 'medicals') {
    return [
      { id: 201, name: "Paracetamol 650mg", category: "Medicines", stock: 45, price: 20, minStock: 10 },
      { id: 202, name: "Cough Syrup 100ml", category: "Medicines", stock: 32, price: 75, minStock: 8 },
      { id: 203, name: "Band-Aid Strips (Box)", category: "Diagnostics", stock: 15, price: 50, minStock: 5 },
      { id: 204, name: "Vitamin C 500mg", category: "Wellness", stock: 50, price: 120, minStock: 12 },
      { id: 205, name: "N95 Face Mask", category: "Personal Hygiene", stock: 22, price: 40, minStock: 6 },
      { id: 206, name: "Baby Wipes 80s", category: "Baby Care", stock: 18, price: 150, minStock: 5 },
      { id: 207, name: "Antiseptic Liquid 250ml", category: "Wellness", stock: 12, price: 110, minStock: 4 },
      { id: 208, name: "Thermometer Digital", category: "Diagnostics", stock: 8, price: 250, minStock: 3 }
    ];
  } else if (cat === 'footwear') {
    return [
      { id: 201, name: "Bata Flip-Flops", category: "Slippers", stock: 35, price: 299, minStock: 5 },
      { id: 202, name: "Running Sneakers", category: "Sports Shoes", stock: 12, price: 1499, minStock: 3 },
      { id: 203, name: "Leather Sandals", category: "Sandals", stock: 18, price: 899, minStock: 4 },
      { id: 204, name: "Formal Black Shoes", category: "Formal Shoes", stock: 10, price: 1999, minStock: 2 },
      { id: 205, name: "Cotton Socks (Pack of 3)", category: "Socks", stock: 40, price: 199, minStock: 8 },
      { id: 206, name: "Casual Canvas Shoes", category: "Sports Shoes", stock: 15, price: 699, minStock: 3 },
      { id: 207, name: "Kid's Velcro Sandals", category: "Sandals", stock: 20, price: 499, minStock: 5 },
      { id: 208, name: "Soft Slippers (Indoor)", category: "Slippers", stock: 25, price: 349, minStock: 6 }
    ];
  } else if (cat === 'food hotel' || cat === 'food hotels' || cat === 'restaurant') {
    return [
      { id: 201, name: "Paneer Tikka Double", category: "Starters", stock: 25, price: 180, minStock: 5 },
      { id: 202, name: "Butter Chicken Masala", category: "Main Course", stock: 30, price: 280, minStock: 6 },
      { id: 203, name: "Hyderabadi Chicken Biryani", category: "Biryani", stock: 40, price: 220, minStock: 8 },
      { id: 204, name: "Garlic Butter Naan", category: "Breads", stock: 100, price: 45, minStock: 15 },
      { id: 205, name: "Fresh Mango Lassi", category: "Beverages", stock: 35, price: 60, minStock: 5 },
      { id: 206, name: "Gulab Jamun (2 Pcs)", category: "Desserts", stock: 50, price: 50, minStock: 10 },
      { id: 207, name: "Paneer Butter Masala", category: "Main Course", stock: 20, price: 240, minStock: 4 },
      { id: 208, name: "Jeera Rice Half", category: "Main Course", stock: 30, price: 90, minStock: 5 }
    ];
  } else if (cat === 'stationery' || cat === 'stationeries') {
    return [
      { id: 201, name: "Classmate Notebook A4", category: "Notebooks", stock: 80, price: 65, minStock: 10 },
      { id: 202, name: "Parker Vector Roller Pen", category: "Pens & Pencils", stock: 15, price: 250, minStock: 3 },
      { id: 203, name: "Reynolds Ball Pen Blue", category: "Pens & Pencils", stock: 120, price: 10, minStock: 20 },
      { id: 204, name: "Camel Water Colors Kit", category: "Art Supplies", stock: 25, price: 150, minStock: 5 },
      { id: 205, name: "Fevicol MR Squeeze 100g", category: "Adhesives", stock: 45, price: 50, minStock: 8 },
      { id: 206, name: "Nataraj Pencil Box (10s)", category: "Pens & Pencils", stock: 60, price: 45, minStock: 10 },
      { id: 207, name: "A4 Printing Paper Ream", category: "Office Files", stock: 12, price: 299, minStock: 2 },
      { id: 208, name: "Camlin Geometry Box", category: "Geometry Boxes", stock: 20, price: 110, minStock: 4 }
    ];
  } else if (cat === 'vegetables & fruits' || cat === 'vegetables/fruits' || cat === 'vegetable/fruits' || cat === 'vegetables' || cat === 'fruits') {
    return [
      { id: 201, name: "Fresh Potatoes (per Kg)", category: "Vegetables", stock: 120, price: 30, isLoose: true, minStock: 20 },
      { id: 202, name: "Onions Nasik (per Kg)", category: "Vegetables", stock: 90, price: 40, isLoose: true, minStock: 15 },
      { id: 203, name: "Tomatoes Hybrid (per Kg)", category: "Vegetables", stock: 60, price: 35, isLoose: true, minStock: 10 },
      { id: 204, name: "Shimla Apple (per Kg)", category: "Fresh Fruits", stock: 40, price: 180, isLoose: true, minStock: 8 },
      { id: 205, name: "Cavendish Bananas (Dozen)", category: "Fresh Fruits", stock: 25, price: 60, minStock: 5 },
      { id: 206, name: "Fresh Spinach (Bunch)", category: "Leafy Greens", stock: 30, price: 20, minStock: 6 },
      { id: 207, name: "Alphonso Mangoes (per Kg)", category: "Fresh Fruits", stock: 35, price: 250, isLoose: true, minStock: 5 },
      { id: 208, name: "Green Coriander (Bunch)", category: "Leafy Greens", stock: 40, price: 10, minStock: 8 }
    ];
  } else if (cat === 'general store' || cat === 'general small shop' || cat === 'general small shops' || cat === 'general') {
    return [
      { id: 201, name: "Ceramic Coffee Mug Blue", category: "Kitchenware", stock: 30, price: 99, minStock: 5 },
      { id: 202, name: "Plastic Water Bottle 1L", category: "Daily Utilities", stock: 50, price: 50, minStock: 10 },
      { id: 203, name: "Barbie Fashion Doll", category: "Toys", stock: 15, price: 349, minStock: 3 },
      { id: 204, name: "Hot Wheels Diecast Car", category: "Toys", stock: 40, price: 120, minStock: 8 },
      { id: 205, name: "Stainless Steel Spoon Set", category: "Kitchenware", stock: 20, price: 199, minStock: 4 },
      { id: 206, name: "Lakme Eyeconic Kajal", category: "Cosmetics", stock: 25, price: 180, minStock: 5 },
      { id: 207, name: "Nivea Cream Tub 100ml", category: "Cosmetics", stock: 35, price: 120, minStock: 6 },
      { id: 208, name: "Syska LED Bulb 9W", category: "Daily Utilities", stock: 45, price: 90, minStock: 8 }
    ];
  } else {
    // Default Grocery / groceries
    return [
      { id: 201, name: "Parle-G Biscuit", category: "Biscuits", stock: 45, price: 12, minStock: 10 },
      { id: 202, name: "Tata Salt 1kg", category: "Groceries", stock: 32, price: 26, minStock: 8 },
      { id: 203, name: "Surf Excel 500g", category: "Detergents", stock: 15, price: 70, minStock: 5 },
      { id: 204, name: "Maggi Noodles", category: "Packaged Food", stock: 50, price: 25, minStock: 12 },
      { id: 205, name: "Colgate 150g", category: "Personal Care", stock: 22, price: 40, minStock: 6 },
      { id: 206, name: "Aashirvaad Atta 5kg", category: "Groceries", stock: 2, price: 240, minStock: 5 },
      { id: 207, name: "Tata Tea 250g", category: "Groceries", stock: 1, price: 110, minStock: 4 },
      { id: 208, name: "Vim Bar", category: "Cleaning", stock: 3, price: 15, minStock: 6 }
    ];
  }
};

// --- API Helper Utility ---
const getDaysRemaining = (renewalDateStr) => {
  if (!renewalDateStr || renewalDateStr === 'Expired') return 0;
  const deadline = new Date(renewalDateStr);
  if (isNaN(deadline.getTime())) return 0;
  const now = new Date();
  deadline.setHours(0,0,0,0);
  now.setHours(0,0,0,0);
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const apiCall = async (url, options = {}) => {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const err = new Error(errorBody.error || `HTTP error! Status: ${res.status}`);
    err.status = res.status;
    err.data = errorBody;
    throw err;
  }
  return res.json();
};

export default function Dashboard() {
  const { language, changeLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Identify Route (Merchant path '/' vs Super Admin '/admin')
  const isAdminRoute = location.pathname === '/admin';
  const isPricingRoute = location.pathname === '/pricing';

  // --- Session & Cookie States ---
  const [sessionUser, setSessionUser] = useState(null);
  const [sessionRole, setSessionRole] = useState(null);
  const [pendingPaymentShopId, setPendingPaymentShopId] = useState(null);
  const [pendingPaymentShopName, setPendingPaymentShopName] = useState('');

  // --- Pricing Login State ---
  const [showPricingLoginModal, setShowPricingLoginModal] = useState(false);
  const [pricingLoginUsername, setPricingLoginUsername] = useState('');
  const [pricingLoginPassword, setPricingLoginPassword] = useState('');
  const [pricingLoginShowPassword, setPricingLoginShowPassword] = useState(false);
  const [selectedPlanInfo, setSelectedPlanInfo] = useState(null); // { months, amount }

  // --- Simulated Payment Gateway State ---
  const [showSimulatedGateway, setShowSimulatedGateway] = useState(false);
  const [simulatedPaymentDetails, setSimulatedPaymentDetails] = useState(null); // { shopId, shopName, months, amount, orderId }
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);
  const [simulatedStatus, setSimulatedStatus] = useState('pending'); // 'pending', 'processing', 'success', 'failed'

  // --- General View & Form States ---
  const [activeTab, setActiveTab] = useState('home'); 
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountDrawer, setShowAccountDrawer] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [reportsFilter, setReportsFilter] = useState('day'); 
  
  // Login Inputs
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Super Admin: Account provisioning inputs
  const [newShopName, setNewShopName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newDuration, setNewDuration] = useState('1'); 
  const [newStoreCategory, setNewStoreCategory] = useState('Grocery');
  const [newCatName, setNewCatName] = useState('');
  const [newCatSubs, setNewCatSubs] = useState('');
  
  const [shopCategories, setShopCategories] = useState(() => {
    const defaultCats = [
      { id: 'cat-1', name: 'Grocery', subcategories: ['Groceries', 'Biscuits', 'Packaged Food', 'Detergents', 'Personal Care', 'Cleaning'] },
      { id: 'cat-2', name: 'Medical', subcategories: ['Medicines', 'Diagnostics', 'Baby Care', 'Personal Hygiene', 'Wellness'] },
      { id: 'cat-3', name: 'Footwear', subcategories: ['Slippers', 'Sports Shoes', 'Sandals', 'Formal Shoes', 'Socks'] },
      { id: 'cat-4', name: 'Food Hotel', subcategories: ['Starters', 'Main Course', 'Biryani', 'Beverages', 'Desserts', 'Breads'] },
      { id: 'cat-5', name: 'Stationery', subcategories: ['Notebooks', 'Pens & Pencils', 'Art Supplies', 'Office Files', 'Adhesives', 'Geometry Boxes'] },
      { id: 'cat-6', name: 'Vegetables & Fruits', subcategories: ['Vegetables', 'Fresh Fruits', 'Leafy Greens', 'Exotic Veggies', 'Organic Produce'] },
      { id: 'cat-7', name: 'General Store', subcategories: ['Kitchenware', 'Daily Utilities', 'Toys', 'Cosmetics', 'Gifts', 'Festive Items'] }
    ];
    const saved = localStorage.getItem('apna_khata_shop_categories');
    if (saved) {
      const parsed = JSON.parse(saved);
      const customCats = parsed.filter(pc => !defaultCats.some(dc => dc.name.toLowerCase() === pc.name.toLowerCase() || dc.id === pc.id));
      return [...defaultCats, ...customCats];
    }
    return defaultCats;
  });

  useEffect(() => {
    localStorage.setItem('apna_khata_shop_categories', JSON.stringify(shopCategories));
  }, [shopCategories]);

  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (!newCatName || !newCatSubs) return;
    const subs = newCatSubs.split(',').map(s => s.trim()).filter(Boolean);
    if (subs.length === 0) {
      triggerToast('Please provide at least one sub-category!', 'error');
      return;
    }
    const exists = shopCategories.find(c => c.name.toLowerCase() === newCatName.toLowerCase());
    if (exists) {
      triggerToast('Shop category already exists!', 'error');
      return;
    }
    const newCat = {
      id: `cat-${Date.now()}`,
      name: newCatName,
      subcategories: subs
    };
    setShopCategories(prev => [...prev, newCat]);
    triggerToast(`Shop Category "${newCatName}" registered successfully!`, 'success');
    setNewCatName('');
    setNewCatSubs('');
  };

  const handleDeleteCategory = (id) => {
    setShopCategories(prev => prev.filter(c => c.id !== id));
    triggerToast('Shop category deleted!', 'success');
  }; 

  // --- Dynamic Date ---
  const [todayDate, setTodayDate] = useState('');
  useEffect(() => {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    setTodayDate(new Date().toLocaleDateString('en-IN', options));
  }, []);

  // --- Store Registry Database (Persisted in LocalStorage) ---
  const defaultStores = [
    {
      username: 'rajan',
      password: 'rajan_password123',
      shopName: 'Rajan Stores',
      ownerName: 'Rajan Kumar',
      category: 'Grocery',
      subscriptionStatus: 'active', 
      renewalDate: '1 July 2026',
      metrics: { sales: 4250, profit: 1180, expenses: 320, itemsSold: 38, customersVisited: 42 }
    },
    {
      username: 'gupta',
      password: 'gupta_password456',
      shopName: 'Gupta Grocers',
      ownerName: 'Amit Gupta',
      category: 'Grocery',
      subscriptionStatus: 'active',
      renewalDate: '15 June 2026',
      metrics: { sales: 6800, profit: 1900, expenses: 540, itemsSold: 54, customersVisited: 58 }
    },
    {
      username: 'sharma',
      password: 'sharma_password789',
      shopName: 'Sharma Kirana',
      ownerName: 'Vijay Sharma',
      category: 'Grocery',
      subscriptionStatus: 'expired',
      renewalDate: '30 May 2026',
      metrics: { sales: 1200, profit: 300, expenses: 100, itemsSold: 12, customersVisited: 15 }
    }
  ];

  const [storeRegistry, setStoreRegistry] = useState([]);
  const [adminTab, setAdminTab] = useState('directory'); // 'directory' or 'analysis'

  useEffect(() => {
    if (sessionRole === 'admin') {
      apiCall('/api/shops')
        .then(data => {
          setStoreRegistry(data.shops);
        })
        .catch(err => {
          console.error("Failed to load shop registry:", err);
        });
    }
  }, [sessionRole]);

  // Current Logged-in Merchant Profile
  const [currentMerchant, setCurrentMerchant] = useState(null);

  // Check Cookies on Load & Route change
  useEffect(() => {
    const savedUser = getCookie('apna_khata_session_user');
    const savedRole = getCookie('apna_khata_session_role');

    setSessionUser(savedUser);
    setSessionRole(savedRole);

    if (savedUser && savedRole === 'merchant') {
      apiCall(`/api/shops/${savedUser}`)
        .then(data => {
          setCurrentMerchant(data.shop);
        })
        .catch(err => {
          console.error("Failed to restore merchant session:", err);
          triggerToast("Session expired or server error", "error");
          handleLogout();
        });
    } else {
      setCurrentMerchant(null);
    }
  }, [location.pathname]);

  // Toast trigger helper
  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // --- Dynamic Live Metrics (linked to active merchant) ---
  const [metrics, setMetrics] = useState({ sales: 0, profit: 0, expenses: 0, itemsSold: 0, customersVisited: 0 });

  // --- Core PWA State Declarations (Placed at the top to prevent TDZ ReferenceErrors) ---
  const [recentBills, setRecentBills] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [stockItems, setStockItems] = useState([]);

  useEffect(() => {
    if (currentMerchant) {
      setMetrics(currentMerchant.metrics);
    }
  }, [currentMerchant]);

  // --- Notifications Mock Data (Store isolated loaded via effect) ---
  const [notifications, setNotifications] = useState([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    if (!currentMerchant) return;
    apiCall(`/api/shops/${currentMerchant.id}/notifications`, {
      method: 'PATCH'
    })
      .then(() => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
        triggerToast('All notifications marked as read', 'success');
      })
      .catch(err => {
        triggerToast(err.message || 'Failed to update notifications', 'error');
      });
  };

  const handleClearNotification = (id) => {
    if (!currentMerchant) return;
    if (id === 999999) {
      sessionStorage.setItem(`dismissed_expiry_warn_${currentMerchant.id}`, 'true');
      setNotifications(notifications.filter(n => n.id !== id));
      return;
    }
    apiCall(`/api/shops/${currentMerchant.id}/notifications/${id}`, {
      method: 'DELETE'
    })
      .then(() => {
        setNotifications(notifications.filter(n => n.id !== id));
      })
      .catch(err => {
        triggerToast(err.message || 'Failed to clear notification', 'error');
      });
  };

  // Low Stock Alerts
  const [lowStockItems, setLowStockItems] = useState([]);

  // Top Products Today (Store isolated loaded via effect)
  const [topProducts, setTopProducts] = useState([]);

  // --- Date Utility Function (Hoisted/Moved here for Analytics Engine dependency) ---
  const getRelativeDateUtil = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  const todayISO = getRelativeDateUtil(0);

  // --- Reports Chart Data Models (Dynamic Analytics Engine) ---
  const getHourSlot = (timeStr) => {
    const cleanTime = timeStr.replace('Today, ', '');
    const match = cleanTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return '14:00';
    let hour = parseInt(match[1]);
    const isPM = match[3].toUpperCase() === 'PM';
    if (isPM && hour < 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;
    
    if (hour >= 6 && hour < 10) return '08:00';
    if (hour >= 10 && hour < 13) return '11:00';
    if (hour >= 13 && hour < 16) return '14:00';
    if (hour >= 16 && hour < 19) return '17:00';
    if (hour >= 19 && hour < 22) return '20:00';
    return '23:00';
  };

  const getDayOfWeekName = (dateStr) => {
    const dateObj = new Date(dateStr + 'T00:00:00');
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dateObj.getDay()];
  };

  // 1. Hourly Distribution
  const todayBills = recentBills.filter(b => b.date === todayISO);
  const hourlySlots = { '08:00': 0, '11:00': 0, '14:00': 0, '17:00': 0, '20:00': 0, '23:00': 0 };
  todayBills.forEach(b => {
    const slot = getHourSlot(b.time);
    hourlySlots[slot] += b.total || b.amount || 0;
  });
  const hourlyData = Object.keys(hourlySlots).map(time => ({
    time,
    sales: hourlySlots[time]
  }));

  // 2. Weekly Comparative Margin
  const last7Days = Array.from({ length: 7 }, (_, i) => getRelativeDateUtil(6 - i));
  const weeklyData = last7Days.map(dateStr => {
    const dayName = getDayOfWeekName(dateStr);
    const dayBills = recentBills.filter(b => b.date === dateStr);
    const dayExpenses = expenses.filter(ex => ex.date === dateStr);
    
    const sales = dayBills.reduce((sum, b) => sum + (b.total || b.amount || 0), 0);
    const expenseAmt = dayExpenses.reduce((sum, ex) => sum + (ex.amount || 0), 0);
    const profit = Math.max(0, Math.round((sales * 0.28) - expenseAmt));
    
    return { day: dayName, sales, profit };
  });

  // 3. Monthly Expansion
  const monthlyData = Array.from({ length: 4 }, (_, wIdx) => {
    const weekNum = wIdx + 1;
    const startDayIdx = (3 - wIdx) * 7;
    const weekDates = Array.from({ length: 7 }, (_, dIdx) => getRelativeDateUtil(startDayIdx + 6 - dIdx));
    
    let sales = 0;
    let profit = 0;
    weekDates.forEach(dateStr => {
      const dayBills = recentBills.filter(b => b.date === dateStr);
      const dayExpenses = expenses.filter(ex => ex.date === dateStr);
      const daySales = dayBills.reduce((sum, b) => sum + (b.total || b.amount || 0), 0);
      const dayExpensesAmt = dayExpenses.reduce((sum, ex) => sum + (ex.amount || 0), 0);
      sales += daySales;
      profit += Math.max(0, Math.round((daySales * 0.28) - dayExpensesAmt));
    });
    
    return { week: `Week ${weekNum}`, sales, profit };
  });

  const weekTotal = weeklyData.reduce((sum, d) => sum + d.sales, 0);
  const monthTotal = monthlyData.reduce((sum, w) => sum + w.sales, 0);

  const activeCategoryObj = shopCategories.find(c => c.name.toLowerCase() === (currentMerchant?.category || 'Grocery').toLowerCase());
  const activeSubcategories = activeCategoryObj ? activeCategoryObj.subcategories : ['Groceries', 'Packaged Food', 'Detergents', 'Personal Care'];

  const subcatColors = ['#2563eb', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#14b8a6'];

  function getCategoryForProduct(productName) {
    const item = stockItems.find(s => s.name.toLowerCase() === productName.toLowerCase() || s.name.toLowerCase().includes(productName.toLowerCase()));
    if (item) return item.category;
    
    // Fallback to first subcategory of active shop category
    const activeCategoryObj = shopCategories.find(c => c.name.toLowerCase() === (currentMerchant?.category || 'Grocery').toLowerCase());
    return activeCategoryObj && activeCategoryObj.subcategories.length > 0 ? activeCategoryObj.subcategories[0] : 'Groceries';
  }

  const getCategoryBreakdownForBills = (billsList) => {
    const breakdown = {};
    activeSubcategories.forEach(sub => {
      breakdown[sub] = 0;
    });
    
    billsList.forEach(b => {
      if (b.itemsList) {
        const items = b.itemsList.split(',').map(s => s.trim()).filter(Boolean);
        const itemShare = Math.round((b.total || b.amount || 0) / Math.max(1, items.length));
        items.forEach(itemName => {
          const catName = getCategoryForProduct(itemName);
          if (breakdown[catName] !== undefined) {
            breakdown[catName] += itemShare;
          } else {
            const matchedSub = activeSubcategories.find(s => s.toLowerCase() === catName.toLowerCase());
            if (matchedSub) {
              breakdown[matchedSub] += itemShare;
            } else if (activeSubcategories.length > 0) {
              breakdown[activeSubcategories[0]] += itemShare;
            }
          }
        });
      }
    });
    
    return activeSubcategories.slice(0, 4).map((sub, idx) => ({
      name: sub,
      value: breakdown[sub] || 0,
      color: subcatColors[idx % subcatColors.length]
    }));
  };

  const categoryDataToday = getCategoryBreakdownForBills(recentBills.filter(b => b.date === todayISO));
  const categoryDataWeek = getCategoryBreakdownForBills(recentBills.filter(b => {
    const cutoff = getRelativeDateUtil(6);
    return b.date >= cutoff;
  }));
  const categoryDataMonth = getCategoryBreakdownForBills(recentBills.filter(b => {
    const cutoff = getRelativeDateUtil(29);
    return b.date >= cutoff;
  }));

  const categoryData = reportsFilter === 'day' 
    ? categoryDataToday 
    : reportsFilter === 'week' 
      ? categoryDataWeek 
      : categoryDataMonth;

  // Dynamic Product Sales data for Reports drill-down
  const getDrillDownProducts = () => {
    const dayRange = reportsFilter === 'day' ? 0 : reportsFilter === 'week' ? 6 : 29;
    const cutoff = getRelativeDateUtil(dayRange);
    const filterBills = recentBills.filter(b => b.date >= cutoff);
    
    const productsMap = {};
    filterBills.forEach(b => {
      if (b.itemsList) {
        const items = b.itemsList.split(',').map(s => s.trim()).filter(Boolean);
        items.forEach(itemName => {
          const stockItem = stockItems.find(s => s.name.toLowerCase() === itemName.toLowerCase() || s.name.toLowerCase().includes(itemName.toLowerCase()));
          const price = stockItem ? stockItem.price : 50;
          
          if (productsMap[itemName]) {
            productsMap[itemName].units += 1;
            productsMap[itemName].revenue += price;
          } else {
            productsMap[itemName] = {
              id: stockItem ? stockItem.id : Date.now() + Math.random(),
              name: itemName,
              units: 1,
              revenue: price
            };
          }
        });
      }
    });
    
    const sorted = Object.values(productsMap).sort((a, b) => b.units - a.units);
    return sorted.slice(0, 8);
  };

  const getKpisForFilter = (filter) => {
    const dayRange = filter === 'day' ? 0 : filter === 'week' ? 6 : 29;
    const cutoff = getRelativeDateUtil(dayRange);
    const filterBills = recentBills.filter(b => b.date >= cutoff);
    const filterExpenses = expenses.filter(ex => ex.date >= cutoff);
    
    const sales = filterBills.reduce((sum, b) => sum + (b.total || b.amount || 0), 0);
    const expenseAmt = filterExpenses.reduce((sum, ex) => sum + (ex.amount || 0), 0);
    const itemsSold = filterBills.reduce((sum, b) => sum + (b.items || 0), 0);
    const invoicesCount = filterBills.length;
    
    const aov = invoicesCount > 0 ? Math.round(sales / invoicesCount) : 0;
    const margin = sales > 0 ? '28%' : '0%';
    const retention = invoicesCount > 0 ? `${Math.min(95, 70 + invoicesCount)}%` : '0%';
    
    const numDays = filter === 'day' ? 1 : filter === 'week' ? 7 : 30;
    const avgSale = filter === 'day' ? sales : Math.round(sales / numDays);
    const avgProfit = filter === 'day' 
      ? Math.max(0, Math.round(sales * 0.28 - expenseAmt))
      : Math.round(Math.max(0, sales * 0.28 - expenseAmt) / numDays);
    const avgCustomers = filter === 'day'
      ? (metrics.customersVisited || filterBills.length)
      : Math.round(Math.max(1, filterBills.length * 1.1) / numDays);
    const avgProductsPerSale = invoicesCount > 0 ? (itemsSold / invoicesCount).toFixed(1) : '0.0';
    
    return {
      aov: `₹${aov}`,
      margin,
      retention,
      itemsSold: itemsSold.toLocaleString('en-IN'),
      avgSale: `₹${avgSale.toLocaleString('en-IN')}`,
      avgProfit: `₹${avgProfit.toLocaleString('en-IN')}`,
      avgCustomers: avgCustomers.toString(),
      avgProductsPerSale
    };
  };

  const reportsKpis = getKpisForFilter(reportsFilter);

  // Restock Action Simulation
  const handleRestock = (id, name) => {
    setLowStockItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          return { ...item, qty: 15, status: 'restocked' };
        }
        return item;
      })
    );
    triggerToast(`Restocked ${name} to 15 units!`, 'success');

    setTimeout(() => {
      setLowStockItems(prev => prev.filter(item => item.id !== id));
    }, 1500);
  };

  // --- Stateful Transactions (Recent Bills) Ledger ---
  const [invoiceCounter, setInvoiceCounter] = useState(1);

  // Sync counter when merchant loads or recentBills updates to dynamically calculate the next sequence number
  useEffect(() => {
    if (currentMerchant) {
      const todayISO = new Date().toISOString().split('T')[0];
      const todayBills = recentBills.filter(b => b.date === todayISO);
      
      let maxSeq = 0;
      todayBills.forEach(b => {
        const parts = b.id.split('-');
        if (parts.length >= 3) {
          // Format is PREFIX-YYYYMMDD-SEQ
          const seq = parseInt(parts[parts.length - 1], 10);
          if (!isNaN(seq) && seq > maxSeq) {
            maxSeq = seq;
          }
        } else if (parts.length === 2) {
          // Format is PREFIX-SEQ (legacy format)
          const seq = parseInt(parts[1], 10);
          if (!isNaN(seq) && seq > maxSeq) {
            maxSeq = seq;
          }
        }
      });
      
      setInvoiceCounter(maxSeq + 1);
    }
  }, [currentMerchant, recentBills]);

  // Derive the active prefix (fallback to 'AK' before login)
  const activePrefix = currentMerchant ? getStorePrefix(currentMerchant.shopName) : 'AK';

  // --- Stateful Transactions (Recent Bills) Ledger (State declared at top) ---


  // Billing view controller (False = show recent ledger, True = show cash register)
  const [isCreatingBill, setIsCreatingBill] = useState(false);

  // --- Simulated Billing Cart State ---
  const [billingCart, setBillingCart] = useState([]);
  const [billingSearch, setBillingSearch] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash'); 
  const [offerAmount, setOfferAmount] = useState('0');
  const [availableBillingProducts, setAvailableBillingProducts] = useState([]);

  // --- Add Product Form States ---
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newStockName, setNewStockName] = useState('');
  const [newStockBuyingPrice, setNewStockBuyingPrice] = useState('');
  const [newStockSellingPrice, setNewStockSellingPrice] = useState('');
  const [newStockCategory, setNewStockCategory] = useState('Groceries');
  const [newStockQty, setNewStockQty] = useState('50');
  const [isSoldLoose, setIsSoldLoose] = useState(false);

  // --- Refill Stock Modal States ---
  const [showRefillModal, setShowRefillModal] = useState(false);
  const [refillItem, setRefillItem] = useState(null);
  const [refillQty, setRefillQty] = useState('10');

  // --- Billing History Archive States & Helpers ---
  const [showBillingHistoryModal, setShowBillingHistoryModal] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [historyDateFilter, setHistoryDateFilter] = useState(''); // ISO date string e.g. '2026-05-28'
  const [historyTab, setHistoryTab] = useState('bills'); // 'bills' | 'expenses'

  // --- Expenses State (State declared at top) ---

  // --- Add Expense Modal States ---
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Utilities');
  const [expensePayMethod, setExpensePayMethod] = useState('cash');

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!expenseDesc || !expenseAmount) {
      triggerToast('Please fill all fields!', 'error');
      return;
    }
    const amt = parseInt(expenseAmount) || 0;
    const todayISO = getRelativeDateUtil(0);
    const newExpense = {
      id: `EX-${String(expenses.length + 1).padStart(2, '0')}-${Date.now()}`,
      date: todayISO,
      time: `Today, ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
      description: expenseDesc,
      category: expenseCategory,
      amount: amt,
      paymentMethod: expensePayMethod.toUpperCase()
    };

    apiCall(`/api/shops/${currentMerchant.id}/expenses`, {
      method: 'POST',
      body: JSON.stringify(newExpense)
    })
      .then(data => {
        if (data.metrics) {
          setMetrics(data.metrics);
        }
        setExpenses(prev => [newExpense, ...prev]);
        triggerToast(`Expense "${expenseDesc}" of ₹${amt} recorded!`, 'success');
        setExpenseDesc('');
        setExpenseAmount('');
        setExpenseCategory('Utilities');
        setExpensePayMethod('cash');
        setShowAddExpenseModal(false);
      })
      .catch(err => {
        triggerToast(err.message || 'Failed to record expense', 'error');
      });
  };

  const getFilteredExpenses = () => {
    const dayRange = reportsFilter === 'day' ? 0 : reportsFilter === 'week' ? 6 : 29;
    const cutoffDate = getRelativeDateUtil(dayRange);
    let filtered = expenses.filter(ex => ex.date >= cutoffDate);
    if (historyDateFilter) return expenses.filter(ex => ex.date === historyDateFilter);
    if (historySearch) {
      const q = historySearch.toLowerCase();
      filtered = filtered.filter(ex =>
        ex.description.toLowerCase().includes(q) ||
        t(ex.description).toLowerCase().includes(q) ||
        ex.category.toLowerCase().includes(q) ||
        t(ex.category).toLowerCase().includes(q) ||
        ex.paymentMethod.toLowerCase().includes(q) ||
        t(ex.paymentMethod).toLowerCase().includes(q) ||
        ex.amount.toString().includes(q)
      );
    }
    return filtered;
  };

  const getBillingHistory = () => {
    let baseBills = [...recentBills];

    // Apply date-picker filter
    if (historyDateFilter) {
      return baseBills.filter(b => b.date === historyDateFilter);
    }

    // Otherwise filter by reportsFilter timeframe (Day/Week/Month)
    const dayRange = reportsFilter === 'day' ? 0 : reportsFilter === 'week' ? 6 : 29;
    const cutoff = getRelativeDateUtil(dayRange);
    baseBills = baseBills.filter(b => b.date >= cutoff);

    if (!historySearch) return baseBills;
    const q = historySearch.toLowerCase();
    return baseBills.filter(b =>
      b.id.toString().toLowerCase().includes(q) ||
      b.time.toLowerCase().includes(q) ||
      (b.paymentMethod && (b.paymentMethod.toLowerCase().includes(q) || t(b.paymentMethod).toLowerCase().includes(q))) ||
      (b.itemsList && (
        b.itemsList.toLowerCase().includes(q) ||
        b.itemsList.split(',').map(s => s.trim()).some(itemName => t(itemName).toLowerCase().includes(q))
      )) ||
      (b.total !== undefined && b.total.toString().includes(q))
    );
  };

  // --- Reports Drill-Down States & Helpers ---
  const [selectedReportCategory, setSelectedReportCategory] = useState(null);

  const handleCategoryClick = (categoryName) => {
    setSelectedReportCategory(prev => prev === categoryName ? null : categoryName);
  };

  const handleAddToCart = (product) => {
    setBillingCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
    triggerToast(t('addedToCart', { name: t(product.name) }), 'success');
  };

  const handleUpdateCartQty = (id, delta) => {
    setBillingCart(prev => {
      const updated = prev.map(item => {
        if (item.id === id) {
          const newQty = item.qty + delta;
          return newQty > 0 ? { ...item, qty: newQty } : null;
        }
        return item;
      }).filter(Boolean);
      
      if (updated.length === 0) {
        setShowPaymentModal(false);
      }
      return updated;
    });
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    if (billingCart.length === 0) {
      triggerToast('Cart is empty!', 'error');
      return;
    }
    setOfferAmount('0'); // Default to 0
    setPaymentMethod('cash'); // Default to cash
    setShowPaymentModal(true); // Open checkout detail prompt
  };

  const handleConfirmPayment = (e) => {
    e.preventDefault();
    
    const originalTotal = billingCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const totalQty = billingCart.reduce((sum, item) => sum + item.qty, 0);
    const discount = Number(offerAmount) || 0;
    const finalTotal = Math.max(0, originalTotal - discount);

    const itemNamesList = billingCart.map(c => c.name).join(', ');
    const paddedNum = String(invoiceCounter).padStart(2, '0');
    const todayDateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const newInvoiceId = `${activePrefix}-${todayDateStr}-${paddedNum}`;

    const newBillItem = {
      id: newInvoiceId,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().split('T')[0],
      items: totalQty,
      total: finalTotal,
      amount: finalTotal,
      paymentMethod: paymentMethod.toUpperCase(),
      discount: discount,
      itemsList: itemNamesList,
      cartItems: billingCart.map(ci => ({ id: ci.id, qty: ci.qty }))
    };

    apiCall(`/api/shops/${currentMerchant.id}/bills`, {
      method: 'POST',
      body: JSON.stringify(newBillItem)
    })
      .then(data => {
        // Update metrics returned by the server
        if (data.metrics) {
          setMetrics(data.metrics);
        }

        // Prepend to bills state
        setRecentBills([newBillItem, ...recentBills]);

        // Decrement local stock items state (to match database update)
        setStockItems(prev => prev.map(item => {
          const cartItem = billingCart.find(c => c.id === item.id || c.name === item.name);
          if (cartItem) {
            return { ...item, stock: Math.max(0, item.stock - cartItem.qty) };
          }
          return item;
        }));

        // Update top selling products list (persisted locally)
        setTopProducts(prev => {
          let updated = [...prev];
          billingCart.forEach(cartItem => {
            const foundIndex = updated.findIndex(p => p.name === cartItem.name);
            if (foundIndex !== -1) {
              updated[foundIndex] = {
                ...updated[foundIndex],
                units: updated[foundIndex].units + cartItem.qty,
                revenue: updated[foundIndex].revenue + (cartItem.price * cartItem.qty)
              };
            } else {
              updated.push({
                id: Date.now() + Math.random(),
                name: cartItem.name,
                units: cartItem.qty,
                revenue: cartItem.price * cartItem.qty
              });
            }
          });
          return updated.sort((a, b) => b.units - a.units).slice(0, 7);
        });

        triggerToast(t('billGenerated', { total: finalTotal, method: paymentMethod.toUpperCase() }), 'success');
        setBillingCart([]);
        setBillingSearch('');
        setShowPaymentModal(false);
        setIsCreatingBill(false); // Close cash register
      })
      .catch(err => {
        triggerToast(err.message || 'Failed to record bill', 'error');
      });
  };

  const cartTotal = billingCart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const filteredBillingProducts = availableBillingProducts.filter(p => 
    p.name.toLowerCase().includes(billingSearch.toLowerCase()) ||
    t(p.name).toLowerCase().includes(billingSearch.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(billingSearch.toLowerCase()) ||
    t(p.category || '').toLowerCase().includes(billingSearch.toLowerCase())
  );

  // --- Simulated Stock ---
  const [stockSearch, setStockSearch] = useState('');
  // --- Stock Items State (State declared at top) ---

  // Dynamic stock loader per merchant store from database
  useEffect(() => {
    if (currentMerchant) {
      apiCall(`/api/shops/${currentMerchant.id}/inventory`)
        .then(data => {
          setStockItems(data.items || []);
        })
        .catch(err => {
          console.error("Failed to load inventory:", err);
        });
    }
  }, [currentMerchant]);

  // Synchronize stock changes to availableBillingProducts
  useEffect(() => {
    if (currentMerchant) {
      const billingProds = stockItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        stock: item.stock,
        category: item.category,
        isLoose: item.isLoose || false
      }));
      setAvailableBillingProducts(billingProds);
    }
  }, [stockItems, currentMerchant]);

  // Dynamic derivation of low stock items from active store stock Items
  useEffect(() => {
    if (stockItems && stockItems.length > 0) {
      const lowItems = stockItems
        .filter(item => item.stock <= (item.minStock || 5))
        .map(item => ({
          id: item.id,
          name: item.name,
          qty: item.stock,
          originalQty: item.stock,
          status: 'low'
        }));
      setLowStockItems(lowItems);
    } else {
      setLowStockItems([]);
    }
  }, [stockItems]);

  // Store-isolated data loader for bills, expenses, notifications, top products, metrics
  useEffect(() => {
    if (currentMerchant) {
      const username = currentMerchant.username;
      
      // 1. Recent Bills Loader
      apiCall(`/api/shops/${currentMerchant.id}/bills`)
        .then(data => {
          setRecentBills(data.bills || []);
        })
        .catch(err => {
          console.error("Failed to load bills:", err);
        });

      // 2. Expenses Loader
      apiCall(`/api/shops/${currentMerchant.id}/expenses`)
        .then(data => {
          setExpenses(data.expenses || []);
        })
        .catch(err => {
          console.error("Failed to load expenses:", err);
        });

      // 3. Notifications Loader
      apiCall(`/api/shops/${currentMerchant.id}/notifications`)
        .then(data => {
          const dbNotifs = data.notifications || [];
          const daysLeft = getDaysRemaining(currentMerchant.renewalDate);
          if (daysLeft > 0 && daysLeft <= 2) {
            const warningId = 999999;
            const isDismissed = sessionStorage.getItem(`dismissed_expiry_warn_${currentMerchant.id}`);
            if (!isDismissed && !dbNotifs.some(n => n.id === warningId)) {
              dbNotifs.unshift({
                id: warningId,
                text: `⚠️ Your subscription plan expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}! Please renew soon.`,
                time: 'Just now',
                read: false,
                type: 'warning'
              });
            }
          }
          setNotifications(dbNotifs);
        })
        .catch(err => {
          console.error("Failed to load notifications:", err);
        });

      // 4. Top Products Loader (stored in localStorage)
      const topKey = `apna_khata_top_products_${username}`;
      const savedTop = localStorage.getItem(topKey);
      if (savedTop) {
        setTopProducts(JSON.parse(savedTop));
      } else {
        const defaultTop = [
          { id: 1, name: "Parle-G Biscuit", units: 24, revenue: 288 },
          { id: 2, name: "Tata Salt 1kg", units: 18, revenue: 468 },
          { id: 3, name: "Surf Excel 500g", units: 12, revenue: 840 },
          { id: 4, name: "Maggi Noodles", units: 10, revenue: 250 },
          { id: 5, name: "Colgate 150g", units: 8, revenue: 320 },
          { id: 6, name: "Tata Tea 250g", units: 6, revenue: 660 },
          { id: 7, name: "Aashirvaad Atta 5kg", units: 4, revenue: 960 }
        ];
        setTopProducts(defaultTop);
      }
    }
  }, [currentMerchant]);

  // Synchronizers: Save state modifications back to local storage (only topProducts is local)
  useEffect(() => {
    if (currentMerchant) {
      localStorage.setItem(`apna_khata_top_products_${currentMerchant.username}`, JSON.stringify(topProducts));
    }
  }, [topProducts, currentMerchant]);

  // Metrics Synchronizer: propagates local metrics back to global store registry and localStorage
  useEffect(() => {
    if (currentMerchant && metrics) {
      setStoreRegistry(prev => prev.map(s => 
        s.username === currentMerchant.username 
          ? { ...s, metrics } 
          : s
      ));
    }
  }, [metrics, currentMerchant]);

  // Pre-initialize newStockCategory to merchant's first subcategory
  useEffect(() => {
    if (currentMerchant) {
      const activeCategoryObj = shopCategories.find(c => c.name.toLowerCase() === (currentMerchant.category || 'Grocery').toLowerCase());
      const activeSubcategories = activeCategoryObj ? activeCategoryObj.subcategories : [];
      if (activeSubcategories.length > 0) {
        setNewStockCategory(activeSubcategories[0]);
      }
    }
  }, [currentMerchant, shopCategories]);

  const handleQuickAddStock = (id, name) => {
    const item = stockItems.find(s => s.id === id);
    if (item) {
      setRefillItem(item);
      setRefillQty('10');
      setShowRefillModal(true);
    }
  };

  const handleConfirmRefill = (e) => {
    e.preventDefault();
    if (!refillItem) return;
    const qtyToAdd = parseInt(refillQty) || 0;
    if (qtyToAdd <= 0) {
      triggerToast('Please enter a valid quantity greater than 0', 'error');
      return;
    }

    const newStock = refillItem.stock + qtyToAdd;

    apiCall(`/api/shops/${currentMerchant.id}/inventory/${refillItem.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ stock: newStock })
    })
      .then(data => {
        setStockItems(prev => prev.map(item => item.id === refillItem.id ? data.item : item));
        const unitLabel = refillItem.isLoose ? 'Kg' : 'units';
        triggerToast(t('addedUnitsTo', { qty: qtyToAdd, unit: unitLabel, name: t(refillItem.name) }), 'success');
        setShowRefillModal(false);
        setRefillItem(null);
      })
      .catch(err => {
        triggerToast(err.message || 'Failed to refill stock', 'error');
      });
  };

  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!newStockName || !newStockBuyingPrice || !newStockSellingPrice || !newStockQty) {
      triggerToast(t('allFieldsRequired'), 'error');
      return;
    }

    const finalName = newStockName + (isSoldLoose ? " (per Kg)" : "");
    const sellingPrice = parseInt(newStockSellingPrice) || 0;
    const buyingPrice = parseInt(newStockBuyingPrice) || 0;
    const openingStock = parseInt(newStockQty) || 50;
    const minStock = isSoldLoose ? 5 : 8;

    apiCall(`/api/shops/${currentMerchant.id}/inventory`, {
      method: 'POST',
      body: JSON.stringify({
        name: finalName,
        category: newStockCategory,
        stock: openingStock,
        price: sellingPrice,
        buyingPrice: buyingPrice,
        minStock: minStock,
        isLoose: isSoldLoose
      })
    })
      .then(data => {
        setStockItems(prev => [...prev, data.item]);
        triggerToast(t('successfullyAddedToInventory', { name: t(newStockName) }), 'success');

        // Reset Form and close modal
        setNewStockName('');
        setNewStockBuyingPrice('');
        setNewStockSellingPrice('');
        setNewStockQty('50');
        setIsSoldLoose(false);
        setShowAddProductModal(false);
      })
      .catch(err => {
        triggerToast(err.message || 'Failed to add product', 'error');
      });
  };

  const filteredStock = stockItems.filter(item =>
    item.name.toLowerCase().includes(stockSearch.toLowerCase()) ||
    t(item.name).toLowerCase().includes(stockSearch.toLowerCase()) ||
    item.category.toLowerCase().includes(stockSearch.toLowerCase()) ||
    t(item.category).toLowerCase().includes(stockSearch.toLowerCase())
  );

  // --- Authentication Actions ---
  const handleLoginMerchant = (e) => {
    e.preventDefault();
    if (!usernameInput || !passwordInput) {
      triggerToast('Please fill all fields', 'error');
      return;
    }

    apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: usernameInput, password: passwordInput })
    })
      .then(data => {
        const shop = data.shop;
        setCookie('apna_khata_session_user', shop.id, 7);
        setCookie('apna_khata_session_role', 'merchant', 7);

        setCurrentMerchant(shop);
        setSessionUser(shop.id);
        setSessionRole('merchant');
        triggerToast(`Welcome back, ${shop.ownerName}!`, 'success');
        
        setUsernameInput('');
        setPasswordInput('');
      })
      .catch(err => {
        if (err.status === 403 && err.data?.shopId) {
          setPendingPaymentShopId(err.data.shopId);
          setPendingPaymentShopName(err.data.shopName || err.data.shopId);
          triggerToast('Subscription expired! Select a plan to pay & activate.', 'warning');
        } else {
          triggerToast(err.message || 'Incorrect merchant credentials!', 'error');
        }
      });
  };

  const handleLoginAdmin = (e) => {
    e.preventDefault();
    if (!usernameInput || !passwordInput) {
      triggerToast('Please fill all fields', 'error');
      return;
    }

    apiCall('/api/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({ username: usernameInput, password: passwordInput })
    })
      .then(data => {
        setCookie('apna_khata_session_user', data.user, 1);
        setCookie('apna_khata_session_role', 'admin', 1);
        setSessionUser(data.user);
        setSessionRole('admin');
        triggerToast('Welcome Super Admin!', 'success');
        setUsernameInput('');
        setPasswordInput('');
      })
      .catch(() => {
        triggerToast('Invalid Super Admin credentials!', 'error');
      });
  };

  const handleLogout = () => {
    deleteCookie('apna_khata_session_user');
    deleteCookie('apna_khata_session_role');
    
    setSessionUser(null);
    setSessionRole(null);
    setCurrentMerchant(null);
    setShowAccountDrawer(false);
    setStockItems([]);
    setRecentBills([]);
    setExpenses([]);
    setNotifications([]);
    setTopProducts([]);
    setMetrics({ sales: 0, profit: 0, expenses: 0, itemsSold: 0, customersVisited: 0 });
    triggerToast('Logged out successfully', 'success');
  };

  // --- Super Admin Actions ---
  const handleCreateStore = (e) => {
    e.preventDefault();
    if (!newShopName || !newOwnerName || !newUsername || !newPassword) {
      triggerToast('All parameters are required!', 'error');
      return;
    }

    apiCall('/api/shops', {
      method: 'POST',
      body: JSON.stringify({
        username: newUsername,
        password: newPassword,
        shopName: newShopName,
        ownerName: newOwnerName,
        category: newStoreCategory,
        duration: newDuration
      })
    })
      .then(data => {
        setStoreRegistry(prev => [...prev, data.shop]);
        triggerToast(`Store "${newShopName}" created under Category "${newStoreCategory}"!`, 'success');
        setNewShopName('');
        setNewOwnerName('');
        setNewUsername('');
        setNewPassword('');
        setNewStoreCategory('Grocery');
      })
      .catch(err => {
        triggerToast(err.message || 'Failed to create store', 'error');
      });
  };

  const toggleStoreSubscription = (shopId) => {
    apiCall(`/api/shops/${shopId}/subscription`, {
      method: 'PATCH'
    })
      .then(data => {
        setStoreRegistry(prev => prev.map(s => s.id === shopId ? data.shop : s));
        triggerToast('Store subscription status updated!', 'success');
      })
      .catch(err => {
        triggerToast(err.message || 'Failed to update subscription status', 'error');
      });
  };

  const updateStoreSubscription = (shopId, updateParams) => {
    apiCall(`/api/shops/${shopId}/subscription`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateParams)
    })
      .then(data => {
        setStoreRegistry(prev => prev.map(s => s.id === shopId ? data.shop : s));
        triggerToast('Store subscription details updated!', 'success');
      })
      .catch(err => {
        triggerToast(err.message || 'Failed to update subscription details', 'error');
      });
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePricingLoginSubmit = (e) => {
    e.preventDefault();
    if (!pricingLoginUsername || !pricingLoginPassword) {
      triggerToast('Please fill all fields', 'error');
      return;
    }

    apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: pricingLoginUsername, password: pricingLoginPassword })
    })
      .then(data => {
        const shop = data.shop;
        setCookie('apna_khata_session_user', shop.id, 7);
        setCookie('apna_khata_session_role', 'merchant', 7);

        setCurrentMerchant(shop);
        setSessionUser(shop.id);
        setSessionRole('merchant');
        triggerToast(`Signed in successfully!`, 'success');
        
        setShowPricingLoginModal(false);
        setPricingLoginUsername('');
        setPricingLoginPassword('');

        if (selectedPlanInfo) {
          setPendingPaymentShopId(shop.id);
          setPendingPaymentShopName(shop.shopName);
          handleRenewSubscriptionForShop(shop.id, shop.shopName, selectedPlanInfo.months, selectedPlanInfo.amount);
        }
      })
      .catch(err => {
        if (err.status === 403 && err.data?.shopId) {
          setShowPricingLoginModal(false);
          setPricingLoginUsername('');
          setPricingLoginPassword('');
          
          setPendingPaymentShopId(err.data.shopId);
          setPendingPaymentShopName(err.data.shopName || err.data.shopId);
          triggerToast('Account verified! Proceeding to payment...', 'info');
          
          if (selectedPlanInfo) {
            handleRenewSubscriptionForShop(err.data.shopId, err.data.shopName || err.data.shopId, selectedPlanInfo.months, selectedPlanInfo.amount);
          }
        } else {
          triggerToast(err.message || 'Incorrect credentials!', 'error');
        }
      });
  };

  const handleConfirmSimulatedPayment = async () => {
    if (!simulatedPaymentDetails) return;
    setIsSimulatingPayment(true);
    setSimulatedStatus('processing');

    setTimeout(async () => {
      try {
        const verifyData = await apiCall('/api/payments/verify', {
          method: 'POST',
          body: JSON.stringify({
            shopId: simulatedPaymentDetails.shopId,
            amount: simulatedPaymentDetails.amount
          })
        });

        if (verifyData.success) {
          setSimulatedStatus('success');
          setTimeout(() => {
            triggerToast('Payment successful! Subscription activated.', 'success');
            setShowSimulatedGateway(false);
            setSimulatedPaymentDetails(null);
            setPendingPaymentShopId(null);
            
            const shop = verifyData.shop;
            if (currentMerchant) {
              setCurrentMerchant(shop);
            } else {
              setCookie('apna_khata_session_user', shop.id, 7);
              setCookie('apna_khata_session_role', 'merchant', 7);
              setCurrentMerchant(shop);
              setSessionUser(shop.id);
              setSessionRole('merchant');
            }
            navigate('/');
          }, 1000);
        }
      } catch (err) {
        setSimulatedStatus('failed');
        setIsSimulatingPayment(false);
        triggerToast(err.message || 'Simulated payment verification failed', 'error');
      }
    }, 2000);
  };

  const handleRenewSubscription = async (months, amount) => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      triggerToast('Razorpay SDK failed to load. Are you online?', 'error');
      return;
    }

    const activeShopId = pendingPaymentShopId || currentMerchant?.id;
    const activeShopName = pendingPaymentShopName || currentMerchant?.shopName;
    if (!activeShopId) {
      setSelectedPlanInfo({ months, amount });
      setShowPricingLoginModal(true);
      return;
    }

    handleRenewSubscriptionForShop(activeShopId, activeShopName, months, amount);
  };

  const handleRenewSubscriptionForShop = async (activeShopId, activeShopName, months, amount) => {
    try {
      const data = await apiCall('/api/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({
          shopId: activeShopId,
          amount: amount,
          month: `${months} Months`
        })
      });

      if (data.isMock) {
        setSimulatedPaymentDetails({
          shopId: activeShopId,
          shopName: activeShopName,
          months: months,
          amount: amount,
          orderId: data.order.id,
          keyId: data.keyId
        });
        setSimulatedStatus('pending');
        setShowSimulatedGateway(true);
        return;
      }

      const options = {
        key: data.keyId,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'ApnaKhata',
        description: `Subscription Renewal - ${months} Month(s)`,
        order_id: data.order.id,
        handler: async function (response) {
          try {
            const verifyData = await apiCall('/api/payments/verify', {
              method: 'POST',
              body: JSON.stringify({
                shopId: activeShopId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            if (verifyData.success) {
              triggerToast('Payment successful! Subscription activated.', 'success');
              setPendingPaymentShopId(null);
              const shop = verifyData.shop;
              if (currentMerchant) {
                setCurrentMerchant(shop);
              } else {
                setCookie('apna_khata_session_user', shop.id, 7);
                setCookie('apna_khata_session_role', 'merchant', 7);
                setCurrentMerchant(shop);
                setSessionUser(shop.id);
                setSessionRole('merchant');
              }
            }
          } catch (verifyErr) {
            triggerToast(verifyErr.message || 'Payment verification failed!', 'error');
          }
        },
        prefill: {
          name: activeShopName,
        },
        theme: {
          color: '#2563eb'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      triggerToast(err.message || 'Failed to initiate payment', 'error');
    }
  };

  const adminActiveCount = storeRegistry.filter(s => s.subscriptionStatus === 'active').length;
  const adminLapsedCount = storeRegistry.length - adminActiveCount;
  const totalSimulatedRevenue = storeRegistry.filter(s => s.subscriptionStatus === 'active').reduce((sum, s) => {
    if (s.planDuration === 3) return sum + 233; // ~699/3
    if (s.planDuration === 12) return sum + 208; // ~2499/12
    return sum + 249;
  }, 0);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative select-none">
      
      {/* Toast Alert */}
      {toast.show && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[340px] bg-slate-900 text-white rounded-xl shadow-xl border border-slate-800 p-3.5 flex items-center justify-between transition-all duration-300">
          <div className="flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <p className="text-sm font-semibold text-slate-100">{toast.message}</p>
          </div>
          <button onClick={() => setToast(prev => ({ ...prev, show: false }))} className="text-slate-400 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GLOBAL ACCOUNT DETAILS DRAWER */}
      {/* ========================================================================= */}
      {showAccountDrawer && (
        <div className="absolute inset-0 z-45 bg-black/45 backdrop-blur-xs flex justify-end">
          <div className="w-[310px] bg-white h-full shadow-2xl flex flex-col animate-slide-in">
            
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-slate-800">Account Details</span>
              </div>
              <button 
                onClick={() => setShowAccountDrawer(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-slate-600 transition-all hover:bg-slate-50"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            
            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              {/* Profile Block */}
              <div className="flex flex-col items-center border-b border-slate-50 pb-5">
                <div className="w-20 h-20 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-black mb-4.5 shadow-inner">
                  {sessionRole === 'admin' ? 'Z' : (currentMerchant?.ownerName?.charAt(0) || 'U')}
                </div>
                <h2 className="font-extrabold text-slate-800 text-base text-center leading-tight">
                  {sessionRole === 'admin' ? 'Zakwan (Super Admin)' : currentMerchant?.shopName}
                </h2>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  {sessionRole === 'admin' ? 'System Administrator' : `Owner: ${currentMerchant?.ownerName}`}
                </p>
              </div>

              {/* Metrics / Details Cards list */}
              <div className="space-y-4">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block pl-1">Credentials & Status</span>
                
                {sessionRole === 'admin' ? (
                  // Super Admin Details details
                  <div className="space-y-3">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Access Clearance</span>
                      <span className="font-bold text-blue-600">Level 1 Super Admin</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Active Tenants</span>
                      <span className="font-bold text-slate-800">{adminActiveCount} stores</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Monthly Yield</span>
                      <span className="font-bold text-emerald-600">₹{totalSimulatedRevenue} / Month</span>
                    </div>
                  </div>
                ) : (
                  // Merchant Details details
                  currentMerchant && (() => {
                    const daysLeft = getDaysRemaining(currentMerchant.renewalDate);
                    return (
                      <div className="space-y-3">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-medium">Merchant ID</span>
                          <span className="font-bold text-slate-800">{currentMerchant.username}</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-medium">License Type</span>
                          <span className="font-bold text-blue-600">Premium License</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-medium">Subscription status</span>
                          <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                            {currentMerchant.subscriptionStatus === 'active' ? 'Active' : 'Expired'}
                          </span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-medium">Renewal Deadline</span>
                          <span className="font-bold text-slate-800">{currentMerchant.renewalDate}</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-medium">Days Remaining</span>
                          <span className={`font-bold ${daysLeft <= 2 ? 'text-rose-600 animate-pulse font-black' : 'text-slate-800'}`}>
                            {daysLeft > 0 ? `${daysLeft} Day${daysLeft > 1 ? 's' : ''}` : '0 Days (Expired)'}
                          </span>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            </div>

            {/* Logout panel */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-2">
              {sessionRole === 'merchant' && (
                <button
                  onClick={() => {
                    setShowAccountDrawer(false);
                    navigate('/pricing');
                  }}
                  className="w-full min-h-[44px] py-2.5 rounded-xl bg-blue-50 border border-blue-100 hover:bg-blue-100 text-blue-600 font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 shrink-0" />
                  View Pricing & Subscription
                </button>
              )}
              <button 
                onClick={handleLogout}
                className="w-full min-h-[44px] py-3 rounded-xl bg-rose-50 border border-rose-100 hover:bg-rose-100 hover:text-rose-700 text-rose-600 font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                Sign Out Session
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ROUTE A: SUPER ADMIN ROUTE (/admin) */}
      {/* ========================================================================= */}
      {isAdminRoute && !isPricingRoute && (
        <>
          {/* A1: Admin Login Screen (LIGHT THEME MATCHED) */}
          {sessionRole !== 'admin' ? (
            <div className="flex-1 flex flex-col justify-center px-6 py-12 bg-slate-50 text-slate-800 font-sans">
              <div className="text-center space-y-2 mb-6">
                <h1 className="text-3xl font-extrabold text-blue-600 tracking-tight leading-tight">ApnaKhata Admin</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Executive License Management Portal</p>
              </div>

              {/* Light Admin Card */}
              <div className="bg-white border border-slate-100 shadow-xl rounded-3xl p-6 space-y-6">
                <div className="border-b border-slate-50 pb-3">
                  <h2 className="text-base font-extrabold text-slate-700">Administrator Sign In</h2>
                  <p className="text-[11px] text-slate-400 mt-1">Please enter administrative security keys.</p>
                </div>

                <form onSubmit={handleLoginAdmin} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block pl-1">Super Admin ID</label>
                    <div className="relative">
                      <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                      <input 
                        type="text" 
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        placeholder="admin"
                        className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm focus:outline-none focus:border-blue-500 text-slate-800 placeholder-slate-400 font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block pl-1">Security Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm focus:outline-none focus:border-blue-500 text-slate-800 placeholder-slate-400 font-medium"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full min-h-[44px] mt-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/10 active:scale-98 transition-all"
                  >
                    Authenticate Console
                  </button>
                </form>

                {import.meta.env.DEV && (
                  <div className="p-3 bg-blue-50/50 border border-blue-100/50 rounded-2xl text-[10px] text-slate-500">
                    <p className="font-bold text-blue-800">💡 Super Admin Credentials (dev only):</p>
                    <p className="mt-1">• Username: <span className="text-blue-600 font-semibold">zakwan_admin</span></p>
                    <p>• Password: <span className="text-blue-600 font-semibold">zakwan@apnakhata</span></p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            
            // A2: Super Admin Operations Console (LIGHT THEME MATCHED)
            <div className="flex-1 flex flex-col bg-slate-50 text-slate-800 p-4 space-y-5 overflow-y-auto no-scrollbar font-sans">
              
              {/* Clean White Sticky Top bar */}
              <div className="bg-white sticky top-0 z-30 border-b border-slate-100 px-4 py-3 flex justify-between items-center -mx-4 -mt-4 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
                <div className="flex flex-col">
                  <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest leading-none">ApnaKhata Super Console</span>
                  <h1 className="text-base font-black text-slate-800 flex items-center gap-1.5 mt-1.5 leading-none">
                    <UserCheck className="w-4.5 h-4.5 text-blue-600" /> Admin Controller
                  </h1>
                </div>
                
                {/* Language selector & Account Details profile button */}
                <div className="flex items-center gap-2">
                  <select
                    value={language}
                    onChange={(e) => changeLanguage(e.target.value)}
                    className="text-[10px] font-extrabold bg-slate-50 border border-slate-100 text-blue-600 rounded-lg px-2 py-2 focus:outline-none cursor-pointer hover:bg-slate-100 transition-colors h-[44px]"
                    aria-label="Language Selector"
                  >
                    <option value="en">EN</option>
                    <option value="ta">தமிழ்</option>
                    <option value="ur">اردو</option>
                  </select>

                  <button 
                    onClick={() => setShowAccountDrawer(true)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-blue-600 hover:bg-blue-100 active:scale-95 transition-all"
                    aria-label="Admin Profile Details"
                  >
                    <UserCheck className="w-5 h-5 stroke-[2.2]" />
                  </button>
                </div>
              </div>

              {/* Two-Tab Sub-navigation Bar */}
              <nav className="flex bg-white rounded-2xl p-1 border border-slate-100 shadow-xs" aria-label="Admin console navigation">
                <button
                  type="button"
                  onClick={() => setAdminTab('directory')}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    adminTab === 'directory'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                      : 'text-slate-500 hover:bg-slate-50 active:bg-slate-100'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" /> Manage Shops
                </button>
                <button
                  type="button"
                  onClick={() => setAdminTab('analysis')}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    adminTab === 'analysis'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                      : 'text-slate-500 hover:bg-slate-50 active:bg-slate-100'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" /> Analysis
                </button>
              </nav>

              {adminTab === 'directory' ? (
                <>
                  {/* Stores Management Registry Card */}
                  <section className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <Users className="w-4.5 h-4.5 text-blue-600" /> Store Subscriptions ({storeRegistry.length})
                    </h3>
                    
                    <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto pr-1 no-scrollbar space-y-0.5">
                      {storeRegistry.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4 font-semibold">No stores registered yet.</p>
                      ) : (
                        storeRegistry.map(store => (
                          <div key={store.id} className="py-3 flex items-center justify-between text-xs gap-2">
                            <div className="flex flex-col space-y-1 max-w-[170px]">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-800 truncate">{store.shopName}</span>
                                <span className="text-[8px] font-black uppercase text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-100/50 select-none">
                                  {store.category || 'Grocery'}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-medium">Owner: {store.ownerName}</span>
                              <span className="text-[9px] text-slate-500 font-semibold">Expires: {store.renewalDate}</span>
                            </div>
                            
                            <div className="flex items-center">
                              <select
                                value={store.subscriptionStatus === 'expired' ? 'expired' : (store.planDuration || 1).toString()}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === 'expired') {
                                    updateStoreSubscription(store.id, { subscriptionStatus: 'expired' });
                                  } else {
                                    updateStoreSubscription(store.id, { subscriptionStatus: 'active', duration: parseInt(val) });
                                  }
                                }}
                                className="bg-slate-50 border border-slate-100 text-[10px] text-blue-600 font-extrabold rounded-lg px-2 py-1.5 focus:outline-none cursor-pointer max-w-[110px]"
                                aria-label="Select Pricing Plan"
                              >
                                <option value="1">1 Mo (₹249)</option>
                                <option value="3">3 Mo (₹699)</option>
                                <option value="12">1 Yr (₹2499)</option>
                                <option value="expired">Expired</option>
                              </select>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </section>

                  {/* Creator Form Card */}
                  <section className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <PlusCircle className="w-4.5 h-4.5 text-blue-600" /> Create Store Account
                    </h3>
                    
                    <form onSubmit={handleCreateStore} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input 
                          type="text"
                          required
                          placeholder="Shop Name"
                          value={newShopName}
                          onChange={(e) => setNewShopName(e.target.value)}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs focus:outline-none focus:border-blue-500 text-slate-800 font-semibold placeholder-slate-400"
                        />
                        <input 
                          type="text"
                          required
                          placeholder="Owner Name"
                          value={newOwnerName}
                          onChange={(e) => setNewOwnerName(e.target.value)}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs focus:outline-none focus:border-blue-500 text-slate-800 font-semibold placeholder-slate-400"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <input 
                          type="text"
                          required
                          placeholder="Username"
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs focus:outline-none focus:border-blue-500 text-slate-800 font-semibold placeholder-slate-400"
                        />
                        <input 
                          type="text"
                          required
                          placeholder="Password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs focus:outline-none focus:border-blue-500 text-slate-800 font-semibold placeholder-slate-400"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3.5">
                        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <span className="text-[9px] font-bold text-slate-400 uppercase pl-1.5">Plan</span>
                          <select 
                            value={newDuration} 
                            onChange={(e) => setNewDuration(e.target.value)}
                            className="flex-1 bg-transparent text-[11px] text-blue-600 font-bold focus:outline-none cursor-pointer"
                          >
                            <option value="1">1 Month (₹249)</option>
                            <option value="3">3 Months (₹699)</option>
                            <option value="12">1 Year (₹2499)</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <span className="text-[9px] font-bold text-slate-400 uppercase pl-1.5">Category</span>
                          <select 
                            value={newStoreCategory} 
                            onChange={(e) => setNewStoreCategory(e.target.value)}
                            className="flex-1 bg-transparent text-[11px] text-blue-600 font-bold focus:outline-none cursor-pointer"
                          >
                            {shopCategories.map(cat => (
                              <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <button 
                        type="submit"
                        className="w-full min-h-[44px] py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 active:scale-98 transition-all cursor-pointer shadow-md shadow-blue-500/10"
                      >
                        <Plus className="w-4 h-4" /> Provision Account
                      </button>
                    </form>
                  </section>

                  {/* Category Management Card */}
                  <section className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <Filter className="w-4.5 h-4.5 text-blue-600" /> Manage Shop Categories
                      </h3>
                    </div>
                    
                    {/* Form to Add New Category */}
                    <form onSubmit={handleCreateCategory} className="space-y-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <span className="text-[10px] font-extrabold text-blue-900 uppercase pl-0.5 block">Add Custom Category</span>
                      <div className="grid grid-cols-2 gap-3">
                        <input 
                          type="text"
                          required
                          placeholder="Name (e.g. Medical)"
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          className="p-2.5 rounded-xl bg-white border border-slate-100 text-xs focus:outline-none focus:border-blue-500 text-slate-800 font-semibold placeholder-slate-400 shadow-xs"
                        />
                        <input 
                          type="text"
                          required
                          placeholder="Subs (e.g. Pills, Syrups)"
                          value={newCatSubs}
                          onChange={(e) => setNewCatSubs(e.target.value)}
                          className="p-2.5 rounded-xl bg-white border border-slate-100 text-xs focus:outline-none focus:border-blue-500 text-slate-800 font-semibold placeholder-slate-400 shadow-xs"
                        />
                      </div>
                      <button 
                        type="submit"
                        className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] flex items-center justify-center gap-1.5 active:scale-98 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Save Category
                      </button>
                    </form>

                    {/* Categories List */}
                    <div className="divide-y divide-slate-100 max-h-[160px] overflow-y-auto pr-1 no-scrollbar space-y-2">
                      {shopCategories.map(cat => (
                        <div key={cat.id} className="pt-2 first:pt-0 flex flex-col space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-slate-800 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100/50">{cat.name}</span>
                            {!['cat-1', 'cat-2', 'cat-3'].includes(cat.id) && (
                              <button 
                                type="button"
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="text-rose-500 font-bold text-[10px] hover:underline cursor-pointer"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                            Sub-categories: {cat.subcategories.join(', ')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              ) : (
                // Analysis Tab
                <>
                  {/* Analysis Cards */}
                  <section className="grid grid-cols-2 gap-3.5 animate-fadeIn">
                    
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Registered</span>
                      </div>
                      <div className="mt-4">
                        <span className="text-2xl font-black text-slate-800 tracking-tight">{storeRegistry.length}</span>
                        <span className="text-[10px] font-semibold text-slate-400 block mt-1">Tenant stores</span>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
                      <div className="flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Stores</span>
                      </div>
                      <div className="mt-4">
                        <span className="text-2xl font-black text-emerald-600 tracking-tight">{adminActiveCount}</span>
                        <span className="text-[10px] font-semibold text-slate-400 block mt-1">Licensed</span>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Not Active</span>
                      </div>
                      <div className="mt-4">
                        <span className="text-2xl font-black text-amber-500 tracking-tight">{adminLapsedCount}</span>
                        <span className="text-[10px] font-semibold text-slate-400 block mt-1">Lapsed/Expired</span>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
                      <div className="flex items-center gap-1.5">
                        <IndianRupee className="w-4 h-4 text-blue-600" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
                      </div>
                      <div className="mt-4">
                        <span className="text-2xl font-black text-blue-600 tracking-tight">
                          ₹{storeRegistry.reduce((sum, s) => sum + (s.planPrice || 249), 0).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md inline-block mt-1 w-max">
                          ₹{totalSimulatedRevenue} MRR
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* Plan Breakdown Categorization */}
                  <section className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <CreditCard className="w-4.5 h-4.5 text-blue-600" /> User Plan Choices
                    </h3>
                    
                    <div className="space-y-4">
                      {(() => {
                        const p1m = storeRegistry.filter(s => (s.planDuration || 1) === 1).length;
                        const p3m = storeRegistry.filter(s => s.planDuration === 3).length;
                        const p1y = storeRegistry.filter(s => s.planDuration === 12).length;
                        const total = storeRegistry.length;

                        const pct1m = total > 0 ? Math.round((p1m / total) * 100) : 0;
                        const pct3m = total > 0 ? Math.round((p3m / total) * 100) : 0;
                        const pct1y = total > 0 ? Math.round((p1y / total) * 100) : 0;

                        return (
                          <>
                            {/* 1 Month Plan */}
                            <div className="space-y-1.5 text-xs">
                              <div className="flex justify-between items-center text-slate-600 font-semibold">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> 1 Month (₹249)</span>
                                <span className="text-slate-400 font-bold">{p1m} users ({pct1m})</span>
                              </div>
                              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct1m}%` }} />
                              </div>
                            </div>

                            {/* 3 Month Plan */}
                            <div className="space-y-1.5 text-xs">
                              <div className="flex justify-between items-center text-slate-600 font-semibold">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> 3 Months (₹699)</span>
                                <span className="text-slate-400 font-bold">{p3m} users ({pct3m}%)</span>
                              </div>
                              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct3m}%` }} />
                              </div>
                            </div>

                            {/* 1 Year Plan */}
                            <div className="space-y-1.5 text-xs">
                              <div className="flex justify-between items-center text-slate-600 font-semibold">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> 1 Year (₹2499)</span>
                                <span className="text-slate-400 font-bold">{p1y} users ({pct1y}%)</span>
                              </div>
                              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${pct1y}%` }} />
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </section>

                  {/* Industry/Category Breakdown */}
                  <section className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <Filter className="w-4.5 h-4.5 text-blue-600" /> Store Industry Segments
                    </h3>
                    
                    <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
                      {(() => {
                        const counts = {};
                        storeRegistry.forEach(s => {
                          const cat = s.category || 'Grocery';
                          counts[cat] = (counts[cat] || 0) + 1;
                        });
                        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
                        const total = storeRegistry.length;

                        if (sorted.length === 0) {
                          return <p className="text-xs text-slate-400 text-center py-2 font-semibold">No store categorization available.</p>;
                        }

                        // Curated colors for progress bars
                        const colors = ['bg-blue-500', 'bg-pink-500', 'bg-amber-500', 'bg-emerald-500', 'bg-violet-500', 'bg-sky-500'];

                        return sorted.map(([cat, count], idx) => {
                          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                          const barColor = colors[idx % colors.length];
                          return (
                            <div key={cat} className="space-y-1.5 text-xs">
                              <div className="flex justify-between items-center text-slate-600 font-semibold">
                                <span className="flex items-center gap-1">
                                  <span className={`w-2 h-2 rounded-full ${barColor}`} /> {cat}
                                </span>
                                <span className="text-slate-400 font-bold">{count} store(s) ({pct}%)</span>
                              </div>
                              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full ${barColor} rounded-full`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </section>
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* ROUTE B: STORE MERCHANT ROUTE ('/') */}
      {/* ========================================================================= */}
      {!isAdminRoute && !isPricingRoute && (
        <>
          {/* B1: Merchant Login Page (LIGHT THEME MATCHED) */}
          {(!sessionUser || sessionRole !== 'merchant') ? (
            <div className="flex-1 flex flex-col justify-center px-6 py-12 bg-slate-50 text-slate-800 font-sans">
              <div className="text-center space-y-2 mb-6">
                <h1 className="text-3xl font-extrabold text-blue-600 tracking-tight leading-tight">ApnaKhata</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kirana Shop Manager Portal</p>
              </div>

              {pendingPaymentShopId ? (
                <div className="bg-white border border-slate-100 shadow-xl rounded-3xl p-6 space-y-6 max-w-md mx-auto w-full">
                  <div className="border-b border-slate-50 pb-3 flex justify-between items-center">
                    <div>
                      <h2 className="text-base font-extrabold text-slate-700">Renew Subscription</h2>
                      <p className="text-[11px] text-slate-400 mt-1">Select a pricing plan for <span className="font-bold text-blue-600">{pendingPaymentShopName}</span></p>
                    </div>
                    <button 
                      onClick={() => setPendingPaymentShopId(null)}
                      className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => handleRenewSubscription(1, 249)}
                      className="w-full text-left p-4 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50/10 flex justify-between items-center transition-all group"
                    >
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-800">1 Month Subscription</span>
                        <span className="text-[10px] text-slate-400 block font-medium">Standard monthly plan</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-blue-600">₹249</span>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider mt-0.5">/ Month</span>
                      </div>
                    </button>

                    <button
                      onClick={() => handleRenewSubscription(3, 699)}
                      className="w-full text-left p-4 rounded-2xl border-2 border-blue-100 bg-blue-50/5 hover:border-blue-500 hover:bg-blue-50/20 flex justify-between items-center transition-all relative group"
                    >
                      <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[8px] font-black uppercase tracking-wider">Popular</span>
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-800">3 Months Saver</span>
                        <span className="text-[10px] text-slate-400 block font-medium">Quarterly bundle - Save ₹48</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-blue-600">₹699</span>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider mt-0.5">/ 3 Mos</span>
                      </div>
                    </button>

                    <button
                      onClick={() => handleRenewSubscription(12, 2499)}
                      className="w-full text-left p-4 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50/10 flex justify-between items-center transition-all group"
                    >
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-800">1 Year Value</span>
                        <span className="text-[10px] text-slate-400 block font-medium">Best savings - Save ₹489</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-blue-600">₹2499</span>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider mt-0.5">/ Year</span>
                      </div>
                    </button>
                  </div>

                  <p className="text-[9px] text-center text-slate-400 font-medium">
                    Payments are handled securely via Razorpay. Your license will be automatically extended upon payment verification.
                  </p>
                </div>
              ) : (
                <div className="bg-white border border-slate-100 shadow-xl rounded-3xl p-6 space-y-6">
                  <div className="border-b border-slate-50 pb-3">
                    <h2 className="text-base font-extrabold text-slate-700">Merchant Sign In</h2>
                    <p className="text-[11px] text-slate-400 mt-1">Please enter your store credential keys below.</p>
                  </div>

                <form onSubmit={handleLoginMerchant} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block pl-1">Store Username</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                      <input 
                        type="text" 
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        placeholder="Store ID (e.g. rajan)"
                        className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm focus:outline-none focus:border-blue-500 text-slate-800 placeholder-slate-400 font-semibold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block pl-1">Security Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm focus:outline-none focus:border-blue-500 text-slate-800 placeholder-slate-400 font-semibold"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full min-h-[44px] mt-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/10 active:scale-98 transition-all"
                  >
                    Enter Merchant Workspace
                  </button>
                </form>

                <div className="p-3 bg-blue-50/50 border border-blue-100/50 rounded-2xl text-[10px] text-slate-500 space-y-1">
                  <p className="font-bold text-blue-800">💡 Kirana Demo Merchants:</p>
                  <p>• Username: <span className="text-blue-600 font-semibold">rajan</span> | Pass: <span className="text-blue-600 font-semibold">rajan_password123</span></p>
                  <p>• Username: <span className="text-blue-600 font-semibold">sharma</span> (Expired Subscription demonstration)</p>
                </div>
              </div>
              )}
            </div>
          ) : (
            
            // B2: Merchant Dashboard App Layout
            currentMerchant && (
              <>
                {/* Notifications Drawer */}
                {showNotifications && (
                  <div className="absolute inset-0 z-45 bg-black/40 backdrop-blur-sm flex justify-end">
                    <div className="w-[310px] bg-white h-full shadow-2xl flex flex-col">
                      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                        <div className="flex items-center gap-2">
                          <Bell className="w-5 h-5 text-blue-600" />
                          <span className="font-bold text-slate-800">Notifications</span>
                        </div>
                        <button 
                          onClick={() => setShowNotifications(false)}
                          className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <X className="w-4.5 h-4.5" />
                        </button>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {notifications.length === 0 ? (
                          <div className="h-40 flex flex-col items-center justify-center text-slate-400 space-y-2">
                            <Check className="w-10 h-10 text-emerald-500 bg-emerald-50 p-2 rounded-full" />
                            <p className="text-sm font-medium">All caught up!</p>
                          </div>
                        ) : (
                          notifications.map(n => (
                            <div 
                              key={n.id} 
                              className={`p-3 rounded-xl border transition-all ${
                                n.read 
                                  ? 'bg-slate-50/50 border-slate-100 text-slate-500' 
                                  : 'bg-blue-50/30 border-blue-100 text-slate-800'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex gap-2">
                                  {n.type === 'warning' && <AlertTriangle className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />}
                                  {n.type === 'success' && <TrendingUp className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />}
                                  {n.type === 'info' && <IndianRupee className="w-4.5 h-4.5 text-blue-500 shrink-0 mt-0.5" />}
                                  <p className="text-xs font-semibold leading-relaxed">{n.text}</p>
                                </div>
                                <button 
                                  onClick={() => handleClearNotification(n.id)}
                                  className="text-slate-400 hover:text-rose-500 p-0.5 shrink-0"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <div className="mt-2 flex justify-between items-center text-[10px] text-slate-400">
                                <span>{n.time}</span>
                                {!n.read && <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-bold">New</span>}
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {notifications.length > 0 && (
                        <div className="p-4 border-t border-slate-100 bg-slate-50">
                          <button 
                            onClick={handleMarkAllRead}
                            className="w-full py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center justify-center gap-2 shadow-xs"
                          >
                            <Check className="w-4 h-4 text-emerald-500" />
                            Mark all as read
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Top Bar */}
                <header className="bg-white sticky top-0 z-30 border-b border-slate-100/80 px-4 py-3 flex items-center justify-between backdrop-blur-md bg-white/90">
                  <div className="flex flex-col">
                    <h1 className="text-blue-600 font-extrabold text-xl tracking-tight leading-tight">ApnaKhata</h1>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={language}
                      onChange={(e) => changeLanguage(e.target.value)}
                      className="text-[10px] font-extrabold bg-slate-50 border border-slate-100 text-blue-600 rounded-lg px-2 py-2 focus:outline-none cursor-pointer hover:bg-slate-100 transition-colors h-[44px]"
                      aria-label="Language Selector"
                    >
                      <option value="en">EN</option>
                      <option value="ta">தமிழ்</option>
                      <option value="ur">اردو</option>
                    </select>

                    <div className="flex flex-col text-right">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{currentMerchant.shopName}</span>
                      <span className="text-[12px] font-semibold text-slate-800 mt-0.5">{todayDate}</span>
                    </div>
                    
                    {/* Notification Bell */}
                    <button 
                      onClick={() => setShowNotifications(true)}
                      className="w-[44px] h-[44px] flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-100 hover:text-slate-900 relative transition-all active:scale-95"
                      aria-label="Notifications"
                    >
                      <Bell className="w-5 h-5 stroke-[2.2]" />
                      {unreadCount > 0 && (
                        <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white ring-1 ring-rose-300" />
                      )}
                    </button>

                    {/* Account Icon Details Button */}
                    <button 
                      onClick={() => setShowAccountDrawer(true)}
                      className="w-[44px] h-[44px] flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-100 hover:text-slate-900 relative transition-all active:scale-95"
                      aria-label="Merchant Account Details"
                    >
                      <User className="w-5 h-5 stroke-[2.2]" />
                    </button>
                  </div>
                </header>

                {/* MAIN PAGE WRAPPER */}
                <main className="flex-1 px-4 py-4 space-y-5 overflow-y-auto overflow-x-hidden no-scrollbar font-sans text-slate-800 pb-28">
                  
                  {/* HOME TAB */}
                  {activeTab === 'home' && (
                    <>
                      {/* Summary Cards Grid (2x2) */}
                      <section className="grid grid-cols-2 gap-3.5">
                        <button 
                          onClick={() => {
                            setActiveTab('reports');
                            setReportsFilter('day');
                            setHistorySearch('');
                            setHistoryDateFilter('');
                            setShowBillingHistoryModal(true);
                          }}
                          className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between text-left active:scale-95 hover:border-blue-200 hover:shadow-blue-50 transition-all cursor-pointer group"
                          aria-label="View today's billing history"
                        >
                          <div className="flex justify-between items-start">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                              <IndianRupee className="w-5 h-5 stroke-[2.5]" />
                            </div>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">+12%</span>
                          </div>
                          <div className="mt-4">
                            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">₹{metrics.sales.toLocaleString('en-IN')}</span>
                            <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{t('totalSales')}</p>
                            <p className="text-[9px] font-bold text-blue-500 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">Tap to view bills →</p>
                          </div>
                        </button>

                        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
                            </div>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">+8%</span>
                          </div>
                          <div className="mt-4">
                            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">₹{metrics.profit.toLocaleString('en-IN')}</span>
                            <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{t('netProfit')}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setActiveTab('reports');
                            setReportsFilter('day');
                            setHistoryTab('expenses');
                            setHistorySearch('');
                            setHistoryDateFilter('');
                            setShowBillingHistoryModal(true);
                          }}
                          className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between text-left active:scale-95 hover:border-amber-200 hover:shadow-amber-50 transition-all cursor-pointer group"
                          aria-label="View expenses history"
                        >
                          <div className="flex justify-between items-start">
                            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-500 group-hover:text-white transition-all">
                              <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
                            </div>
                            <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-full">-4%</span>
                          </div>
                          <div className="mt-4">
                            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">₹{metrics.expenses.toLocaleString('en-IN')}</span>
                            <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{t('expenses')}</p>
                            <p className="text-[9px] font-bold text-amber-500 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">Tap to view expenses →</p>
                          </div>
                        </button>

                        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                              <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
                            </div>
                            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full">+15%</span>
                          </div>
                          <div className="mt-4">
                            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{metrics.itemsSold}</span>
                            <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{t('itemsSold')}</p>
                          </div>
                        </div>
                      </section>

                      {/* Customer Visits Summary Card */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                            <Users className="w-5 h-5 stroke-[2.2]" />
                          </div>
                          <div className="space-y-0.5">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('customersVisited')}</h4>
                            <p className="text-[11px] text-slate-400 font-semibold">Total customer visits today</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-black text-slate-900 tracking-tight">{metrics.customersVisited || 0}</span>
                          <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full block mt-1">+12%</span>
                        </div>
                      </div>

                      {/* Dashboard Active Alerts Notification Panel */}
                      {unreadCount > 0 && (
                        <section className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                          <h3 className="text-xs font-extrabold text-amber-600 uppercase tracking-widest flex items-center justify-between pl-0.5 select-none">
                            <div className="flex items-center gap-2">
                              <Bell className="w-4 h-4 text-amber-500 animate-bounce" />
                              <span>Active Shop Alerts ({unreadCount})</span>
                            </div>
                            <button 
                              onClick={handleMarkAllRead}
                              className="text-[10px] font-extrabold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                            >
                              Clear All
                            </button>
                          </h3>
                          
                          <div className="space-y-2.5">
                            {notifications.filter(n => !n.read).slice(0, 3).map((n) => (
                              <div 
                                key={n.id} 
                                className={`p-3 rounded-xl border flex items-start justify-between gap-3 transition-all ${
                                  n.type === 'warning' ? 'bg-amber-50/40 border-amber-100/70 text-slate-800' :
                                  n.type === 'success' ? 'bg-emerald-50/40 border-emerald-100/70 text-slate-800' :
                                  'bg-blue-50/40 border-blue-100/70 text-slate-800'
                                }`}
                              >
                                <div className="flex gap-2">
                                  {n.type === 'warning' && <AlertTriangle className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5 animate-pulse" />}
                                  {n.type === 'success' && <TrendingUp className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />}
                                  {n.type === 'info' && <IndianRupee className="w-4.5 h-4.5 text-blue-500 shrink-0 mt-0.5" />}
                                  <div className="flex flex-col space-y-0.5">
                                    <p className="text-xs font-semibold leading-relaxed text-slate-800">{n.text}</p>
                                    <span className="text-[9px] text-slate-400 font-semibold">{n.time}</span>
                                  </div>
                                </div>
                                
                                <button 
                                  onClick={() => handleClearNotification(n.id)}
                                  className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg bg-white/80 border border-slate-100 hover:bg-slate-100 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer shrink-0"
                                  aria-label="Dismiss notification"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      {/* Small operational card */}
                      <div className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-between shadow-xs">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-extrabold text-blue-600 uppercase tracking-widest block">Live operational status</span>
                          <p className="text-xs font-bold text-slate-700">All kirana store systems healthy</p>
                        </div>
                        <div className="w-3 h-3 bg-emerald-500 rounded-full border border-white ring-4 ring-emerald-100" />
                      </div>
                    </>
                  )}

                  {/* BILLING TAB */}
                  {activeTab === 'billing' && (
                    <div className="space-y-4 pb-6">
                      
                      {/* B1: Main Billing Dashboard View (Ledger & Plus Button) */}
                      {!isCreatingBill ? (
                        <div className="space-y-5">
                          
                          {/* Centered Premium Plus Button at the Top */}
                          <div className="flex flex-col items-center justify-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                            <button 
                              onClick={() => {
                                setBillingCart([]);
                                setBillingSearch('');
                                setIsCreatingBill(true);
                              }}
                              className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 active:scale-90 hover:scale-105 transition-all duration-200 border-4 border-blue-50 cursor-pointer"
                              aria-label="Create New Bill"
                            >
                              <Plus className="w-8 h-8 stroke-[3]" />
                            </button>
                            <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">Create New Bill</span>
                          </div>

                          {/* Recent Bills Ledger Section */}
                          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3.5">
                            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest pl-1">Recent Bills</h3>
                            
                            <div className="space-y-3 divide-y divide-slate-100">
                              {recentBills.map(bill => (
                                <div key={bill.id} className="flex items-center justify-between text-xs pt-3 first:pt-0 first:border-0 border-t border-slate-100">
                                  <div className="flex flex-col space-y-0.5">
                                    <span className="font-extrabold text-slate-800 text-sm">Invoice #{bill.id}</span>
                                    <span className="text-[10px] text-slate-400 font-semibold">{bill.time} • {bill.items} items sold</span>
                                  </div>
                                  
                                  {/* Amount Highlighted in high-contrast vivid blue pill badge */}
                                  <span className="font-black text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3.5 py-2 rounded-xl text-base shrink-0 shadow-xs select-none">
                                    ₹{(bill.total || bill.amount || 0).toLocaleString('en-IN')}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                        </div>
                      ) : (
                        
                        // B2: Full Screen Active Billing Cash Register overlay (No customer details fields!)
                        <div className="absolute inset-0 z-45 bg-slate-50 flex flex-col font-sans text-slate-800">
                          
                          {/* Top Bar Header */}
                          <div className="bg-white border-b border-slate-100 px-4 py-4 flex items-center justify-between sticky top-0 shadow-[0_1px_3px_rgba(0,0,0,0.02)] shrink-0">
                            <button 
                              onClick={() => setIsCreatingBill(false)}
                              className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-500 font-extrabold text-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                            >
                              <X className="w-4 h-4 text-slate-600" /> Cancel
                            </button>
                            <h2 className="text-sm font-black text-slate-800 tracking-tight uppercase">Invoice Register</h2>
                            <button 
                              onClick={() => setBillingCart([])}
                              disabled={billingCart.length === 0}
                              className={`min-h-[44px] px-3.5 py-2 rounded-xl border font-extrabold text-xs active:scale-95 transition-all cursor-pointer ${
                                billingCart.length === 0 
                                  ? 'bg-slate-50 border-slate-50 text-slate-300 cursor-not-allowed' 
                                  : 'bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100'
                              }`}
                            >
                              Clear
                            </button>
                          </div>

                          {/* Search Area */}
                          <div className="bg-white p-4 border-b border-slate-100 shrink-0">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                              <input 
                                type="text" 
                                value={billingSearch}
                                onChange={(e) => setBillingSearch(e.target.value)}
                                placeholder="Search products (biscuit, salt, tea...)"
                                className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm focus:outline-none focus:border-blue-500 text-slate-800 placeholder-slate-400 font-semibold shadow-inner"
                              />
                            </div>
                          </div>

                          {/* Main Scrollable Content Box */}
                          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                            
                            {/* Spacious Product Selector Card */}
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4.5 space-y-3.5">
                              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block pl-0.5">
                                {billingSearch ? 'Search Results' : 'Kirana Products Catalog'}
                              </span>
                              
                              <div className="divide-y divide-slate-100 overflow-y-auto pr-1 no-scrollbar space-y-1">
                                {filteredBillingProducts.map(p => {
                                  const cartItem = billingCart.find(item => item.id === p.id);
                                  return (
                                    <div key={p.id} className="py-3 flex items-center justify-between text-sm first:pt-0 last:pb-0">
                                      <div className="flex flex-col space-y-0.5 max-w-[200px]">
                                        <span className="font-extrabold text-slate-800 text-sm truncate">{t(p.name)}</span>
                                        <span className="text-xs text-slate-400 font-bold">
                                          {p.isLoose ? `₹${p.price}/Kg • Stock: ${p.stock} Kg` : `₹${p.price} each • Stock: ${p.stock}`}
                                        </span>
                                      </div>
                                      
                                      <div className="flex items-center gap-2">
                                        {cartItem && (
                                          <span className="text-[10px] font-black bg-blue-50 text-blue-600 border border-blue-100/50 px-2 py-1 rounded-lg shrink-0">
                                            {cartItem.qty} Selected
                                          </span>
                                        )}
                                        <button 
                                          onClick={() => handleAddToCart(p)}
                                          className="min-h-[44px] min-w-[44px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center active:scale-95 transition-all shadow-sm shadow-blue-500/10 cursor-pointer"
                                          aria-label={`Add ${t(p.name)} to cart`}
                                        >
                                          <Plus className="w-5 h-5 stroke-[3]" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                                {filteredBillingProducts.length === 0 && (
                                  <p className="text-xs text-slate-400 font-semibold py-6 text-center">No matching products found.</p>
                                )}
                              </div>
                            </div>

                            {/* Product Selector list finishes here */}
                          </div>

                          {/* Sticky Full Width Billing Console Footer */}
                          <div className="p-4 bg-white border-t border-slate-100 shadow-[0_-2px_15px_rgba(0,0,0,0.03)] shrink-0 space-y-3">
                            <div className="flex justify-between items-center px-1">
                              <div className="flex flex-col">
                                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Total Payable</span>
                                <span className="text-xs font-bold text-slate-500 mt-0.5">
                                  {billingCart.reduce((sum, item) => sum + item.qty, 0)} items selected
                                </span>
                              </div>
                              <span className="text-lg font-black text-blue-600 bg-blue-50/70 px-3.5 py-1.5 rounded-xl border border-blue-100">
                                ₹{cartTotal.toLocaleString('en-IN')}
                              </span>
                            </div>
                            
                            <button 
                              onClick={handleCheckout}
                              disabled={billingCart.length === 0}
                              className={`w-full min-h-[48px] py-3.5 rounded-2xl text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer ${
                                billingCart.length === 0
                                  ? 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
                                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/10'
                              }`}
                            >
                              <Check className="w-5 h-5 stroke-[2.5]" /> 
                              Proceed to Checkout (₹{cartTotal})
                            </button>
                          </div>

                        </div>
                      )}

                      {/* Payment details popup overlay inside billing tab */}
                      {showPaymentModal && (
                        <div className="absolute inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-end justify-center font-sans">
                          <div className="w-full bg-white rounded-t-[32px] shadow-2xl p-6 space-y-5 animate-slide-up max-h-[85%] overflow-y-auto shrink-0 border-t border-slate-100 select-none no-scrollbar">
                            
                            {/* Modal Header */}
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                              <h3 className="text-base font-black text-slate-800 tracking-tight">Checkout & Payment</h3>
                              <button 
                                onClick={() => setShowPaymentModal(false)}
                                className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Selected Items Review ("Cart Thing" added here!) */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                              <div className="bg-slate-50/70 px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Review Selected Items ({billingCart.length})</span>
                              </div>
                              <div className="divide-y divide-slate-100 max-h-[160px] overflow-y-auto no-scrollbar p-3 space-y-0.5">
                                {billingCart.map(item => (
                                  <div key={item.id} className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0">
                                    <div className="flex flex-col space-y-0.5">
                                      <span className="text-xs font-extrabold text-slate-800">{t(item.name)}</span>
                                      <span className="text-[10px] text-slate-400 font-bold">
                                        {item.isLoose ? `₹${item.price}/Kg` : `₹${item.price} each`}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="flex items-center gap-1.5">
                                        <button 
                                          onClick={() => handleUpdateCartQty(item.id, -1)} 
                                          className="text-slate-400 hover:text-slate-600 p-1 min-h-[32px] min-w-[32px] flex items-center justify-center active:scale-90"
                                          aria-label="Decrease quantity"
                                        >
                                          <MinusCircle className="w-5 h-5" />
                                        </button>
                                        <span className="text-xs font-black text-slate-800 w-4 text-center">{item.qty}</span>
                                        <button 
                                          onClick={() => handleUpdateCartQty(item.id, 1)} 
                                          className="text-slate-400 hover:text-slate-600 p-1 min-h-[32px] min-w-[32px] flex items-center justify-center active:scale-90"
                                          aria-label="Increase quantity"
                                        >
                                          <PlusCircle className="w-5 h-5" />
                                        </button>
                                      </div>
                                      <span className="text-xs font-extrabold text-slate-800 min-w-[50px] text-right">₹{item.price * item.qty}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Summary Invoice Details */}
                            <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-100 space-y-2.5">
                              <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <span>Cart Value ({billingCart.reduce((sum, item) => sum + item.qty, 0)} items)</span>
                                <span className="font-extrabold text-slate-600">₹{cartTotal}</span>
                              </div>
                              
                              {Number(offerAmount) > 0 && (
                                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                                  <span>Applied Discount</span>
                                  <span className="text-rose-500 font-extrabold">-₹{offerAmount}</span>
                                </div>
                              )}
                              
                              <div className="border-t border-slate-200/60 my-2 pt-2.5 flex justify-between items-center">
                                <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Net Payable</span>
                                <span className="text-xl font-black text-blue-600">₹{Math.max(0, cartTotal - (Number(offerAmount) || 0))}</span>
                              </div>
                            </div>

                            {/* Discount / Offer Field (Defaults to 0) */}
                            <div className="space-y-2">
                              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block pl-0.5">Offer / Discount Amount</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-extrabold text-slate-400 select-none">₹</span>
                                <input 
                                  type="number"
                                  min="0"
                                  max={cartTotal}
                                  value={offerAmount}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '') {
                                      setOfferAmount('');
                                    } else {
                                      const num = Math.min(cartTotal, Math.max(0, parseInt(val) || 0));
                                      setOfferAmount(num.toString());
                                    }
                                  }}
                                  placeholder="0"
                                  className="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm focus:outline-none focus:border-blue-500 text-slate-800 placeholder-slate-400 font-extrabold"
                                />
                              </div>
                            </div>

                            {/* Payment Method selector buttons */}
                            <div className="space-y-2.5">
                              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block pl-0.5">Select Payment Method</label>
                              <div className="grid grid-cols-3 gap-2.5">
                                {/* Cash Button */}
                                <button 
                                  type="button"
                                  onClick={() => setPaymentMethod('cash')}
                                  className={`py-3.5 px-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer ${
                                    paymentMethod === 'cash' 
                                      ? 'border-blue-500 bg-blue-50 text-blue-600' 
                                      : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100/50'
                                  }`}
                                >
                                  <IndianRupee className="w-5 h-5 stroke-[2.5]" />
                                  <span className="text-[11px] font-black tracking-tight uppercase">Cash</span>
                                </button>

                                {/* UPI Scan Button */}
                                <button 
                                  type="button"
                                  onClick={() => setPaymentMethod('upi')}
                                  className={`py-3.5 px-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer ${
                                    paymentMethod === 'upi' 
                                      ? 'border-blue-500 bg-blue-50 text-blue-600' 
                                      : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100/50'
                                  }`}
                                >
                                  <Smartphone className="w-5 h-5 stroke-[2.2]" />
                                  <span className="text-[11px] font-black tracking-tight uppercase">UPI Scan</span>
                                </button>

                                {/* Card Swipe Button */}
                                <button 
                                  type="button"
                                  onClick={() => setPaymentMethod('card')}
                                  className={`py-3.5 px-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer ${
                                    paymentMethod === 'card' 
                                      ? 'border-blue-500 bg-blue-50 text-blue-600' 
                                      : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100/50'
                                  }`}
                                >
                                  <CreditCard className="w-5 h-5 stroke-[2.2]" />
                                  <span className="text-[11px] font-black tracking-tight uppercase">Card Swipe</span>
                                </button>
                              </div>
                            </div>

                            {/* Confirm Button */}
                            <button 
                              onClick={handleConfirmPayment}
                              className="w-full min-h-[48px] py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/10 active:scale-98 transition-all cursor-pointer"
                            >
                              <Check className="w-5 h-5 stroke-[2.5]" />
                              Confirm & Print Invoice
                            </button>

                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* STOCK TAB */}
                  {activeTab === 'stock' && (
                    <div className="space-y-4 relative pb-20">
                      <div className="flex items-center justify-between">
                        <h2 className="text-base font-extrabold text-slate-800">{t('inventoryStock')}</h2>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                          <input 
                            type="text" 
                            value={stockSearch}
                            onChange={(e) => setStockSearch(e.target.value)}
                            placeholder={t('searchProducts')}
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        {filteredStock.map(item => {
                          const isLow = item.stock <= item.minStock;
                          return (
                            <div key={item.id} className="bg-white p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t(item.category)}</span>
                                <span className="text-sm font-bold text-slate-800 mt-1">{t(item.name)}</span>
                                <div className="flex items-center gap-2.5 mt-1.5">
                                  <span className="text-xs font-semibold text-slate-500">
                                    {item.isLoose ? `₹${item.price}/Kg` : `₹${item.price} ${t('each')}`}
                                  </span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    isLow ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-slate-50 text-slate-500'
                                  }`}>
                                    {isLow ? t('lowStock') : t('goodStock')}
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-2">
                                <div className="text-right">
                                  <span className={`text-sm font-extrabold ${isLow ? 'text-amber-500' : 'text-slate-800'}`}>
                                    {item.stock}{item.isLoose ? ' Kg' : ''}
                                  </span>
                                  <span className="text-[10px] text-slate-400 block mt-0.5">
                                    {item.isLoose ? t('weight') : t('qty')}
                                  </span>
                                </div>
                                <button 
                                  onClick={() => handleQuickAddStock(item.id, item.name)}
                                  className="min-h-[44px] min-w-[44px] bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center cursor-pointer"
                                >
                                  <Plus className="w-4 h-4 text-slate-500" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* REPORTS TAB */}
                  {activeTab === 'reports' && (
                    <div className="space-y-5 pb-6">
                      <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-slate-100 shadow-xs">
                        <h2 className="text-sm font-bold text-slate-800 pl-2">Performance</h2>
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                          <button 
                            onClick={() => setReportsFilter('day')}
                            className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                              reportsFilter === 'day' ? 'text-blue-600 bg-white shadow-xs' : 'text-slate-500'
                            }`}
                          >
                            Today
                          </button>
                          <button 
                            onClick={() => setReportsFilter('week')}
                            className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                              reportsFilter === 'week' ? 'text-blue-600 bg-white shadow-xs' : 'text-slate-500'
                            }`}
                          >
                            This Week
                          </button>
                          <button 
                            onClick={() => setReportsFilter('month')}
                            className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                              reportsFilter === 'month' ? 'text-blue-600 bg-white shadow-xs' : 'text-slate-500'
                            }`}
                          >
                            This Month
                          </button>
                        </div>
                      </div>

                      {/* Charts Visual System */}
                      <section className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {reportsFilter === 'day' ? 'Hourly Sales Curve' : reportsFilter === 'week' ? 'Comparative Margin' : 'Monthly Expansion'}
                            </span>
                            <span className="text-lg font-extrabold text-slate-900 mt-0.5">
                              {reportsFilter === 'day' ? `₹${metrics.sales.toLocaleString('en-IN')}` : reportsFilter === 'week' ? `₹${weekTotal.toLocaleString('en-IN')} Total` : `₹${monthTotal.toLocaleString('en-IN')} Total`}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-blue-600" />
                            {reportsFilter === 'day' ? 'Live (Today)' : reportsFilter === 'week' ? 'Mon - Sun' : 'Last 30 Days'}
                          </span>
                        </div>

                        <div className="h-[180px] w-full text-xs">
                          <ResponsiveContainer width="100%" height="100%">
                            {reportsFilter === 'day' && (
                              <AreaChart data={hourlyData} margin={{ top: 10, right: 0, left: -22, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="colorSales text-slate-800" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 9 }} />
                                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 9 }} />
                                <Tooltip formatter={(value) => [`₹${value}`, 'Sales']} />
                                <Area type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
                              </AreaChart>
                            )}

                            {reportsFilter === 'week' && (
                              <BarChart data={weeklyData} margin={{ top: 10, right: 0, left: -22, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 9 }} />
                                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 9 }} tickFormatter={(v) => `₹${v/1000}k`} />
                                <Tooltip formatter={(value) => [`₹${value}`]} />
                                <Bar dataKey="sales" name="Sales" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={10} />
                                <Bar dataKey="profit" name="Profit" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={10} />
                              </BarChart>
                            )}

                            {reportsFilter === 'month' && (
                              <LineChart data={monthlyData} margin={{ top: 10, right: 0, left: -22, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 9 }} />
                                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 9 }} tickFormatter={(v) => `₹${v/1000}k`} />
                                <Tooltip formatter={(value) => [`₹${value}`]} />
                                <Line type="monotone" dataKey="sales" name="Gross Sales" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4 }} />
                                <Line type="monotone" dataKey="profit" name="Net profit" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
                              </LineChart>
                            )}
                          </ResponsiveContainer>
                        </div>
                      </section>

                      {/* Donut breakdown */}
                      <section className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                          <PieIcon className="w-4 h-4 text-purple-600" /> Category Breakdown
                        </h3>
                        
                        <div className="flex items-center justify-between">
                          <div className="w-[120px] h-[120px] shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={categoryData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={28}
                                  outerRadius={45}
                                  paddingAngle={4}
                                  dataKey="value"
                                >
                                  {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                              </PieChart>
                            </ResponsiveContainer>
                          </div>

                          <div className="flex-1 pl-4 space-y-2">
                            {categoryData.map((item) => {
                              const totalVal = categoryData.reduce((sum, i) => sum + i.value, 0);
                              const percent = Math.round((item.value / totalVal) * 100);
                              const isSelected = selectedReportCategory === item.name;
                              return (
                                <button 
                                  key={item.name} 
                                  onClick={() => handleCategoryClick(item.name)}
                                  className={`w-full flex flex-col text-left p-1.5 rounded-xl transition-all cursor-pointer ${
                                    isSelected 
                                      ? 'bg-blue-50/70 border border-blue-100 ring-2 ring-blue-100/50' 
                                      : 'hover:bg-slate-50 border border-transparent'
                                  }`}
                                >
                                  <div className="flex items-center justify-between text-xs w-full">
                                    <span className={`font-bold text-[11px] truncate max-w-[85px] ${isSelected ? 'text-blue-700 font-extrabold' : 'text-slate-700'}`}>{t(item.name)}</span>
                                    <span className={`font-extrabold ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>{percent}%</span>
                                  </div>
                                  <div className="w-full bg-slate-100 h-1 mt-1 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: item.color }} />
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </section>

                      {/* Drill-down Category Product Sales Detail Card */}
                      {selectedReportCategory && (
                        <div className="bg-white p-4 rounded-2xl border-2 border-blue-100 shadow-md animate-slide-up space-y-3.5">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                                {t('topSold', { category: t(selectedReportCategory) })}
                              </h4>
                            </div>
                            <button 
                              onClick={() => setSelectedReportCategory(null)}
                              className="w-6 h-6 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                              aria-label="Clear Category selection"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="space-y-2 divide-y divide-slate-100">
                            {(() => {
                              const categoryProducts = getDrillDownProducts().filter(p => getCategoryForProduct(p.name) === selectedReportCategory);
                              if (categoryProducts.length === 0) {
                                return (
                                  <p className="text-[11px] text-slate-400 font-semibold py-2 text-center">
                                    {t('noSalesToday')}
                                  </p>
                                );
                              }
                              return categoryProducts.map((p, idx) => (
                                <div key={p.id} className="pt-2 first:pt-0 border-0 flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2">
                                    <span className="w-4.5 h-4.5 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-500">
                                      {idx + 1}
                                    </span>
                                    <span className="font-bold text-slate-800">{t(p.name)}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] text-slate-400 font-semibold">{p.units} sold</span>
                                    <span className="font-extrabold text-blue-600 w-12 text-right">₹{p.revenue}</span>
                                  </div>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      )}

                      {/* Average Stats Cards */}
                      <section className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                            {reportsFilter === 'day' ? 'Today’s Averages' : reportsFilter === 'week' ? 'Weekly Averages (per day)' : 'Monthly Averages (per day)'}
                          </span>
                          <div className="flex-1 h-px bg-slate-100" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {/* Avg Sale */}
                          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-blue-400" />
                            <div className="p-3.5 flex flex-col gap-1">
                              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-none">Avg Sale</span>
                              <span className="text-lg font-black text-slate-800 leading-tight mt-1">{reportsKpis.avgSale}</span>
                              <span className="text-[9px] font-bold text-blue-500">
                                {reportsFilter === 'day' ? 'Today’s total' : reportsFilter === 'week' ? 'Per day this week' : 'Per day this month'}
                              </span>
                            </div>
                          </div>

                          {/* Avg Profit */}
                          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-green-400" />
                            <div className="p-3.5 flex flex-col gap-1">
                              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-none">Avg Profit</span>
                              <span className="text-lg font-black text-slate-800 leading-tight mt-1">{reportsKpis.avgProfit}</span>
                              <span className="text-[9px] font-bold text-emerald-500">
                                {reportsFilter === 'day' ? 'Today’s net profit' : reportsFilter === 'week' ? 'Per day this week' : 'Per day this month'}
                              </span>
                            </div>
                          </div>

                          {/* Avg Customers */}
                          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="h-1 w-full bg-gradient-to-r from-violet-500 to-purple-400" />
                            <div className="p-3.5 flex flex-col gap-1">
                              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-none">Avg Customers</span>
                              <span className="text-lg font-black text-slate-800 leading-tight mt-1">{reportsKpis.avgCustomers}</span>
                              <span className="text-[9px] font-bold text-violet-500">
                                {reportsFilter === 'day' ? 'Visited today' : reportsFilter === 'week' ? 'Per day this week' : 'Per day this month'}
                              </span>
                            </div>
                          </div>

                          {/* Avg Products Per Sale */}
                          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="h-1 w-full bg-gradient-to-r from-amber-500 to-orange-400" />
                            <div className="p-3.5 flex flex-col gap-1">
                              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-none">Avg Basket Size</span>
                              <span className="text-lg font-black text-slate-800 leading-tight mt-1">{reportsKpis.avgProductsPerSale} items</span>
                              <span className="text-[9px] font-bold text-amber-500">Products per invoice</span>
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>
                  )}
                </main>

                {/* Floating Add Product Button Pinned statically in the phone container, on the top layer, visible ONLY when activeTab === 'stock' */}
                {activeTab === 'stock' && (
                  <button 
                    onClick={() => {
                      setNewStockName('');
                      setNewStockBuyingPrice('');
                      setNewStockSellingPrice('');
                      setNewStockQty('50');
                      setIsSoldLoose(false);
                      setShowAddProductModal(true);
                    }}
                    className="fixed bottom-24 right-6 md:absolute md:bottom-24 md:right-6 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-xl shadow-blue-500/25 hover:shadow-blue-500/35 active:scale-90 hover:scale-105 transition-all duration-200 z-35 border-4 border-white cursor-pointer animate-none"
                    aria-label="Add Product to Stock"
                  >
                    <Plus className="w-7 h-7 stroke-[3]" />
                  </button>
                )}

                {/* Floating Billing History Button Pinned statically in the phone container, on the top layer, visible ONLY when activeTab === 'reports' */}
                {activeTab === 'reports' && (
                  <button 
                    onClick={() => {
                      setHistorySearch('');
                      setHistoryDateFilter('');
                      setShowBillingHistoryModal(true);
                    }}
                    className="fixed bottom-24 right-6 md:absolute md:bottom-24 md:right-6 w-14 h-14 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center shadow-xl shadow-purple-500/25 hover:shadow-purple-500/35 active:scale-90 hover:scale-105 transition-all duration-200 z-35 border-4 border-white cursor-pointer animate-none"
                    aria-label="Open Invoice Archives"
                  >
                    <Clock className="w-6 h-6 stroke-[2.2]" />
                  </button>
                )}

                {/* Bottom Navigation Bar */}
                <nav className="fixed bottom-0 left-0 right-0 md:absolute md:bottom-0 bg-white border-t border-slate-100 px-3 py-2 flex items-center justify-around z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
                  <button onClick={() => setActiveTab('home')} className={`min-h-[44px] flex flex-col items-center justify-center w-16 transition-all ${activeTab === 'home' ? 'text-blue-600' : 'text-slate-400'}`}>
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-[10px] font-bold mt-1">{t('home')}</span>
                  </button>
                  <button onClick={() => setActiveTab('billing')} className={`min-h-[44px] flex flex-col items-center justify-center w-16 transition-all ${activeTab === 'billing' ? 'text-blue-600' : 'text-slate-400'}`}>
                    <FileText className="w-5 h-5" />
                    <span className="text-[10px] font-bold mt-1">{t('billing')}</span>
                  </button>
                  <button onClick={() => setActiveTab('stock')} className={`min-h-[44px] flex flex-col items-center justify-center w-16 transition-all ${activeTab === 'stock' ? 'text-blue-600' : 'text-slate-400'}`}>
                    <Package className="w-5 h-5" />
                    <span className="text-[10px] font-bold mt-1">{t('stock')}</span>
                  </button>
                  <button onClick={() => setActiveTab('reports')} className={`min-h-[44px] flex flex-col items-center justify-center w-16 transition-all ${activeTab === 'reports' ? 'text-blue-600' : 'text-slate-400'}`}>
                    <ShoppingBag className="w-5 h-5" />
                    <span className="text-[10px] font-bold mt-1">{t('reports')}</span>
                  </button>
                </nav>
              </>
            )
          )}
          {/* Add Product Modal Overlay */}
          {showAddProductModal && (
            <div className="absolute inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-end justify-center font-sans">
              <div className="w-full bg-white rounded-t-[32px] shadow-2xl p-6 space-y-5 animate-slide-up max-h-[90%] overflow-y-auto shrink-0 border-t border-slate-100 select-none no-scrollbar font-sans text-slate-800">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-black text-slate-800">{t('addNewInventoryItem')}</h3>
                  <button 
                    onClick={() => setShowAddProductModal(false)}
                    className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form fields */}
                <form onSubmit={handleCreateProduct} className="space-y-4">
                  
                  {/* Product Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block pl-0.5">{t('productName')}</label>
                    <input 
                      type="text" 
                      required
                      value={newStockName}
                      onChange={(e) => setNewStockName(e.target.value)}
                      placeholder={t('productNamePlaceholder')}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm focus:outline-none focus:border-blue-500 text-slate-800 font-semibold placeholder-slate-400 shadow-inner"
                    />
                  </div>

                  {/* Category & Quantity */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block pl-0.5">{t('category')}</label>
                      <select 
                        value={newStockCategory}
                        onChange={(e) => setNewStockCategory(e.target.value)}
                        className="w-full px-3 py-3 rounded-xl bg-slate-50 border border-slate-100 text-xs focus:outline-none focus:border-blue-500 text-slate-700 font-bold cursor-pointer"
                      >
                        {activeSubcategories.map(sub => (
                          <option key={sub} value={sub}>{t(sub)}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block pl-0.5">
                        {isSoldLoose ? t('openingStockKg') : t('openingStockQty')}
                      </label>
                      <input 
                        type="number" 
                        required
                        min="1"
                        value={newStockQty}
                        onChange={(e) => setNewStockQty(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-sm focus:outline-none focus:border-blue-500 text-slate-800 font-extrabold"
                      />
                    </div>
                  </div>

                  {/* Sold Loose Toggle Selector */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50/40 border border-blue-100/50">
                    <div className="flex flex-col space-y-0.5">
                      <span className="text-xs font-extrabold text-blue-900">{t('soldLoose')}</span>
                      <span className="text-[10px] text-slate-500 font-medium">{t('soldLooseHelp')}</span>
                    </div>
                    
                    <button 
                      type="button"
                      onClick={() => setIsSoldLoose(!isSoldLoose)}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-all cursor-pointer"
                      aria-label="Toggle sold loose weight based pricing"
                    >
                      {isSoldLoose ? (
                        <ToggleRight className="w-8 h-8 text-blue-600" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-slate-400" />
                      )}
                    </button>
                  </div>

                  {/* Buying & Selling Price fields */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block pl-0.5">
                        {isSoldLoose ? t('buyingPriceKg') : t('buyingPriceUnit')}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                        <input 
                          type="number" 
                          required
                          min="1"
                          placeholder="e.g. 60"
                          value={newStockBuyingPrice}
                          onChange={(e) => setNewStockBuyingPrice(e.target.value)}
                          className="w-full pl-7 pr-3 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm focus:outline-none focus:border-blue-500 text-slate-800 font-extrabold"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block pl-0.5">
                        {isSoldLoose ? t('sellingPriceKg') : t('sellingPriceUnit')}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                        <input 
                          type="number" 
                          required
                          min="1"
                          placeholder="e.g. 80"
                          value={newStockSellingPrice}
                          onChange={(e) => setNewStockSellingPrice(e.target.value)}
                          className="w-full pl-7 pr-3 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm focus:outline-none focus:border-blue-500 text-slate-800 font-extrabold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit"
                    className="w-full min-h-[48px] py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/10 active:scale-98 transition-all cursor-pointer"
                  >
                    <Check className="w-5 h-5 stroke-[2.5]" />
                    {t('addProductToInventory')}
                  </button>

                </form>

              </div>
            </div>
          )}

          {/* Refill Stock Modal Overlay */}
          {showRefillModal && refillItem && (
            <div className="absolute inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-end justify-center font-sans">
              <div className="w-full bg-white rounded-t-[32px] shadow-2xl p-6 space-y-5 animate-slide-up max-h-[90%] overflow-y-auto shrink-0 border-t border-slate-100 select-none no-scrollbar font-sans text-slate-800">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest leading-none">{t('refillStock')}</span>
                    <h3 className="text-base font-black text-slate-800 mt-1.5 leading-none">{t(refillItem.name)}</h3>
                  </div>
                  <button 
                    onClick={() => {
                      setShowRefillModal(false);
                      setRefillItem(null);
                    }}
                    className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleConfirmRefill} className="space-y-4">
                  {/* Current Stock Indicator */}
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">{t('currentInventoryLevel')}</span>
                      <p className="text-sm font-bold text-slate-700">
                        {t('inStockLabel', { qty: refillItem.stock, unit: refillItem.isLoose ? 'Kg' : t('units') })}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      refillItem.stock <= refillItem.minStock 
                        ? 'bg-amber-50 text-amber-600 border border-amber-100' 
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                      {refillItem.stock <= refillItem.minStock ? t('lowStock') : t('goodStock')}
                    </span>
                  </div>

                  {/* Refill Quantity Field */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block pl-0.5">
                      {t('qtyToAddLabel', { unit: refillItem.isLoose ? 'Kg' : t('units') })}
                    </label>
                    <div className="relative">
                      <input 
                        type="number" 
                        required
                        min="1"
                        placeholder="e.g. 10"
                        value={refillQty}
                        onChange={(e) => setRefillQty(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm focus:outline-none focus:border-blue-500 text-slate-800 font-extrabold shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Quick Increment Presets */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block pl-0.5">{t('quickPresets')}</span>
                    <div className="flex gap-2">
                      {['5', '10', '20', '50', '100'].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setRefillQty(val)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                            refillQty === val 
                              ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/25' 
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          +{val}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Confirm Button */}
                  <button 
                    type="submit"
                    className="w-full min-h-[48px] py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/10 active:scale-98 transition-all cursor-pointer mt-2"
                  >
                    <Check className="w-5 h-5 stroke-[2.5]" />
                    {t('confirmRefill')}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Billing History Archive Overlay Modal */}
          {showBillingHistoryModal && (
            <div className="absolute inset-0 z-45 bg-slate-50 flex flex-col font-sans text-slate-800 animate-slide-up">
              
              {/* Sticky Top Bar Header */}
              <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between sticky top-0 shadow-[0_1px_3px_rgba(0,0,0,0.02)] shrink-0 z-30">
                <button 
                  onClick={() => setShowBillingHistoryModal(false)}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-500 font-extrabold text-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4 text-slate-600" /> Close
                </button>
                <div className="flex flex-col items-center text-center">
                  <span className="text-[10px] font-extrabold text-purple-600 uppercase tracking-widest leading-none">Archive Ledger</span>
                  <h2 className="text-sm font-black text-slate-800 tracking-tight mt-1 leading-none">History</h2>
                </div>
                <span className="text-[10px] font-black bg-purple-50 text-purple-600 border border-purple-100/50 px-2.5 py-1.5 rounded-lg shrink-0 select-none uppercase tracking-widest">
                  {reportsFilter === 'day' ? 'Today' : reportsFilter === 'week' ? 'Weekly' : 'Monthly'}
                </span>
              </div>

              {/* Bills / Expenses Tab Switcher */}
              <div className="bg-white border-b border-slate-100 px-4 py-2 shrink-0">
                <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1">
                  <button
                    onClick={() => { setHistoryTab('bills'); setHistorySearch(''); }}
                    className={`flex-1 py-2 rounded-lg text-[11px] font-extrabold transition-all ${
                      historyTab === 'bills' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    💳 Bills
                  </button>
                  <button
                    onClick={() => { setHistoryTab('expenses'); setHistorySearch(''); }}
                    className={`flex-1 py-2 rounded-lg text-[11px] font-extrabold transition-all ${
                      historyTab === 'expenses' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    🧾 Expenses
                  </button>
                </div>
              </div>

              {/* Search + Date Filter Area */}
              <div className="bg-white px-4 pt-3 pb-3 border-b border-slate-100 shrink-0 space-y-2.5">
                {/* Text Search Row */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={historyDateFilter ? '' : historySearch}
                      onChange={(e) => { setHistorySearch(e.target.value); setHistoryDateFilter(''); }}
                      disabled={!!historyDateFilter}
                      placeholder={
                        historyDateFilter 
                          ? 'Date filter active — clear to search' 
                          : historyTab === 'bills' 
                            ? 'Search invoices (invoice #, items, payment...)' 
                            : 'Search expenses (description, category, payment...)'
                      }
                      className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs focus:outline-none text-slate-800 placeholder-slate-400 font-semibold shadow-inner transition-all ${
                        historyDateFilter
                          ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                          : 'bg-slate-50 border-slate-100 focus:border-blue-500'
                      }`}
                    />
                  </div>

                  {/* Calendar Date-Picker Button */}
                  <div className="relative shrink-0">
                    <input
                      type="date"
                      id="history-date-picker"
                      value={historyDateFilter}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) => {
                        setHistoryDateFilter(e.target.value);
                        setHistorySearch('');
                      }}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      aria-label="Filter by date"
                    />
                    <div className={`min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl border transition-all cursor-pointer ${
                      historyDateFilter
                        ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-600'
                    }`}>
                      <Calendar className="w-4.5 h-4.5" />
                    </div>
                  </div>
                </div>

                {/* Active Date Filter Chip */}
                {historyDateFilter && (
                  <div className="flex items-center justify-between bg-purple-50 border border-purple-100 rounded-xl px-3 py-2 animate-slide-up">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span className="text-[11px] font-extrabold text-purple-700">
                        {new Date(historyDateFilter + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <button
                      onClick={() => setHistoryDateFilter('')}
                      className="min-h-[28px] min-w-[28px] flex items-center justify-center rounded-lg bg-white border border-purple-100 text-purple-400 hover:text-rose-500 hover:border-rose-100 transition-colors cursor-pointer"
                      aria-label="Clear date filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Main Scrollable History List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                {(() => {
                  if (historyTab === 'bills') {
                    const filteredHistory = getBillingHistory();
                    const dayTotal = filteredHistory.reduce((s, b) => s + (b.total || 0), 0);
                    const dayItemsCount = filteredHistory.reduce((s, b) => s + (b.items || 0), 0);

                    if (filteredHistory.length === 0) {
                      return (
                        <div className="h-40 flex flex-col items-center justify-center text-slate-400 space-y-2">
                          <Calendar className="w-10 h-10 text-slate-300 bg-slate-100 p-2.5 rounded-full" />
                          <p className="text-sm font-medium">
                            {historyDateFilter ? 'No bills found for this date.' : 'No matching invoices found.'}
                          </p>
                          {historyDateFilter && (
                            <button
                              onClick={() => setHistoryDateFilter('')}
                              className="text-xs font-bold text-purple-600 underline cursor-pointer"
                            >Clear date filter</button>
                          )}
                        </div>
                      );
                    }
                    return (
                      <>
                        {/* Day Summary Banner (shown when date filter is active or when there are results) */}
                        {(historyDateFilter || filteredHistory.length > 0) && (
                          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-4 flex items-center justify-between text-white shadow-md shadow-purple-500/20 shrink-0">
                            <div className="flex flex-col">
                              <span className="text-[9px] font-extrabold uppercase tracking-widest opacity-70">
                                {historyDateFilter ? 'Day Total' : 'Period Total'}
                              </span>
                              <span className="text-xl font-black mt-0.5">₹{dayTotal.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-[9px] font-extrabold uppercase tracking-widest opacity-70">Invoices</span>
                              <span className="text-xl font-black mt-0.5">{filteredHistory.length}</span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-[9px] font-extrabold uppercase tracking-widest opacity-70">Items Sold</span>
                              <span className="text-xl font-black mt-0.5">{dayItemsCount}</span>
                            </div>
                          </div>
                        )}
                        {filteredHistory.map(bill => (
                          <div 
                            key={bill.id} 
                            className="bg-white px-4 py-3 rounded-2xl border border-slate-100 flex items-center justify-between hover:border-slate-200 transition-all select-none"
                          >
                            <span className="text-sm font-extrabold text-slate-800">#{bill.id}</span>
                            <span className="font-black text-blue-700 bg-blue-50 border border-blue-100/50 px-3 py-1.5 rounded-xl text-sm shrink-0">
                              ₹{(bill.total || bill.amount || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </>
                    );
                  } else {
                    const filteredExpenses = getFilteredExpenses();
                    const totalExpenseAmt = filteredExpenses.reduce((s, ex) => s + (ex.amount || 0), 0);

                    if (filteredExpenses.length === 0) {
                      return (
                        <div className="h-40 flex flex-col items-center justify-center text-slate-400 space-y-2">
                          <Calendar className="w-10 h-10 text-slate-300 bg-slate-100 p-2.5 rounded-full" />
                          <p className="text-sm font-medium">
                            {historyDateFilter ? 'No expenses found for this date.' : 'No matching expenses found.'}
                          </p>
                          {historyDateFilter && (
                            <button
                              onClick={() => setHistoryDateFilter('')}
                              className="text-xs font-bold text-amber-600 underline cursor-pointer"
                            >Clear date filter</button>
                          )}
                        </div>
                      );
                    }
                    return (
                      <>
                        {/* Day Summary Banner (shown when date filter is active or when there are results) */}
                        {(historyDateFilter || filteredExpenses.length > 0) && (
                          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-4 flex items-center justify-between text-white shadow-md shadow-amber-500/20 shrink-0">
                            <div className="flex flex-col">
                              <span className="text-[9px] font-extrabold uppercase tracking-widest opacity-70">
                                {historyDateFilter ? 'Day Total' : 'Period Total'}
                              </span>
                              <span className="text-xl font-black mt-0.5">₹{totalExpenseAmt.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-[9px] font-extrabold uppercase tracking-widest opacity-70">Expenses</span>
                              <span className="text-xl font-black mt-0.5">{filteredExpenses.length}</span>
                            </div>
                          </div>
                        )}
                        {filteredExpenses.map(ex => (
                          <div 
                            key={ex.id} 
                            className="bg-white px-4 py-3 rounded-2xl border border-slate-100 flex items-center justify-between hover:border-slate-200 transition-all select-none"
                          >
                            <div className="flex flex-col">
                              <span className="text-sm font-extrabold text-slate-800">{ex.description}</span>
                              <span className="text-[10px] text-slate-400 font-semibold">{t(ex.category)} · {ex.time} · {t(ex.paymentMethod)}</span>
                            </div>
                            <span className="font-black text-amber-700 bg-amber-50 border border-amber-100/50 px-3 py-1.5 rounded-xl text-sm shrink-0">
                              ₹{(ex.amount || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </>
                    );
                  }
                })()}
              </div>

              {/* Add Expense Button (FAB) inside History modal when on Expenses tab */}
              {historyTab === 'expenses' && (
                <button 
                  onClick={() => {
                    setExpenseDesc('');
                    setExpenseAmount('');
                    setExpenseCategory('Utilities');
                    setExpensePayMethod('cash');
                    setShowAddExpenseModal(true);
                  }}
                  className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center shadow-xl shadow-amber-500/25 hover:shadow-amber-500/35 active:scale-90 hover:scale-105 transition-all duration-200 z-50 border-4 border-white cursor-pointer"
                  aria-label="Add Expense"
                >
                  <Plus className="w-7 h-7 stroke-[3]" />
                </button>
              )}

            </div>
          )}

          {/* Add Expense Modal Overlay */}
          {showAddExpenseModal && (
            <div className="absolute inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-end justify-center font-sans">
              <div className="w-full bg-white rounded-t-[32px] shadow-2xl p-6 space-y-5 animate-slide-up max-h-[90%] overflow-y-auto shrink-0 border-t border-slate-100 select-none no-scrollbar font-sans text-slate-800">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-black text-slate-800">Record New Expense</h3>
                  <button 
                    onClick={() => setShowAddExpenseModal(false)}
                    className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form fields */}
                <form onSubmit={handleAddExpense} className="space-y-4">
                  
                  {/* Expense Description */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block pl-0.5">Description / Note</label>
                    <input 
                      type="text" 
                      required
                      value={expenseDesc}
                      onChange={(e) => setExpenseDesc(e.target.value)}
                      placeholder="e.g. Shop Rent, Electricity, Tea & Snacks..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm focus:outline-none focus:border-amber-500 text-slate-800 font-semibold placeholder-slate-400 shadow-inner"
                    />
                  </div>

                  {/* Category & Amount */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block pl-0.5">Category</label>
                      <select 
                        value={expenseCategory}
                        onChange={(e) => setExpenseCategory(e.target.value)}
                        className="w-full px-3 py-3 rounded-xl bg-slate-50 border border-slate-100 text-xs focus:outline-none focus:border-amber-500 text-slate-700 font-bold cursor-pointer"
                      >
                        <option value="Utilities">Utilities</option>
                        <option value="Supplies">Supplies</option>
                        <option value="Payroll">Payroll</option>
                        <option value="Rent">Rent</option>
                        <option value="Logistics">Logistics</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block pl-0.5">Amount (₹)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                        <input 
                          type="number" 
                          required
                          min="1"
                          placeholder="e.g. 500"
                          value={expenseAmount}
                          onChange={(e) => setExpenseAmount(e.target.value)}
                          className="w-full pl-7 pr-3 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm focus:outline-none focus:border-amber-500 text-slate-800 font-extrabold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block pl-0.5">Payment Method</label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {/* Cash Button */}
                      <button 
                        type="button"
                        onClick={() => setExpensePayMethod('cash')}
                        className={`py-3 px-2 rounded-2xl border flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer ${
                          expensePayMethod === 'cash' 
                            ? 'border-amber-500 bg-amber-50 text-amber-600' 
                            : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100/50'
                        }`}
                      >
                        <IndianRupee className="w-4 h-4 stroke-[2.5]" />
                        <span className="text-[10px] font-black tracking-tight uppercase">Cash</span>
                      </button>

                      {/* UPI Button */}
                      <button 
                        type="button"
                        onClick={() => setExpensePayMethod('upi')}
                        className={`py-3 px-2 rounded-2xl border flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer ${
                          expensePayMethod === 'upi' 
                            ? 'border-amber-500 bg-amber-50 text-amber-600' 
                            : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100/50'
                        }`}
                      >
                        <Smartphone className="w-4 h-4 stroke-[2.2]" />
                        <span className="text-[10px] font-black tracking-tight uppercase">UPI</span>
                      </button>

                      {/* Card Button */}
                      <button 
                        type="button"
                        onClick={() => setExpensePayMethod('card')}
                        className={`py-3 px-2 rounded-2xl border flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer ${
                          expensePayMethod === 'card' 
                            ? 'border-amber-500 bg-amber-50 text-amber-600' 
                            : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100/50'
                        }`}
                      >
                        <CreditCard className="w-4 h-4 stroke-[2.2]" />
                        <span className="text-[10px] font-black tracking-tight uppercase">Card</span>
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit"
                    className="w-full min-h-[48px] py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/10 active:scale-98 transition-all cursor-pointer"
                  >
                    <Check className="w-5 h-5 stroke-[2.5]" />
                    Save Expense
                  </button>

                </form>

              </div>
            </div>
          )}
        </>
      )}
      {isPricingRoute && (
        <div className="flex-1 flex flex-col h-full overflow-y-auto no-scrollbar px-5 py-6 bg-slate-50 text-slate-800 font-sans">
          <div className="w-full space-y-6">
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-extrabold text-blue-600 tracking-tight">ApnaKhata Plans</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Premium store workspace access</p>
            </div>

            {currentMerchant && (
              <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl flex items-center justify-between gap-2.5">
                <div>
                  <span className="text-[9px] uppercase font-bold text-blue-500 tracking-wider">Active Workspace</span>
                  <h4 className="text-xs font-black text-slate-800 mt-0.5">{currentMerchant.shopName}</h4>
                  <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Deadline: {currentMerchant.renewalDate}</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Days Left</span>
                  <h4 className="text-xs font-black text-slate-800 mt-0.5">
                    {(() => {
                      const days = getDaysRemaining(currentMerchant.renewalDate);
                      return days > 0 ? `${days} Day${days > 1 ? 's' : ''}` : '0 Days';
                    })()}
                  </h4>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-5">
              {/* Plan 1 */}
              <div className="bg-white border border-slate-100 shadow-lg rounded-3xl p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">1 Month Premium</h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">Standard subscription plan</p>
                  </div>
                  <div className="pt-2">
                    <span className="text-3xl font-black text-blue-600">₹249</span>
                    <span className="text-xs text-slate-400 font-bold uppercase pl-1">/ month</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-500 font-semibold pt-4 border-t border-slate-50">
                    <li className="flex items-center gap-2">✔ Full Sales Ledger</li>
                    <li className="flex items-center gap-2">✔ Inventory Management</li>
                    <li className="flex items-center gap-2">✔ Expense Tracking</li>
                    <li className="flex items-center gap-2">✔ Low Stock Notifications</li>
                  </ul>
                </div>
                <button
                  onClick={() => handleRenewSubscription(1, 249)}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs active:scale-98 transition-all cursor-pointer shadow-md shadow-blue-500/10"
                >
                  {currentMerchant ? 'Extend Subscription' : 'Sign In to Purchase'}
                </button>
              </div>

              {/* Plan 2 */}
              <div className="bg-white border-2 border-blue-200 shadow-xl rounded-3xl p-6 flex flex-col justify-between space-y-6 relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest shadow-sm">Popular Plan</span>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">3 Months Saver</h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">Quarterly bundle license</p>
                  </div>
                  <div className="pt-2">
                    <span className="text-3xl font-black text-blue-600">₹699</span>
                    <span className="text-xs text-slate-400 font-bold uppercase pl-1">/ 3 mos</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-500 font-semibold pt-4 border-t border-slate-50">
                    <li className="flex items-center gap-2">✔ All Monthly Features</li>
                    <li className="flex items-center gap-2 text-emerald-600">✔ Save ₹48 overall</li>
                    <li className="flex items-center gap-2">✔ Advanced Analytics</li>
                    <li className="flex items-center gap-2">✔ Dedicated Support</li>
                  </ul>
                </div>
                <button
                  onClick={() => handleRenewSubscription(3, 699)}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs active:scale-98 transition-all cursor-pointer shadow-md shadow-blue-500/10"
                >
                  {currentMerchant ? 'Extend Subscription' : 'Sign In to Purchase'}
                </button>
              </div>

              {/* Plan 3 */}
              <div className="bg-white border border-slate-100 shadow-lg rounded-3xl p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">1 Year Value</h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">Annual license value pack</p>
                  </div>
                  <div className="pt-2">
                    <span className="text-3xl font-black text-blue-600">₹2499</span>
                    <span className="text-xs text-slate-400 font-bold uppercase pl-1">/ year</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-500 font-semibold pt-4 border-t border-slate-50">
                    <li className="flex items-center gap-2">✔ All Quarterly Features</li>
                    <li className="flex items-center gap-2 text-emerald-600">✔ Save ₹489 overall</li>
                    <li className="flex items-center gap-2">✔ Priority Provisioning</li>
                    <li className="flex items-center gap-2">✔ Offline Backup Support</li>
                  </ul>
                </div>
                <button
                  onClick={() => handleRenewSubscription(12, 2499)}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs active:scale-98 transition-all cursor-pointer shadow-md shadow-blue-500/10"
                >
                  {currentMerchant ? 'Extend Subscription' : 'Sign In to Purchase'}
                </button>
              </div>
            </div>

            <div className="text-center pt-4">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-1.5 px-6 py-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Login Modal */}
      {showPricingLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-5 border border-slate-100 animate-slide-up text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-800">Merchant Authentication</h3>
                {selectedPlanInfo && (
                  <p className="text-xs text-slate-400 mt-1">
                    Sign in to purchase <span className="font-bold text-blue-600">{selectedPlanInfo.months === 1 ? '1 Month' : selectedPlanInfo.months === 3 ? '3 Months' : '1 Year'} plan (₹{selectedPlanInfo.amount})</span>
                  </p>
                )}
              </div>
              <button 
                onClick={() => setShowPricingLoginModal(false)}
                className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handlePricingLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block pl-1">Store Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input 
                    type="text" 
                    required
                    value={pricingLoginUsername}
                    onChange={(e) => setPricingLoginUsername(e.target.value)}
                    placeholder="Store ID (e.g. rajan)"
                    className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm focus:outline-none focus:border-blue-500 text-slate-800 placeholder-slate-400 font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block pl-1">Security Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input 
                    type={pricingLoginShowPassword ? "text" : "password"} 
                    required
                    value={pricingLoginPassword}
                    onChange={(e) => setPricingLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm focus:outline-none focus:border-blue-500 text-slate-800 placeholder-slate-400 font-semibold"
                  />
                  <button 
                    type="button"
                    onClick={() => setPricingLoginShowPassword(!pricingLoginShowPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {pricingLoginShowPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowPricingLoginModal(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/10 active:scale-98 transition-all cursor-pointer"
                >
                  Verify & Pay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simulated Razorpay Payment Gateway Modal */}
      {showSimulatedGateway && simulatedPaymentDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans select-none">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90%] text-slate-800 animate-scale-up">
            
            <div className="bg-[#1e293b] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center font-black text-xs text-white">AK</div>
                <div>
                  <h3 className="text-sm font-black tracking-tight leading-none">ApnaKhata Payments</h3>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">Simulated Gateway</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wider block">TEST MODE</span>
              </div>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-5">
              
              {simulatedStatus === 'pending' && (
                <>
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Store Workspace</span>
                      <span className="text-xs font-bold text-slate-800">{simulatedPaymentDetails.shopName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Selected Plan</span>
                      <span className="text-xs font-bold text-slate-800">
                        {simulatedPaymentDetails.months === 1 ? '1 Month Premium' : simulatedPaymentDetails.months === 3 ? '3 Months Saver' : '1 Year Value'}
                      </span>
                    </div>
                    <div className="border-t border-slate-200/50 pt-2.5 flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Total Amount</span>
                      <span className="text-base font-black text-blue-600">₹{simulatedPaymentDetails.amount}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest pl-0.5 block">Select Simulation Result</span>
                    
                    <button 
                      onClick={handleConfirmSimulatedPayment}
                      disabled={isSimulatingPayment}
                      className="w-full p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/10 flex items-center justify-between transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100">
                          <Check className="w-4.5 h-4.5 stroke-[2.5]" />
                        </div>
                        <div className="text-left">
                          <span className="text-xs font-extrabold text-slate-800 block">Simulate Success</span>
                          <span className="text-[10px] text-slate-400 block font-medium">Instantly updates store plan to active</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" />
                    </button>

                    <button 
                      onClick={() => {
                        setIsSimulatingPayment(true);
                        setSimulatedStatus('processing');
                        setTimeout(() => {
                          setSimulatedStatus('failed');
                          setIsSimulatingPayment(false);
                          triggerToast('Simulated payment failed!', 'error');
                        }, 1500);
                      }}
                      disabled={isSimulatingPayment}
                      className="w-full p-4 rounded-xl border border-slate-200 hover:border-rose-500 hover:bg-rose-50/10 flex items-center justify-between transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 group-hover:bg-rose-100">
                          <X className="w-4.5 h-4.5 stroke-[2.5]" />
                        </div>
                        <div className="text-left">
                          <span className="text-xs font-extrabold text-slate-800 block">Simulate Failure</span>
                          <span className="text-[10px] text-slate-400 block font-medium">Simulates a transaction reject or timeout</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-500" />
                    </button>
                  </div>
                </>
              )}

              {simulatedStatus === 'processing' && (
                <div className="py-10 flex flex-col items-center justify-center text-center space-y-4 animate-pulse">
                  <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Processing Payment</h4>
                    <p className="text-[10px] text-slate-400 mt-1">Simulating bank authentication. Please wait...</p>
                  </div>
                </div>
              )}

              {simulatedStatus === 'success' && (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 animate-bounce">
                    <Check className="w-7 h-7 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800">Payment Successful!</h4>
                    <p className="text-[10px] text-emerald-600 font-bold mt-1">Activating store plan workspace...</p>
                  </div>
                </div>
              )}

              {simulatedStatus === 'failed' && (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                    <X className="w-7 h-7 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800">Transaction Failed</h4>
                    <p className="text-[10px] text-rose-600 font-bold mt-1">The simulated payment was cancelled or declined.</p>
                  </div>
                  <div className="flex gap-2.5 pt-2 w-full">
                    <button
                      onClick={() => {
                        setShowSimulatedGateway(false);
                        setSimulatedPaymentDetails(null);
                      }}
                      className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setSimulatedStatus('pending');
                      }}
                      className="flex-1 py-2 rounded-xl bg-blue-600 text-xs font-extrabold text-white hover:bg-blue-700 transition-all cursor-pointer"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}

            </div>

            {simulatedStatus === 'pending' && (
              <div className="bg-slate-50 p-4 border-t border-slate-100 text-center flex justify-between items-center text-[10px] text-slate-400 font-medium">
                <span>Securely powered by ApnaKhata</span>
                <button 
                  onClick={() => {
                    setShowSimulatedGateway(false);
                    setSimulatedPaymentDetails(null);
                  }}
                  className="font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Cancel Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
