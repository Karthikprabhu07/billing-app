import { useState, useEffect, useRef } from "react";
import {
  ShoppingCart, Users, Package, Truck,
  LogOut, Plus, Minus, Search, Trash2, Printer,
  ChevronRight, Cookie, Wheat, Check, AlertCircle, X,
  Moon, Sun, User, Eye, EyeOff, Share2, RefreshCw, Store
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

function usePullToRefresh(onRefresh) {
  const startY = useRef(null);
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const onTouchStart = (e) => { if (window.scrollY === 0) startY.current = e.touches[0].clientY; };
  const onTouchMove = (e) => { if (!startY.current) return; if (e.touches[0].clientY - startY.current > 60) setPulling(true); };
  const onTouchEnd = async () => { if (pulling) { setRefreshing(true); setPulling(false); await onRefresh(); setTimeout(() => setRefreshing(false), 800); } startY.current = null; };
  return { onTouchStart, onTouchMove, onTouchEnd, refreshing };
}

function PullIndicator({ refreshing }) {
  if (!refreshing) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600 }}>
      <RefreshCw size={16} style={{ animation: 'spin 0.9s linear infinite' }} /> Refreshing...
    </div>
  );
}

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
  const [darkMode, setDarkMode] = useState(() => store.get("kc_theme") === "dark");

  useEffect(() => { store.set("kc_customers", customers); }, [customers]);
  useEffect(() => { store.set("kc_products", products); }, [products]);
  useEffect(() => { store.set("kc_inventory", inventory); }, [inventory]);
  useEffect(() => { store.set("kc_bills", bills); }, [bills]);
  useEffect(() => { store.set("kc_profile_name", profileName); }, [profileName]);
  useEffect(() => { store.set("kc_theme", darkMode ? "dark" : "light"); document.body.classList.toggle('dark', darkMode); }, [darkMode]);

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
    { key: "profile",   icon: <User size={20} />,         label: "Profile" },
  ];

  return (
    <div className="app-container">
      <header className="topbar no-print">
        <div className="brand-section">
          <div className="brand-icon"><Wheat size={28} /></div>
          <div><div className="brand-name">{STORE_INFO.name}</div><div className="brand-sub">{STORE_INFO.tagline}</div></div>
        </div>
        <div className="user-section">
          <button className="btn-icon" style={{ color: 'white', padding: '4px' }} onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
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
