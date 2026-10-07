
function CustomersScreen({ customers, setCustomers, notify }) {
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", shopName: "", area: "" });

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search) ||
    (c.area && c.area.toLowerCase().includes(search.toLowerCase())) ||
    (c.shopName && c.shopName.toLowerCase().includes(search.toLowerCase()))
  );
  const save = () => { if (!form.name || !form.phone) { notify("Name and phone required", "error"); return; } setCustomers(prev => [{ ...form, id: genId(), since: today() }, ...prev]); setForm({ name: "", phone: "", shopName: "", area: "" }); setAdding(false); notify("Customer added!"); };
  const remove = (id) => { setCustomers(prev => prev.filter(c => c.id !== id)); notify("Customer removed"); };
  return (
    <div className="animate-fade-in">
      <div className="section-header">
        <h2 className="section-title">Customer Database</h2>
        <button className="btn btn-primary" onClick={() => setAdding(a => !a)}>{adding ? <><X size={14} /> Cancel</> : <><Plus size={14} /> Add</>}</button>
      </div>

      {adding && (
        <div className="card animate-slide-down" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div className="card-title" style={{ margin: 0 }}>New Customer</div>
            <button className="btn-icon" onClick={() => setAdding(false)}><X size={15} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="input-group" style={{ margin: 0 }}><label className="label">Full Name *</label><input className="input" placeholder="Rahul Sharma" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="input-group" style={{ margin: 0 }}><label className="label">Phone *</label><input className="input" type="tel" placeholder="10-digit" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
            <div className="input-group" style={{ margin: 0 }}><label className="label">Shop Name</label><input className="input" placeholder="Sri Krishna Stores" value={form.shopName} onChange={e => setForm(p => ({ ...p, shopName: e.target.value }))} /></div>
            <div className="input-group" style={{ margin: 0 }}><label className="label">Area</label><input className="input" placeholder="Jayanagar" value={form.area} onChange={e => setForm(p => ({ ...p, area: e.target.value }))} /></div>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }} onClick={save}><Check size={14} /> Save Customer</button>
        </div>
      )}

      {/* ✅ Main card fills space — search only, no + button inline */}
      <div className="card" style={{ marginBottom: 0 }}>
        <div style={{ marginBottom: '12px' }}>
          <div className="search-wrapper" style={{ marginBottom: 0 }}>
            <Search className="search-icon" size={16} />
            <input className="input search-input" type="text" placeholder="Search by name, phone, area..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={<Users size={30} color="var(--text-muted)" />} title={search ? "No results" : "No customers yet"} subtitle={search ? `No match for "${search}"` : "Tap + to add your first customer"} action={!search ? "+ Add Customer" : null} onAction={() => setAdding(true)} />
        ) : (
          <div>
            {filtered.map(c => (
              <SwipeToDelete key={c.id} onDelete={() => remove(c.id)}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '10px 4px', borderBottom: '1px solid var(--border-subtle)', gap: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, var(--primary-light), var(--primary))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.95rem' }}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{c.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.phone}{c.area ? ` · ${c.area}` : ""}</div>
                    {c.shopName && <div style={{ fontSize: '0.7rem', color: 'var(--text-hint)' }}>{c.shopName}</div>}
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

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Column header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 14px', background: 'var(--surface-alt)', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ width: '28px', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>#</div>
          <div style={{ flex: 1, fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product</div>
          <div style={{ width: '80px', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Weight</div>
          <div style={{ width: '90px', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Price</div>
        </div>
        {products[tab].length === 0 ? (
          <EmptyState icon={<Package size={30} color="var(--text-muted)" />} title="No products" subtitle="Tap Add to get started" action="+ Add Product" onAction={() => setAdding(true)} />
        ) : (
          products[tab].map((p, i) => (
            <SwipeToDelete key={p.id} onDelete={() => { setProducts(prev => { const n = { ...prev }; n[tab] = n[tab].filter(prod => prod.id !== p.id); return n; }); notify("Product deleted"); }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '11px 14px', borderBottom: i !== products[tab].length - 1 ? '1px solid var(--border-subtle)' : 'none', background: 'var(--surface)' }}>
                {/* # */}
                <div style={{ width: '28px', fontSize: '0.78rem', color: 'var(--text-hint)', fontWeight: 600 }}>#{i + 1}</div>
                {/* Name */}
                <div style={{ flex: 1, paddingRight: '8px' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.3 }}>{p.name}</div>
                </div>
                {/* Weight */}
                <div style={{ width: '80px', display: 'flex', justifyContent: 'center' }}>
                  <span style={{ background: 'var(--surface-alt)', padding: '3px 8px', borderRadius: '10px', fontSize: '0.75rem', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)', whiteSpace: 'nowrap' }}>{p.weight}</span>
                </div>
                {/* Price — editable, centered */}
                <div style={{ width: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                  <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.85rem' }}>Rs.</span>
                  <input
                    className="input"
                    type="number"
                    style={{ width: '52px', textAlign: 'center', fontWeight: 800, color: 'var(--primary)', fontSize: '0.92rem', padding: '4px 4px', border: '1.5px solid var(--border-color)', borderRadius: '8px' }}
                    value={p.price}
                    onChange={e => { const val = Number(e.target.value); if (!isNaN(val) && val >= 0) setProducts(prev => { const n = { ...prev }; n[tab] = n[tab].map(prod => prod.id === p.id ? { ...prod, price: val } : prod); return n; }); }}
                  />
                </div>
              </div>
            </SwipeToDelete>
          ))
        )}
      </div>
    </div>
  );
}

function InventoryScreen({ inventory, setInventory, notify, products }) {
  const [tab, setTab] = useState("flour");
  const [editing, setEditing] = useState({});
  const update = (id, val) => { const n = parseInt(val); if (!isNaN(n) && n >= 0) { setInventory(prev => ({ ...prev, [id]: n })); notify("Stock updated"); } };
  const { onTouchStart, onTouchMove, onTouchEnd, refreshing } = usePullToRefresh(async () => { await new Promise(r => setTimeout(r, 600)); notify("Refreshed"); });

  return (
    <div className="animate-fade-in" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <PullIndicator refreshing={refreshing} />
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

// ✅ Profile now includes Store Info as a sub-tab
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
