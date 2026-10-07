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
