import { useState, useEffect, useRef } from "react";
import {
  ShoppingCart, Users, Package, Truck,
  LogOut, Plus, Minus, Search, Trash2, Printer,
  ChevronRight, Cookie, Wheat, Check, AlertCircle, X,
  Moon, Sun, User, Eye, EyeOff, Share2, RefreshCw, Store,
  BarChart2, TrendingUp, Clock, Download, CloudUpload, CheckCircle, Circle
} from "lucide-react";
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Printer as CapacitorPrinter } from '@capgo/capacitor-printer';
import html2canvas from "html2canvas";

const PRODUCTS = {
  flour: [
    { id: "f1", name: "Wheat Flour", weight: "1 kg", price: 45 },
    { id: "f2", name: "Maida", weight: "500 gms", price: 28 },
    { id: "f3", name: "Gram Flour", weight: "250 gms", price: 32 },
    { id: "f4", name: "Gram Flour", weight: "100 gms", price: 15 },
    { id: "f5", name: "Ragi Flour", weight: "500 gms", price: 38 },
    { id: "f6", name: "Rice Flour", weight: "1 kg", price: 52 },
  ],
  rava: [
    { id: "r1", name: "Bombay Sooji", weight: "500 gms", price: 30 },
    { id: "r2", name: "Upma Rava", weight: "500 gms", price: 28 },
    { id: "r3", name: "Special Rava", weight: "500 gms", price: 35 },
    { id: "r4", name: "Wheat Cuts", weight: "500 gms", price: 26 },
  ],
  packing: [
    { id: "p1", name: "Carry Bag 10x14", weight: "pack", price: 12 },
    { id: "p2", name: "Carry Bag 13x16", weight: "pack", price: 16 },
    { id: "p3", name: "Carry Bag 16x20", weight: "pack", price: 22 },
    { id: "p4", name: "Packing Cover 250gms", weight: "pack", price: 8 },
    { id: "p5", name: "Packing Cover 500gms", weight: "pack", price: 10 },
    { id: "p6", name: "Packing Cover 1kg", weight: "pack", price: 14 },
    { id: "p7", name: "Packing Cover 2kg", weight: "pack", price: 18 },
    { id: "p8", name: "Packing Cover 5kg", weight: "pack", price: 28 },
    { id: "p9", name: "Packing Cover 10kg", weight: "pack", price: 45 },
  ],
};

const STORE_INFO = {
  name: "Karthik Flour Mill",
  tagline: "Premium Quality Flour & Rava",
  biller: "Satish",
  phone: "9980085528, 9164424898",
  address: "Gopalpura 1st Cross Kallanpura Santekatte-Udupi-576105",
  gstin: "29XXXXX1234Z1ZX",
};

const genId = () => Math.random().toString(36).slice(2, 9).toUpperCase();
const today = () => new Date().toLocaleDateString("en-IN");
const fmt = (n) => `Rs.${Number(n).toFixed(2)}`;

const store = {
  get: (k) => { try { return JSON.parse(localStorage.getItem(k)) || null; } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } },
};

function EmptyState({ icon, title, subtitle, action, onAction }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: '10px', textAlign: 'center' }}>
      <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'var(--surface-alt)', border: '1.5px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px' }}>{icon}</div>
      <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1rem', fontWeight: 700 }}>{title}</h3>
      <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '200px', lineHeight: 1.5 }}>{subtitle}</p>
      {action && <button className="btn btn-primary" style={{ marginTop: '8px' }} onClick={onAction}>{action}</button>}
    </div>
  );
}

