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