function SwipeToDelete({ onDelete, children }) {
  const startX = useRef(null);
  const [offset, setOffset] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const onTouchStart = (e) => { startX.current = e.touches[0].clientX; };
  const onTouchMove = (e) => { if (startX.current === null) return; const diff = e.touches[0].clientX - startX.current; if (diff < 0) setOffset(Math.max(diff, -80)); };
  const onTouchEnd = () => { if (offset < -55) { setDeleting(true); setTimeout(() => onDelete(), 280); } else setOffset(0); startX.current = null; };
  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '80px', background: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Trash2 size={20} color="#fff" />
      </div>
      <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} style={{ transform: `translateX(${deleting ? -300 : offset}px)`, transition: (offset === 0 || deleting) ? 'transform 0.28s ease' : 'none', background: 'var(--surface)', position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}

// hooks and utilities
export default function App() {
  const [user, setUser] = useState(() => store.get("kc_user") || null);
  const [screen, setScreen] = useState(() => store.get("kc_user") ? "app" : "login");
  const [activeTab, setActiveTab] = useState("billing");
  const [products, setProducts] = useState(() => store.get("kc_products") || PRODUCTS);
  const [customers, setCustomers] = useState(() => store.get("kc_customers") || []);
  const [inventory, setInventory] = useState(() => store.get("kc_inventory") || initInventory(store.get("kc_products") || PRODUCTS));
  const [bills, setBills] = useState(() => store.get("kc_bills") || []);
  const [notification, setNotification] = useState(null);
  const [profileName, setProfileName] = useState(() => store.get("kc_profile_name") || "Satish");

  useEffect(() => { store.set("kc_customers", customers); }, [customers]);
  useEffect(() => { store.set("kc_products", products); }, [products]);
  useEffect(() => { store.set("kc_inventory", inventory); }, [inventory]);
  useEffect(() => { store.set("kc_bills", bills); }, [bills]);
  useEffect(() => { store.set("kc_profile_name", profileName); }, [profileName]);

  const notify = (msg, type = "success") => { setNotification({ msg, type }); setTimeout(() => setNotification(null), 3000); };

  function initInventory(prods = products) {
    const inv = {}; Object.values(prods).flat().forEach(p => { inv[p.id] = 50; }); return inv;
  }

  if (screen === "login") return <Login onLogin={(u) => { setUser(u); setProfileName(u); store.set("kc_user", u); setScreen("app"); notify(`Welcome back, ${u}!`); }} />;

  // ✅ 5 tabs — Store removed, merged into Profile
  const NAV_TABS = [
    { key: "billing",   icon: <ShoppingCart size={20} />, label: "Billing" },
    { key: "customers", icon: <Users size={20} />,        label: "Customers" },
    { key: "products",  icon: <Package size={20} />,      label: "Products" },
    { key: "inventory", icon: <Truck size={20} />,        label: "Van" },
    { key: "reports",   icon: <BarChart2 size={20} />,    label: "Reports" },
  ];

  return (
    <div className="app-container">
      <header className="topbar no-print">
        <div className="brand-section">
          <div className="brand-icon"><Wheat size={28} /></div>
          <div><div className="brand-name">{STORE_INFO.name}</div><div className="brand-sub">{STORE_INFO.tagline}</div></div>
        </div>
        <div className="user-section">
          <button onClick={() => setActiveTab("profile")} style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.25)', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'inherit', fontWeight: 800, fontSize: '1rem', flexShrink: 0 }}>
            {profileName.charAt(0).toUpperCase()}
          </button>
        </div>
      </header>

      <main className="main-content">
        {notification && (
          <div className={`toast animate-slide-down ${notification.type === "error" ? "error" : ""}`}>
            {notification.type === "error" ? <AlertCircle size={18} color="var(--danger)" /> : <Check size={18} color="var(--success)" />}
            <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{notification.msg}</span>
          </div>
        )}
        <div className="animate-fade-in">
          {activeTab === "billing"   && <BillingScreen customers={customers} inventory={inventory} setInventory={setInventory} bills={bills} setBills={setBills} notify={notify} billerName={profileName} products={products} />}
          {activeTab === "customers" && <CustomersScreen customers={customers} setCustomers={setCustomers} notify={notify} />}
          {activeTab === "products"  && <ProductsScreen products={products} setProducts={setProducts} notify={notify} />}
          {activeTab === "inventory" && <InventoryScreen inventory={inventory} setInventory={setInventory} notify={notify} products={products} />}
          {activeTab === "reports"   && <ReportsScreen bills={bills} setBills={setBills} notify={notify} />}
          {activeTab === "profile"   && <ProfileScreen profileName={profileName} setProfileName={setProfileName} setScreen={setScreen} setUser={setUser} notify={notify} />}
        </div>
      </main>

      {/* ✅ Bottom nav — 5 tabs, no FAB basket anywhere */}
      <nav className="no-print" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--surface)', borderTop: '1px solid var(--border-subtle)', display: 'flex', paddingBottom: 'env(safe-area-inset-bottom, 0px)', zIndex: 100, boxShadow: '0 -2px 12px rgba(0,0,0,0.08)' }}>
        {NAV_TABS.map(t => {
          const isActive = activeTab === t.key;
          return (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3px', padding: '10px 0 8px', border: 'none', background: 'transparent', cursor: 'pointer', position: 'relative', transition: 'all 0.2s' }}>
              {isActive && <span style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '28px', height: '3px', background: 'var(--primary)', borderRadius: '0 0 4px 4px' }} />}
              <span style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}>{t.icon}</span>
              <span style={{ fontSize: '0.65rem', fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--primary)' : 'var(--text-muted)', fontFamily: 'inherit' }}>{t.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function Login({ onLogin }) {
  const [u, setU] = useState(""); const [p, setP] = useState(""); const [err, setErr] = useState(""); const [show, setShow] = useState(false);
  const handle = () => {
    const un = u.trim().toLowerCase(), pw = p.trim();
    if (un === "satish" && pw === "9164424898") onLogin("Satish");
    else if (un === "ganesh" && pw === "9980085528") onLogin("Ganesh");
    else if (un === "karthik" && pw === "8073990493") onLogin("Karthik");
    else setErr("Invalid Username or Password!");
  };
  return (
    <div className="login-wrapper">
      <div className="login-card animate-pop-in">
        <div className="login-logo"><Wheat size={36} /></div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary-dark)', marginBottom: '6px' }}>{STORE_INFO.name}</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>{STORE_INFO.tagline}</p>
        <div className="input-group" style={{ textAlign: 'left' }}>
          <label className="label">Username</label>
          <input className="input" placeholder="e.g. satish" value={u} onChange={e => setU(e.target.value)} onKeyDown={e => e.key === "Enter" && handle()} />
        </div>
        <div className="input-group" style={{ textAlign: 'left', marginBottom: '8px' }}>
          <label className="label">Password</label>
          <div style={{ position: 'relative' }}>
            <input className="input" placeholder="••••••••" type={show ? "text" : "password"} inputMode="numeric" value={p} onChange={e => { if (/^\d*$/.test(e.target.value)) setP(e.target.value); }} onKeyDown={e => e.key === "Enter" && handle()} style={{ paddingRight: '40px' }} />
            <button style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setShow(!show)}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </div>
        </div>
        {err && <div style={{ color: 'var(--danger)', fontSize: '0.82rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={13} />{err}</div>}
        <button className="btn btn-primary" style={{ width: '100%', padding: '13px', fontSize: '1rem', marginTop: '10px' }} onClick={handle}>Sign In <ChevronRight size={17} /></button>
      </div>
    </div>
  );
}

function BillingScreen({ customers, inventory, setInventory, bills, setBills, notify, billerName, products }) {
  const [selCustomer, setSelCustomer] = useState(null);
  const [search, setSearch] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [showAreaFilter, setShowAreaFilter] = useState(false);
  const [cart, setCart] = useState({});
  const [viewBill, setViewBill] = useState(null);
  const [tab, setTab] = useState("flour");

  const areas = [...new Set(customers.map(c => c.area).filter(Boolean))].sort();
  const filtered = customers.filter(c => {
    const matchSearch = (c.shopName && c.shopName.toLowerCase().includes(search.toLowerCase())) || (c.name && c.name.toLowerCase().includes(search.toLowerCase())) || c.phone.includes(search);
    const matchArea = !areaFilter || (c.area && c.area.toLowerCase() === areaFilter.toLowerCase());
    return matchSearch && matchArea;
  });
  const handleInstantCustomer = () => { if (search.trim()) { setSelCustomer({ id: genId(), name: search.trim(), phone: "N/A", instant: true }); setSearch(""); } };
  const addToCart = (prod) => { const s = inventory[prod.id] ?? 0; if (s <= 0) { notify("Insufficient stock for " + prod.name, "error"); return; } setInventory(prev => ({ ...prev, [prod.id]: s - 1 })); setCart(prev => ({ ...prev, [prod.id]: { ...prod, qty: (prev[prod.id]?.qty || 0) + 1 } })); };
  const removeFromCart = (id) => { setInventory(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 })); setCart(prev => { const n = { ...prev }; if (n[id]?.qty > 1) n[id] = { ...n[id], qty: n[id].qty - 1 }; else delete n[id]; return n; }); };
  const clearCart = () => { setInventory(prev => { const n = { ...prev }; Object.values(cart).forEach(i => { n[i.id] = (n[i.id] ?? 0) + i.qty; }); return n; }); setCart({}); };

  const cartItems = Object.values(cart);
  const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = 0, total = subtotal + tax;

  const generateBill = () => {
    if (!selCustomer) { notify("Select a customer first!", "error"); return; }
    if (cartItems.length === 0) { notify("Cart is empty!", "error"); return; }
    const bill = { id: genId(), billNo: `KC-${Date.now().toString().slice(-6)}`, date: today(), customer: selCustomer, items: cartItems, subtotal, tax, total, biller: billerName, status: "paid" };
    setBills(prev => [bill, ...prev]); setViewBill(bill); setCart({}); setSelCustomer(null);
    notify("Bill generated successfully!");
  };

  const toggleStatus = (id) => setBills(prev => prev.map(b => b.id === id ? { ...b, status: b.status === "paid" ? "pending" : "paid" } : b));

  if (viewBill) {
    const liveBill = bills.find(b => b.id === viewBill.id) || viewBill;
    return <BillView bill={liveBill} onClose={() => setViewBill(null)} onToggleStatus={(id) => toggleStatus(id)} />;
  }

  const PTABS = [{ key: "flour", icon: <Wheat size={14} />, label: "Flour" }, { key: "rava", icon: <Cookie size={14} />, label: "Rava" }, { key: "packing", icon: <Package size={14} />, label: "Packing" }];

  const todayStr = today();
  const todayBills = bills.filter(b => b.date === todayStr);
  const todayRevenue = todayBills.reduce((s, b) => s + b.total, 0);
  const todayPending = todayBills.filter(b => b.status === "pending").reduce((s, b) => s + b.total, 0);

  return (
    <div>
      <div className="section-header" style={{ marginBottom: '12px' }}><h2 className="section-title">New Billing Session</h2></div>

      {/* Today's Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '14px' }}>
        {[
          { label: "Today's Bills", value: todayBills.length, color: 'var(--primary)', icon: <ShoppingCart size={13} /> },
          { label: "Revenue", value: `Rs.${todayRevenue.toFixed(0)}`, color: 'var(--success)', icon: <TrendingUp size={13} /> },
          { label: "Pending", value: `Rs.${todayPending.toFixed(0)}`, color: todayPending > 0 ? 'var(--danger)' : 'var(--text-muted)', icon: <Clock size={13} /> },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '10px 8px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: s.color, marginBottom: '4px' }}>{s.icon}<span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</span></div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title"><Users size={14} /> Customer Details</div>
        {/* Search + Filter button row */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '0' }}>
          <div className="search-wrapper" style={{ flex: 1, marginBottom: 0 }}>
            <Search className="search-icon" size={16} />
            <input className="input search-input" placeholder="Search by shop, name..." value={search} type="text" onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && handleInstantCustomer()} />
          </div>
          {areas.length > 0 && (
            <button onClick={() => setShowAreaFilter(f => !f)} style={{ flexShrink: 0, width: '40px', height: '40px', borderRadius: 'var(--radius-md)', border: `1.5px solid ${areaFilter ? 'var(--primary)' : 'var(--border-color)'}`, background: areaFilter ? 'var(--primary)' : 'var(--surface-alt)', color: areaFilter ? '#fff' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
            </button>
          )}
        </div>

        {/* Area filter chips */}
        {showAreaFilter && areas.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
            <button onClick={() => { setAreaFilter(""); setShowAreaFilter(false); }} style={{ padding: '4px 12px', borderRadius: '20px', border: `1.5px solid ${!areaFilter ? 'var(--primary)' : 'var(--border-color)'}`, background: !areaFilter ? 'var(--primary)' : 'transparent', color: !areaFilter ? '#fff' : 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>All</button>
            {areas.map(area => (
              <button key={area} onClick={() => { setAreaFilter(areaFilter === area ? "" : area); setShowAreaFilter(false); }} style={{ padding: '4px 12px', borderRadius: '20px', border: `1.5px solid ${areaFilter === area ? 'var(--primary)' : 'var(--border-color)'}`, background: areaFilter === area ? 'var(--primary)' : 'transparent', color: areaFilter === area ? '#fff' : 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                {area}
              </button>
            ))}
          </div>
        )}

        {/* Active filter badge */}
        {areaFilter && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Filtered by:</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', background: 'var(--primary)', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>
              {areaFilter}
              <button onClick={() => setAreaFilter("")} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0', lineHeight: 1, marginLeft: '2px' }}>×</button>
            </span>
          </div>
        )}
        {search && !selCustomer && (
          <div className="dropdown-menu" style={{ position: 'relative', marginTop: '4px' }}>
            {filtered.length === 0 ? (
              <div className="dropdown-item" onClick={handleInstantCustomer}><div style={{ fontWeight: 600, color: 'var(--primary)' }}>Instant Bill for "{search}"</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Click or press Enter</div></div>
            ) : filtered.map(c => (
              <div key={c.id} className="dropdown-item" onClick={() => { setSelCustomer(c); setSearch(""); }}>
                <div style={{ fontWeight: 600 }}>{c.shopName || c.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.name && c.shopName ? `${c.name} · ` : ""}{c.phone}{c.area ? ` · ${c.area}` : ""}</div>
              </div>
            ))}
          </div>
        )}
        {selCustomer && (
          <div className="selected-badge">
            <div>
              <div style={{ fontWeight: 600 }}>{selCustomer.shopName || selCustomer.name}</div>
              {!selCustomer.instant && <div style={{ fontSize: '0.78rem', opacity: 0.8 }}>{selCustomer.name && selCustomer.shopName ? `${selCustomer.name} · ` : ""}{selCustomer.phone}</div>}
            </div>
            <button className="btn-icon" onClick={() => setSelCustomer(null)}><X size={15} /></button>
          </div>
        )}
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '5px', marginBottom: '14px', background: 'var(--surface-alt)', padding: '5px', borderRadius: 'var(--radius-lg)' }}>
          {PTABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '8px 4px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', background: tab === t.key ? 'var(--surface)' : 'transparent', color: tab === t.key ? 'var(--primary-dark)' : 'var(--text-muted)', fontWeight: tab === t.key ? 700 : 500, fontSize: '0.85rem', fontFamily: 'inherit', transition: 'all 0.2s', boxShadow: tab === t.key ? 'var(--shadow-xs)' : 'none' }}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>
        <div className="product-grid">
          {products[tab].length === 0 ? <EmptyState icon={<Package size={28} color="var(--text-muted)" />} title="No products" subtitle="Add in Products tab" /> : products[tab].map(p => (
            <div key={p.id} className="product-card">
              <div className="p-name">{p.name}</div>
              <div className="p-weight">{p.weight}</div>
              <div className="p-price">{fmt(p.price)}</div>
              <div className="p-stock">Stock: {inventory[p.id] ?? 0}</div>
              {cart[p.id] ? (
                <div className="qty-control">
                  <button className="qty-btn" onClick={e => { e.stopPropagation(); removeFromCart(p.id); }}><Minus size={13} /></button>
                  <span className="qty-val">{cart[p.id].qty}</span>
                  <button className="qty-btn" onClick={e => { e.stopPropagation(); addToCart(p); }}><Plus size={13} /></button>
                </div>
              ) : (
                <div className="qty-control" style={{ background: 'transparent', border: 'none' }}>
                  <button className="btn btn-secondary" style={{ width: '100%', padding: '6px', fontSize: '0.82rem' }} onClick={e => { e.stopPropagation(); addToCart(p); }}>Add</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ✅ Current Order — full width, fixed layout */}
      <div className="section-header" style={{ marginBottom: '10px' }}><h2 className="section-title">Current Order</h2></div>
      <div className="card">
        {cartItems.length === 0 ? (
          <EmptyState icon={<ShoppingCart size={30} color="var(--text-hint)" />} title="Cart is empty" subtitle="Add items from the catalog above" />
        ) : (
          <>
            <div style={{ width: '100%' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <colgroup><col style={{ width: '52%' }} /><col style={{ width: '18%' }} /><col style={{ width: '30%' }} /></colgroup>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '9px 10px', background: 'var(--surface-alt)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-subtle)' }}>Item</th>
                    <th style={{ textAlign: 'center', padding: '9px 6px', background: 'var(--surface-alt)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-subtle)' }}>Qty</th>
                    <th style={{ textAlign: 'right', padding: '9px 10px', background: 'var(--surface-alt)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-subtle)' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map(i => (
                    <tr key={i.id}>
                      <td style={{ padding: '11px 10px', borderBottom: '1px solid var(--border-subtle)', verticalAlign: 'middle' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{i.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{i.weight} · {fmt(i.price)}/ea</div>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700, padding: '11px 6px', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-main)', verticalAlign: 'middle', fontSize: '0.95rem' }}>{i.qty}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, padding: '11px 10px', borderBottom: '1px solid var(--border-subtle)', color: 'var(--primary-dark)', verticalAlign: 'middle', fontSize: '0.9rem' }}>{fmt(i.price * i.qty)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '2px dashed var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px', color: 'var(--text-muted)', fontSize: '0.88rem' }}><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--text-muted)', fontSize: '0.88rem' }}><span>Tax</span><span>{fmt(tax)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1.5px solid var(--border-color)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary-dark)' }}><span>Total</span><span>{fmt(total)}</span></div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={clearCart}>Clear</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={generateBill}>Generate Invoice <ChevronRight size={15} /></button>
            </div>
          </>
        )}
      </div>

    </div>
  );
}

function BillView({ bill, onClose, onToggleStatus }) {
  const billRef = useRef(null);

  const cleanPhone = (phone) => {
    if (!phone || phone === 'N/A') return null;
    const first = phone.split(',')[0].trim();
    const digits = first.replace(/\D/g, '');
    if (digits.length === 10) return `91${digits}`;
    if (digits.length === 12 && digits.startsWith('91')) return digits;
    return digits;
  };

  const handleWhatsAppImage = async () => {
    if (!billRef.current) return;
    try {
      const canvas = await html2canvas(billRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      if (Capacitor.isNativePlatform()) {
        const base64Data = canvas.toDataURL('image/png').split(',')[1];
        const result = await Filesystem.writeFile({ path: `Invoice-${bill.billNo}.png`, data: base64Data, directory: Directory.Cache });
        await Share.share({ url: result.uri, dialogTitle: 'Share via WhatsApp' });
      } else {
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], `Invoice-${bill.billNo}.png`, { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try { await navigator.share({ files: [file] }); } catch (e) { console.error(e); }
          } else {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob); link.download = `Invoice-${bill.billNo}.png`; link.click();
            setTimeout(() => { const phone = cleanPhone(bill.customer.phone); window.open(phone ? `https://wa.me/${phone}` : `https://wa.me/`, '_blank'); }, 800);
          }
        }, 'image/png');
      }
    } catch (err) { console.error(err); }
  };

  const handlePrint = async () => {
    const storeInfo = store.get("kc_store_info") || STORE_INFO;
    const itemRows = bill.items.map(i =>
      `<tr><td>${i.name} (${i.weight})</td><td style="text-align:center">${i.qty}</td><td style="text-align:right">${i.price.toFixed(0)}</td><td style="text-align:right;font-weight:700">${(i.price * i.qty).toFixed(0)}</td></tr>`
    ).join('');
    const html = `<!DOCTYPE html><html><head><title>Invoice ${bill.billNo}</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:monospace;padding:12px;color:#000;background:#fff;font-size:12px;max-width:104mm;margin:0 auto}
      .center{text-align:center} .right{text-align:right}
      .store-name{font-size:14px;font-weight:900;text-transform:uppercase;letter-spacing:.05em}
      .dashed{border-top:1px dashed #ccc;margin:8px 0;padding-top:8px}
      table{width:100%;border-collapse:collapse;margin:8px 0}
      th{background:#f5f5f5;padding:5px 3px;font-size:10px;border-bottom:1px solid #ccc}
      td{padding:4px 3px;font-size:11px;border-bottom:.5px solid #eee}
      .total-row{border-top:2px solid #000;padding-top:6px;display:flex;justify-content:space-between;font-size:14px;font-weight:900}
    </style></head><body>
    <div class="center" style="margin-bottom:8px">
      <div class="store-name">${storeInfo.name}</div>
      <div style="font-size:10px;color:#444;margin-top:2px">${storeInfo.tagline}</div>
      <div style="font-size:10px;color:#555;margin-top:4px;line-height:1.5">${storeInfo.address}</div>
      <div style="font-size:10px;color:#555">Ph: ${storeInfo.phone}</div>
      <div style="font-size:10px;color:#555">GSTIN: ${storeInfo.gstin}</div>
    </div>
    <div class="dashed" style="display:flex;justify-content:space-between;font-size:11px">
      <div><div>Date: ${bill.date}</div><div>Biller: ${bill.biller}</div></div>
      <div class="right"><div style="font-weight:700">Inv: ${bill.billNo}</div></div>
    </div>
    <div class="dashed" style="font-size:11px;display:flex;justify-content:space-between">
      <div><div><b>To:</b> ${bill.customer.name || bill.customer.shopName}</div>${bill.customer.shopName ? `<div><b>Shop:</b> ${bill.customer.shopName}</div>` : ''}</div>
      <div class="right">${bill.customer.phone && bill.customer.phone !== 'N/A' ? `<div><b>Ph:</b> ${bill.customer.phone}</div>` : ''}${bill.customer.area ? `<div><b>Area:</b> ${bill.customer.area}</div>` : ''}</div>
    </div>
    <table><thead><tr><th style="text-align:left;width:44%">ITEM</th><th style="text-align:center;width:14%">QTY</th><th style="text-align:right;width:21%">RATE</th><th style="text-align:right;width:21%">AMT</th></tr></thead>
    <tbody>${itemRows}</tbody></table>
    <div style="border-top:1px dashed #ccc;padding-top:8px">
      <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px;color:#333"><span>Subtotal</span><span>Rs.${bill.subtotal.toFixed(2)}</span></div>
      <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:6px;color:#333"><span>Tax</span><span>Rs.${bill.tax.toFixed(2)}</span></div>
      <div class="total-row"><span>TOTAL</span><span>Rs.${bill.total.toFixed(2)}</span></div>
      <div style="border-top:2px solid #000;margin-top:4px"></div>
    </div>
    <div class="center" style="margin-top:12px;font-size:10px;color:#555;font-weight:600">Thank you for your business!</div>
    </body></html>`;
    if (Capacitor.isNativePlatform()) {
      try {
        const content = `<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:monospace;padding:8px;color:#000;background:#fff;font-size:12px}table{width:100%;border-collapse:collapse}th{background:#f5f5f5;border-bottom:1px solid #ccc;padding:5px 4px;text-align:left;font-size:11px}td{padding:4px;font-size:11px}hr{border:none;border-top:1px dashed #ccc;margin:8px 0}</style></head><body>${html}</body></html>`;
        await CapacitorPrinter.printHtml({ html: content, name: `Invoice-${bill.billNo}` });
      } catch (err) { console.error("Print Error:", err); }
    } else {
      const w = window.open('', '_blank');
      if (!w) { alert("Allow popups to print"); return; }
      w.document.write(html);
      w.document.close();
      w.focus();
      setTimeout(() => { w.print(); }, 400);
    }
  };

  const isPaid = (bill.status || 'paid') === 'paid';
  const hasPhone = bill.customer.phone && bill.customer.phone !== 'N/A';
  const storeInfo = store.get("kc_store_info") || STORE_INFO;

  return (
    <div className="animate-pop-in">

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>← Back</button>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={handlePrint}><Printer size={14} /> Print</button>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <button onClick={handleWhatsAppImage} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '11px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', background: '#25D366', color: '#fff', fontWeight: 700, fontSize: '0.9rem', fontFamily: 'inherit' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Share on WhatsApp
        </button>
      </div>

      {/* Paid / Due toggle */}
      <div style={{ marginBottom: '14px' }}>
        <button onClick={() => onToggleStatus(bill.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '11px', borderRadius: 'var(--radius-md)', border: `2px solid ${isPaid ? 'var(--success)' : 'var(--danger)'}`, cursor: 'pointer', background: isPaid ? 'var(--success-bg)' : 'var(--danger-bg)', color: isPaid ? 'var(--success)' : 'var(--danger)', fontWeight: 700, fontSize: '0.9rem', fontFamily: 'inherit' }}>
          {isPaid ? <><CheckCircle size={16} /> Paid — Tap to mark as Due</> : <><Circle size={16} /> Due — Tap to mark as Paid</>}
        </button>
      </div>

      {!hasPhone && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', marginBottom: '10px', fontSize: '0.78rem', color: 'var(--danger)', fontWeight: 600 }}>
          <AlertCircle size={13} /> No phone number saved — WhatsApp will open without pre-filling contact
        </div>
      )}

      {/* Invoice preview card */}
      <div ref={billRef} className="card" style={{ background: '#ffffff', color: '#000000', padding: '16px', fontFamily: 'monospace', border: '1px solid #e5e7eb' }}>
        <div style={{ textAlign: 'center', paddingBottom: '10px', borderBottom: '1px dashed #ccc', marginBottom: '10px' }}>
          <div style={{ fontSize: '1.05rem', fontWeight: 900, textTransform: 'uppercase', color: '#000', letterSpacing: '0.05em' }}>{storeInfo.name}</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#444', marginTop: '3px' }}>{storeInfo.tagline}</div>
          <div style={{ fontSize: '0.7rem', color: '#555', marginTop: '5px', lineHeight: 1.5 }}>{storeInfo.address}</div>
          <div style={{ fontSize: '0.7rem', color: '#555', marginTop: '3px' }}>Ph: {storeInfo.phone}</div>
          <div style={{ fontSize: '0.7rem', color: '#555' }}>GSTIN: {storeInfo.gstin}</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#000', marginBottom: '10px' }}>
          <div><div>Date: {bill.date}</div><div>Biller: {bill.biller}</div></div>
          <div style={{ textAlign: 'right' }}>
            <div>Inv: {bill.billNo}</div>
            <div style={{ marginTop: '3px', padding: '2px 7px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 700, background: isPaid ? '#d1fae5' : '#fee2e2', color: isPaid ? '#065f46' : '#991b1b', display: 'inline-block' }}>{isPaid ? 'PAID' : 'DUE'}</div>
          </div>
        </div>

        <div style={{ borderTop: '1px dashed #ccc', paddingTop: '8px', marginBottom: '10px', fontSize: '0.75rem', color: '#000', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ flex: 1, paddingRight: '5px' }}>
            {bill.customer.shopName && <div><strong>Shop:</strong> {bill.customer.shopName}</div>}
            <div><strong>To:</strong> {bill.customer.name || bill.customer.shopName}</div>
          </div>
          <div style={{ flex: 1, textAlign: 'right', paddingLeft: '5px' }}>
            {bill.customer.phone && bill.customer.phone !== 'N/A' && <div><strong>Ph:</strong> {bill.customer.phone}</div>}
            {bill.customer.area && <div><strong>Area:</strong> {bill.customer.area}</div>}
          </div>
        </div>

        <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse', marginBottom: '10px' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '5px 3px', width: '44%', background: '#f5f5f5', color: '#000', borderBottom: '1px solid #ccc' }}>ITEM</th>
              <th style={{ textAlign: 'center', padding: '5px 3px', width: '14%', background: '#f5f5f5', color: '#000', borderBottom: '1px solid #ccc' }}>QTY</th>
              <th style={{ textAlign: 'right', padding: '5px 3px', width: '21%', background: '#f5f5f5', color: '#000', borderBottom: '1px solid #ccc' }}>RATE</th>
              <th style={{ textAlign: 'right', padding: '5px 3px', width: '21%', background: '#f5f5f5', color: '#000', borderBottom: '1px solid #ccc' }}>AMT</th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((i, idx) => (
              <tr key={idx} style={{ borderBottom: '0.5px solid #eee' }}>
                <td style={{ padding: '5px 3px', color: '#000' }}>{i.name} <span style={{ color: '#666' }}>({i.weight})</span></td>
                <td style={{ textAlign: 'center', padding: '5px 3px', color: '#000' }}>{i.qty}</td>
                <td style={{ textAlign: 'right', padding: '5px 3px', color: '#000' }}>{i.price.toFixed(0)}</td>
                <td style={{ textAlign: 'right', padding: '5px 3px', fontWeight: 600, color: '#000' }}>{(i.price * i.qty).toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ borderTop: '1px dashed #ccc', paddingTop: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '3px', color: '#333' }}><span>Subtotal</span><span>Rs.{bill.subtotal.toFixed(2)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '8px', color: '#333' }}><span>Tax</span><span>Rs.{bill.tax.toFixed(2)}</span></div>
          <div style={{ borderTop: '2px solid #000', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 900, color: '#000' }}>
            <span>TOTAL</span><span>Rs.{bill.total.toFixed(2)}</span>
          </div>
          <div style={{ borderTop: '2px solid #000', marginTop: '5px' }} />
        </div>

        <div style={{ textAlign: 'center', fontSize: '0.7rem', marginTop: '14px', color: '#555', fontWeight: 600 }}>
          Thank you for your business!
        </div>
      </div>
    </div>
  );
}

function CustomersScreen({ customers, setCustomers, notify }) {
  const [search, setSearch] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", shopName: "", area: "" });

  // Get unique areas from all customers
  const areas = [...new Set(customers.map(c => c.area).filter(Boolean))].sort();

  const filtered = customers.filter(c => {
    const matchesSearch = !search ||
      (c.shopName && c.shopName.toLowerCase().includes(search.toLowerCase())) ||
      (c.name && c.name.toLowerCase().includes(search.toLowerCase())) ||
      c.phone.includes(search) ||
      (c.area && c.area.toLowerCase().includes(search.toLowerCase()));
    const matchesArea = !areaFilter || (c.area && c.area.toLowerCase() === areaFilter.toLowerCase());
    return matchesSearch && matchesArea;
  });

  const save = () => { if (!form.shopName || !form.phone) { notify("Shop name and phone required", "error"); return; } setCustomers(prev => [{ ...form, id: genId(), since: today() }, ...prev]); setForm({ name: "", phone: "", shopName: "", area: "" }); setAdding(false); notify("Customer added!"); };
  const remove = (id) => { setCustomers(prev => prev.filter(c => c.id !== id)); notify("Customer removed"); };

  return (
    <div className="animate-fade-in">
      <div className="section-header">
        <h2 className="section-title">Customer Database</h2>
        {customers.length > 0 && (
          <button className="btn btn-primary" onClick={() => setAdding(a => !a)}>
            {adding ? <><X size={14} /> Cancel</> : <><Plus size={14} /> Add</>}
          </button>
        )}
      </div>

      {adding && (
        <div className="card animate-slide-down" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div className="card-title" style={{ margin: 0 }}>New Customer</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="input-group" style={{ margin: 0, gridColumn: '1/-1' }}><label className="label">Shop Name *</label><input className="input" placeholder="Sri Krishna Stores" value={form.shopName} onChange={e => setForm(p => ({ ...p, shopName: e.target.value }))} /></div>
            <div className="input-group" style={{ margin: 0 }}><label className="label">Owner Name</label><input className="input" placeholder="Rahul Sharma" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="input-group" style={{ margin: 0 }}><label className="label">Phone *</label><input className="input" type="tel" placeholder="10-digit" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
            <div className="input-group" style={{ margin: 0, gridColumn: '1/-1' }}><label className="label">Area</label><input className="input" placeholder="e.g. Udupi, Manipal" value={form.area} onChange={e => setForm(p => ({ ...p, area: e.target.value }))} /></div>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }} onClick={save}><Check size={14} /> Save Customer</button>
        </div>
      )}

      <div className="card" style={{ marginBottom: 0 }}>
        {/* Search */}
        <div style={{ marginBottom: areas.length > 0 ? '10px' : '12px' }}>
          <div className="search-wrapper" style={{ marginBottom: 0 }}>
            <Search className="search-icon" size={16} />
            <input className="input search-input" type="text" placeholder="Search by shop, name, phone..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Area filter chips */}
        {areas.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <button onClick={() => setAreaFilter("")} style={{ padding: '4px 12px', borderRadius: '20px', border: `1.5px solid ${!areaFilter ? 'var(--primary)' : 'var(--border-color)'}`, background: !areaFilter ? 'var(--primary)' : 'transparent', color: !areaFilter ? '#fff' : 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              All
            </button>
            {areas.map(area => (
              <button key={area} onClick={() => setAreaFilter(areaFilter === area ? "" : area)} style={{ padding: '4px 12px', borderRadius: '20px', border: `1.5px solid ${areaFilter === area ? 'var(--primary)' : 'var(--border-color)'}`, background: areaFilter === area ? 'var(--primary)' : 'transparent', color: areaFilter === area ? '#fff' : 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                {area}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <EmptyState icon={<Users size={30} color="var(--text-muted)" />} title={search || areaFilter ? "No results" : "No customers yet"} subtitle={search || areaFilter ? "Try a different search or filter" : "Tap + to add your first customer"} action={!search && !areaFilter ? "+ Add Customer" : null} onAction={() => setAdding(true)} />
        ) : (
          <div>
            {filtered.map(c => (
              <SwipeToDelete key={c.id} onDelete={() => remove(c.id)}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '10px 4px', borderBottom: '1px solid var(--border-subtle)', gap: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0, background: 'linear-gradient(135deg, var(--primary-light), var(--primary))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.95rem' }}>
                    {(c.shopName || c.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.shopName || c.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.name && c.shopName ? `${c.name} · ` : ""}{c.phone}{c.area ? ` · ${c.area}` : ""}</div>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-hint)', flexShrink: 0 }}>{c.since}</div>
                </div>
              </SwipeToDelete>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductsScreen({ products, setProducts, notify }) {
  const [tab, setTab] = useState("flour");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", weight: "", price: "" });

  const addProduct = () => {
    if (!form.name || !form.weight || !form.price) { notify("All fields required", "error"); return; }
    setProducts(prev => ({ ...prev, [tab]: [...prev[tab], { id: genId(), name: form.name, weight: form.weight, price: Number(form.price) }] }));
    setForm({ name: "", weight: "", price: "" }); setAdding(false); notify("Product added!");
  };

  return (
    <div className="animate-fade-in">
      <div className="section-header">
        <h2 className="section-title">Product Master List</h2>
        <button className="btn btn-primary" onClick={() => setAdding(a => !a)}>{adding ? <><X size={14} /> Cancel</> : <><Plus size={14} /> Add</>}</button>
      </div>

      {adding && (
        <div className="card animate-slide-down" style={{ borderLeft: '4px solid var(--primary)', marginBottom: '14px' }}>
          <div className="card-title">New Product — {tab.charAt(0).toUpperCase() + tab.slice(1)}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="input-group" style={{ margin: 0 }}><label className="label">Product Name *</label><input className="input" placeholder="e.g. Ragi Fine" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="input-group" style={{ margin: 0 }}><label className="label">Weight / Unit *</label><input className="input" placeholder="e.g. 500 gms" value={form.weight} onChange={e => setForm(p => ({ ...p, weight: e.target.value }))} /></div>
            <div className="input-group" style={{ margin: 0, gridColumn: '1/-1' }}><label className="label">Price (Rs.) *</label><input className="input" type="number" placeholder="e.g. 45" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} /></div>
          </div>
          <button className="btn btn-primary" style={{ marginTop: '12px', width: '100%' }} onClick={addProduct}><Check size={14} /> Save Product</button>
        </div>
      )}

      {/* ✅ Full width tabs */}
      <div className="tabs-container" style={{ marginBottom: '14px', width: '100%', display: 'flex' }}>
        {[['flour','Flour',Wheat],['rava','Rava',Cookie],['packing','Packing',Package]].map(([key, label, Icon]) => (
          <button key={key} className={`tab-btn ${tab === key ? 'active' : ''}`} style={{ flex: 1, fontFamily: 'inherit' }} onClick={() => setTab(key)}>
            <Icon size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />{label}
          </button>
        ))}
      </div>

      <div className="card">
        {products[tab].length === 0 ? (
          <EmptyState icon={<Package size={30} color="var(--text-muted)" />} title="No products" subtitle="Tap Add to get started" action="+ Add Product" onAction={() => setAdding(true)} />
        ) : (
          // ✅ Responsive table — works portrait and landscape
          <div style={{ width: '100%', minWidth: '320px' }}>
            <div style={{ display: 'flex', padding: '9px 10px', background: 'var(--surface-alt)', borderBottom: '1px solid var(--border-subtle)' }}>
              {[['#','40px','left'],['Product','1','left'],['Weight','80px','left'],['Price','110px','center']].map(([h, w, align]) => (
                <div key={h} style={{ width: w !== '1' ? w : 'auto', flex: w === '1' ? 1 : 'none', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: align }}>{h}</div>
              ))}
            </div>
            <div>
              {products[tab].map((p, i) => (
                <SwipeToDelete key={p.id} onDelete={() => { setProducts(prev => { const n = { ...prev }; n[tab] = n[tab].filter(prod => prod.id !== p.id); return n; }); notify("Product deleted"); }}>
                  <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', padding: '11px 10px' }}>
                    <div style={{ width: '40px', flex: 'none', color: 'var(--text-hint)', fontSize: '0.82rem' }}>#{i + 1}</div>
                    <div style={{ flex: 1, fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '10px' }}>{p.name}</div>
                    <div style={{ width: '80px', flex: 'none' }}><span style={{ background: 'var(--surface-alt)', padding: '3px 8px', borderRadius: '10px', fontSize: '0.78rem', whiteSpace: 'nowrap', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>{p.weight}</span></div>
                    <div style={{ width: '110px', flex: 'none', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                        <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem' }}>Rs.</span>
                        <input className="input" type="number" style={{ width: '64px', textAlign: 'center', fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem', padding: '4px 5px' }} value={p.price}
                          onChange={e => { const val = Number(e.target.value); if (!isNaN(val) && val >= 0) setProducts(prev => { const n = { ...prev }; n[tab] = n[tab].map(prod => prod.id === p.id ? { ...prod, price: val } : prod); return n; }); }} />
                      </div>
                    </div>
                  </div>
                </SwipeToDelete>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InventoryScreen({ inventory, setInventory, notify, products }) {
  const [tab, setTab] = useState("flour");
  const [editing, setEditing] = useState({});
  const update = (id, val) => { const n = parseInt(val); if (!isNaN(n) && n >= 0) { setInventory(prev => ({ ...prev, [id]: n })); notify("Stock updated"); } };

  return (
    <div className="animate-fade-in">
      <div className="section-header"><h2 className="section-title">Delivery Van Inventory</h2></div>

      {Object.entries(inventory).some(([, qty]) => qty < 10) && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '9px', background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', padding: '10px 13px', marginBottom: '12px' }}>
          <AlertCircle size={16} color="var(--danger)" style={{ flexShrink: 0, marginTop: '1px' }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--danger)', fontWeight: 600, lineHeight: 1.4 }}>Items highlighted in red have low stock (less than 10 units).</span>
        </div>
      )}

      {/* ✅ Consistent font tabs */}
      <div className="tabs-container" style={{ marginBottom: '12px', width: '100%', display: 'flex' }}>
        {[['flour','Flour',Wheat],['rava','Rava',Cookie],['packing','Packing',Package]].map(([key, label, Icon]) => (
          <button key={key} className={`tab-btn ${tab === key ? 'active' : ''}`} style={{ flex: 1, fontFamily: 'inherit' }} onClick={() => setTab(key)}>
            <Icon size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />{label}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', padding: '9px 14px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-alt)' }}>
          <div style={{ flex: 2, fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'inherit' }}>Product</div>
          <div style={{ flex: 1.5, fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'inherit' }}>Status</div>
          {/* ✅ Stock centered */}
          <div style={{ flex: 1, fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: 'center', fontFamily: 'inherit' }}>Stock</div>
        </div>

        {products[tab].length === 0 ? <EmptyState icon={<Package size={26} color="var(--text-muted)" />} title="No products" subtitle="Add products first" /> : products[tab].map((p, index) => {
          const qty = inventory[p.id] ?? 0;
          const isLowStock = qty < 10;
          return (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', background: isLowStock ? 'var(--danger-bg)' : 'var(--surface)', borderBottom: index !== products[tab].length - 1 ? '0.5px solid var(--border-subtle)' : 'none' }}>
              <div style={{ flex: 2, paddingRight: '8px', overflow: 'hidden' }}>
                {/* ✅ Consistent font */}
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: isLowStock ? 'var(--danger)' : 'var(--text-main)', fontFamily: 'inherit', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'inherit' }}>({p.weight})</div>
              </div>
              <div style={{ flex: 1.5 }}>
                {isLowStock ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap', padding: '3px 9px', border: '1.5px solid var(--danger)', borderRadius: '20px', fontSize: '0.68rem', fontWeight: 700, color: 'var(--danger)', fontFamily: 'inherit' }}>LOW STOCK</span>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', color: 'var(--success)', gap: '3px' }}>
                    <Check size={13} /><span style={{ fontSize: '0.82rem', fontWeight: 500, fontFamily: 'inherit' }}>Healthy</span>
                  </div>
                )}
              </div>
              {/* ✅ Stock number centered */}
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <input type="number" min={0}
                  style={{ width: '52px', fontSize: '0.95rem', fontWeight: 700, color: isLowStock ? 'var(--danger)' : 'var(--text-main)', background: 'transparent', border: 'none', borderBottom: editing[p.id] !== undefined ? '2px solid var(--primary)' : '1px solid transparent', outline: 'none', textAlign: 'center', fontFamily: 'inherit' }}
                  value={editing[p.id] !== undefined ? editing[p.id] : qty}
                  onChange={e => setEditing(prev => ({ ...prev, [p.id]: e.target.value }))}
                  onBlur={e => { update(p.id, e.target.value); setEditing(prev => { const n = { ...prev }; delete n[p.id]; return n; }); }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── REPORTS SCREEN ──────────────────────────────────────────────────────────
function ReportsScreen({ bills, setBills, notify }) {
  const [period, setPeriod] = useState("today");
  const [viewBill, setViewBill] = useState(null);

  const toggleStatus = (id) => setBills(prev => prev.map(b => b.id === id ? { ...b, status: b.status === "paid" ? "pending" : "paid" } : b));

  if (viewBill) {
    const liveBill = bills.find(b => b.id === viewBill.id) || viewBill;
    return <BillView bill={liveBill} onClose={() => setViewBill(null)} onToggleStatus={(id) => toggleStatus(id)} />;
  }

  const todayStr = today();
  const getWeekStart = () => { const d = new Date(); d.setDate(d.getDate() - d.getDay()); return d.toLocaleDateString("en-IN"); };

  const filtered = bills.filter(b => {
    if (period === "today") return b.date === todayStr;
    if (period === "week") {
      const ws = new Date(getWeekStart().split('/').reverse().join('-'));
      const bd = new Date(b.date.split('/').reverse().join('-'));
      return bd >= ws;
    }
    return true; // all
  });

  const totalRevenue = filtered.reduce((s, b) => s + b.total, 0);
  const paidRevenue = filtered.filter(b => b.status === "paid").reduce((s, b) => s + b.total, 0);
  const pendingRevenue = filtered.filter(b => b.status === "pending").reduce((s, b) => s + b.total, 0);
  const avgBill = filtered.length ? totalRevenue / filtered.length : 0;

  // Top products
  const productMap = {};
  filtered.forEach(b => b.items.forEach(i => {
    if (!productMap[i.name]) productMap[i.name] = { name: i.name, qty: 0, revenue: 0 };
    productMap[i.name].qty += i.qty;
    productMap[i.name].revenue += i.price * i.qty;
  }));
  const topProducts = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const maxRevenue = topProducts[0]?.revenue || 1;

  const exportPDF = async () => {
    if (filtered.length === 0) { notify("No bills to export", "error"); return; }
    const periodLabel = period === 'today' ? 'Today' : period === 'week' ? 'This Week' : 'All Time';

    const container = document.createElement('div');
    container.style.cssText = `position:fixed;left:-9999px;top:0;width:800px;background:#fff;padding:32px;font-family:Arial,sans-serif;font-size:13px;color:#000;box-sizing:border-box;`;
    container.innerHTML = `
      <div style="margin-bottom:20px">
        <div style="font-size:22px;font-weight:900;color:#78350f;margin-bottom:2px">Karthik Flour Mill</div>
        <div style="font-size:13px;color:#666;margin-bottom:2px">Sales Report — ${periodLabel}</div>
        <div style="font-size:11px;color:#888">Generated: ${todayStr} &nbsp;|&nbsp; Total Bills: ${filtered.length}</div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px">
        <div style="border:1px solid #ddd;border-radius:10px;padding:12px 14px">
          <div style="font-size:9px;color:#888;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">Total Revenue</div>
          <div style="font-size:22px;font-weight:800;color:#b45309">Rs.${totalRevenue.toFixed(0)}</div>
        </div>
        <div style="border:1px solid #ddd;border-radius:10px;padding:12px 14px">
          <div style="font-size:9px;color:#888;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">Collected</div>
          <div style="font-size:22px;font-weight:800;color:#059669">Rs.${paidRevenue.toFixed(0)}</div>
        </div>
        <div style="border:1px solid #ddd;border-radius:10px;padding:12px 14px">
          <div style="font-size:9px;color:#888;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">Pending Due</div>
          <div style="font-size:22px;font-weight:800;color:#dc2626">Rs.${pendingRevenue.toFixed(0)}</div>
        </div>
        <div style="border:1px solid #ddd;border-radius:10px;padding:12px 14px">
          <div style="font-size:9px;color:#888;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">Avg Bill</div>
          <div style="font-size:22px;font-weight:800;color:#333">Rs.${avgBill.toFixed(0)}</div>
        </div>
      </div>
      <div style="font-size:13px;font-weight:700;color:#333;margin-bottom:10px">Invoice Details</div>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:#f5f5f5">
            <th style="padding:8px;text-align:left;font-size:10px;text-transform:uppercase;border-bottom:2px solid #ddd;color:#555">#</th>
            <th style="padding:8px;text-align:left;font-size:10px;text-transform:uppercase;border-bottom:2px solid #ddd;color:#555">Invoice No</th>
            <th style="padding:8px;text-align:left;font-size:10px;text-transform:uppercase;border-bottom:2px solid #ddd;color:#555">Shop / Customer</th>
            <th style="padding:8px;text-align:left;font-size:10px;text-transform:uppercase;border-bottom:2px solid #ddd;color:#555">Date</th>
            <th style="padding:8px;text-align:right;font-size:10px;text-transform:uppercase;border-bottom:2px solid #ddd;color:#555">Amount</th>
            <th style="padding:8px;text-align:left;font-size:10px;text-transform:uppercase;border-bottom:2px solid #ddd;color:#555">Status</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map((b, i) => `
            <tr style="border-bottom:1px solid #eee">
              <td style="padding:7px 8px;font-size:11px">${i + 1}</td>
              <td style="padding:7px 8px;font-size:11px">${b.billNo}</td>
              <td style="padding:7px 8px;font-size:11px;font-weight:600">${b.customer.shopName || b.customer.name}</td>
              <td style="padding:7px 8px;font-size:11px">${b.date}</td>
              <td style="padding:7px 8px;font-size:11px;text-align:right;font-weight:700">Rs.${b.total.toFixed(2)}</td>
              <td style="padding:7px 8px;font-size:11px">
                <span style="padding:2px 8px;border-radius:10px;font-size:9px;font-weight:700;background:${(b.status||'paid')==='paid'?'#d1fae5':'#fee2e2'};color:${(b.status||'paid')==='paid'?'#065f46':'#991b1b'}">${(b.status||'paid').toUpperCase()}</span>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
      <div style="margin-top:20px;font-size:10px;color:#aaa;text-align:center">
        Karthik Flour Mill &nbsp;|&nbsp; ${STORE_INFO.phone} &nbsp;|&nbsp; ${STORE_INFO.address}
      </div>`;

    document.body.appendChild(container);
    try {
      const canvas = await html2canvas(container, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
      document.body.removeChild(container);
      if (Capacitor.isNativePlatform()) {
        const base64Data = canvas.toDataURL('image/png').split(',')[1];
        const result = await Filesystem.writeFile({ path: `KFM_Report_${period}.png`, data: base64Data, directory: Directory.Cache });
        await Share.share({ url: result.uri, dialogTitle: 'Save Report' });
      } else {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `KFM_Report_${periodLabel.replace(' ', '_')}_${todayStr.replace(/\\//g, '-')}.png`;
        link.click();
      }
      notify("Report saved as image!");
    } catch (e) {
      if (document.body.contains(container)) document.body.removeChild(container);
      notify("Failed to save", "error");
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="section-header">
        <h2 className="section-title">Sales Reports</h2>
      </div>

      <div id="report-capture">
      {/* Period selector */}
      <div className="tabs-container" style={{ marginBottom: '14px', width: '100%', display: 'flex' }}>
        {[['today','Today'], ['week','This Week'], ['all','All Time']].map(([key, label]) => (
          <button key={key} className={`tab-btn ${period === key ? 'active' : ''}`} style={{ flex: 1, fontFamily: 'inherit' }} onClick={() => setPeriod(key)}>{label}</button>
        ))}
      </div>

      {/* Summary stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
        {[
          { label: 'Total Bills', value: filtered.length, color: 'var(--primary)', bg: 'var(--surface-alt)' },
          { label: 'Avg Bill', value: `Rs.${avgBill.toFixed(0)}`, color: 'var(--primary)', bg: 'var(--surface-alt)' },
          { label: 'Collected', value: `Rs.${paidRevenue.toFixed(0)}`, color: 'var(--success)', bg: 'var(--success-bg)' },
          { label: 'Pending Due', value: `Rs.${pendingRevenue.toFixed(0)}`, color: 'var(--danger)', bg: 'var(--danger-bg)' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>{s.label}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Total revenue highlight */}
      <div style={{ background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))', borderRadius: 'var(--radius-lg)', padding: '16px 20px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.75)', fontWeight: 600, marginBottom: '4px' }}>TOTAL REVENUE</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fff' }}>Rs.{totalRevenue.toFixed(0)}</div>
        </div>
        <TrendingUp size={40} color="rgba(255,255,255,0.3)" />
      </div>

      {/* Top Products */}
      {topProducts.length > 0 && (
        <div className="card" style={{ marginBottom: '14px' }}>
          <div className="card-title"><Package size={15} /> Top Products</div>
          {topProducts.map((p, i) => (
            <div key={p.name} style={{ marginBottom: i < topProducts.length - 1 ? '12px' : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{p.name}</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{p.qty} units · Rs.{p.revenue.toFixed(0)}</span>
              </div>
              <div style={{ height: '6px', background: 'var(--surface-alt)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(p.revenue / maxRevenue) * 100}%`, background: 'linear-gradient(90deg, var(--primary-light), var(--primary))', borderRadius: '10px', transition: 'width 0.6s ease' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All invoices list — tap to open, badge to toggle status */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '14px' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary-dark)' }}>All Invoices ({filtered.length})</span>
        </div>
        {filtered.length === 0 ? (
          <EmptyState icon={<BarChart2 size={28} color="var(--text-muted)" />} title="No bills yet" subtitle="Bills for this period will appear here" />
        ) : filtered.map((b, i) => (
          <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: i < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
            {/* Tap left side to open invoice */}
            <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setViewBill(b)}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{b.customer.shopName || b.customer.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{b.billNo} · {b.date} · <span style={{ color: 'var(--primary)' }}>Tap to view →</span></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.88rem' }}>Rs.{b.total.toFixed(0)}</span>
              <button onClick={() => toggleStatus(b.id)}
                style={{ padding: '3px 8px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 700, background: (b.status || 'paid') === 'paid' ? 'var(--success-bg)' : 'var(--danger-bg)', color: (b.status || 'paid') === 'paid' ? 'var(--success)' : 'var(--danger)', border: `1.5px solid ${(b.status || 'paid') === 'paid' ? 'var(--success)' : 'var(--danger)'}`, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {(b.status || 'paid') === 'paid' ? '✓ Paid' : '○ Due'}
              </button>
            </div>
          </div>
        ))}
      </div>
      </div>{/* end report-capture */}

      {/* Export button */}
      <button className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '0.95rem', marginBottom: '14px' }} onClick={exportPDF}>
        <Download size={16} /> Save Report as Image
      </button>
    </div>
  );
}

// ─── PROFILE SCREEN ───────────────────────────────────────────────────────────
function ProfileScreen({ profileName, setProfileName, setScreen, setUser, notify }) {
  const [name, setName] = useState(profileName);
  const [info, setInfo] = useState(() => store.get("kc_store_info") || STORE_INFO);
  const [subTab, setSubTab] = useState("profile");

  const saveProfile = () => { if (!name.trim()) { notify("Name cannot be empty", "error"); return; } setProfileName(name); notify("Profile updated!"); };
  const saveStore = () => { store.set("kc_store_info", info); notify("Store info updated!"); };

  return (
    <div className="animate-fade-in">
      <div className="section-header"><h2 className="section-title">Settings</h2></div>

      <div className="tabs-container" style={{ marginBottom: '14px', width: '100%', display: 'flex' }}>
        <button className={`tab-btn ${subTab === 'profile' ? 'active' : ''}`} style={{ flex: 1, fontFamily: 'inherit' }} onClick={() => setSubTab('profile')}>
          <User size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />Profile
        </button>
        <button className={`tab-btn ${subTab === 'store' ? 'active' : ''}`} style={{ flex: 1, fontFamily: 'inherit' }} onClick={() => setSubTab('store')}>
          <Store size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />Store Info
        </button>
      </div>

      {subTab === 'profile' && (
        <>
          <div className="card">
            <div className="card-title"><User size={15} /> Personal Details</div>
            <div className="input-group">
              <label className="label">Biller Display Name</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Full name for invoices" />
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '6px' }} onClick={saveProfile}>Save Profile</button>
          </div>
          <div className="card" style={{ border: '1px dashed var(--danger)' }}>
            <div className="card-title" style={{ color: 'var(--danger)' }}><LogOut size={15} /> Exit Application</div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Securely log out of the billing platform.</p>
            <button className="btn btn-danger" style={{ width: '100%' }} onClick={() => { store.set("kc_user", null); setUser(null); setScreen("login"); }}>Secure Logout</button>
          </div>
        </>
      )}

      {subTab === 'store' && (
        <>
          <div className="card">
            <div className="card-title"><Store size={15} /> Business Information</div>
            {[['Store Name','name'],['Tagline','tagline'],['Authorized Biller','biller'],['Contact Phone','phone'],['Address','address'],['GSTIN','gstin']].map(([label, key]) => (
              <div className="input-group" key={key}>
                <label className="label">{label}</label>
                <input className="input" value={info[key]} onChange={e => setInfo(p => ({ ...p, [key]: e.target.value }))} />
              </div>
            ))}
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '6px' }} onClick={saveStore}>Update Store Info</button>
          </div>
          <div className="card" style={{ background: 'var(--surface-alt)', border: '2px dashed var(--border-color)' }}>
            <div className="card-title">Receipt Preview</div>
            <div style={{ textAlign: 'center', padding: '14px 0' }}>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--primary-dark)' }}>{info.name}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600, marginTop: '3px' }}>{info.tagline}</div>
              <div style={{ marginTop: '8px', color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.5 }}>{info.address}</div>
              <div style={{ marginTop: '6px', fontWeight: 600, fontSize: '0.82rem' }}>Ph: {info.phone}</div>
              <div style={{ marginTop: '3px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>GSTIN: {info.gstin}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

