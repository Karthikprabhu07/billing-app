
function BillingScreen({ customers, inventory, setInventory, bills, setBills, notify, billerName, products }) {
  const [selCustomer, setSelCustomer] = useState(null);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState({});
  const [viewBill, setViewBill] = useState(null);
  const [tab, setTab] = useState("flour");

  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));
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
    const bill = { id: genId(), billNo: `KC-${Date.now().toString().slice(-6)}`, date: today(), customer: selCustomer, items: cartItems, subtotal, tax, total, biller: billerName };
    setBills(prev => [bill, ...prev]); setViewBill(bill); setCart({}); setSelCustomer(null);
    notify("Bill generated successfully!");
  };

  if (viewBill) return <BillView bill={viewBill} onClose={() => setViewBill(null)} />;

  const PTABS = [{ key: "flour", icon: <Wheat size={14} />, label: "Flour" }, { key: "rava", icon: <Cookie size={14} />, label: "Rava" }, { key: "packing", icon: <Package size={14} />, label: "Packing" }];

  return (
    <div>
      <div className="section-header" style={{ marginBottom: '12px' }}><h2 className="section-title">New Billing Session</h2></div>

      <div className="card">
        <div className="card-title"><Users size={14} /> Customer Details</div>
        <div className="search-wrapper">
          <Search className="search-icon" size={16} />
          <input className="input search-input" placeholder="Search or enter customer name..." value={search} type="text" onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && handleInstantCustomer()} />
        </div>
        {search && !selCustomer && (
          <div className="dropdown-menu" style={{ position: 'relative', marginTop: '4px' }}>
            {filtered.length === 0 ? (
              <div className="dropdown-item" onClick={handleInstantCustomer}><div style={{ fontWeight: 600, color: 'var(--primary)' }}>Instant Bill for "{search}"</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Click or press Enter</div></div>
            ) : filtered.map(c => (
              <div key={c.id} className="dropdown-item" onClick={() => { setSelCustomer(c); setSearch(""); }}>
                <div style={{ fontWeight: 600 }}>{c.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.phone}{c.area ? ` · ${c.area}` : ""}</div>
              </div>
            ))}
          </div>
        )}
        {selCustomer && (
          <div className="selected-badge">
            <div><div style={{ fontWeight: 600 }}>{selCustomer.name}</div>{!selCustomer.instant && <div style={{ fontSize: '0.78rem', opacity: 0.8 }}>{selCustomer.phone}</div>}</div>
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

      {bills.length > 0 && (
        <div className="card">
          <div className="card-title" style={{ fontSize: '0.88rem' }}>Recent Invoices</div>
          {bills.slice(0, 3).map(b => (
            <SwipeToDelete key={b.id} onDelete={() => { setBills(prev => prev.filter(bill => bill.id !== b.id)); notify("Invoice deleted"); }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }} onClick={() => setViewBill(b)}>
                <div><div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{b.customer.name}</div><div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{b.billNo}</div></div>
                <div style={{ textAlign: 'right' }}><div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.88rem' }}>{fmt(b.total)}</div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{b.date}</div></div>
              </div>
            </SwipeToDelete>
          ))}
        </div>
      )}
    </div>
  );
}

function BillView({ bill, onClose }) {
  const billRef = useRef(null);

  const handlePrint = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const content = billRef.current.innerHTML;
        const html = `<html><head><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:monospace;padding:8px;color:#000;background:#fff;font-size:12px}table{width:100%;border-collapse:collapse}th{background:#f5f5f5;border-bottom:1px solid #ccc;padding:5px 4px;text-align:left;font-size:11px}td{padding:4px;font-size:11px}hr{border:none;border-top:1px dashed #ccc;margin:8px 0}</style></head><body>${content}</body></html>`;
        await CapacitorPrinter.printHtml({ html, name: `Invoice-${bill.billNo}` });
      } catch (err) { console.error("Print Error:", err); }
    } else { window.print(); }
  };

  const handleShareImage = async () => {
    if (!billRef.current) return;
    try {
      const canvas = await html2canvas(billRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      if (Capacitor.isNativePlatform()) {
        const base64Data = canvas.toDataURL('image/png').split(',')[1];
        const result = await Filesystem.writeFile({ path: `Invoice-${bill.billNo}.png`, data: base64Data, directory: Directory.Cache });
        await Share.share({ title: `Invoice ${bill.billNo}`, dialogTitle: 'Share Invoice', url: result.uri });
      } else {
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], `Invoice-${bill.billNo}.png`, { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ title: `Invoice ${bill.billNo}`, files: [file] }); } catch (e) { console.error(e); } }
          else { const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `Invoice-${bill.billNo}.png`; link.click(); }
        }, 'image/png');
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{ maxWidth: '104mm', margin: '0 auto' }} className="animate-pop-in">
      {/* ✅ Buttons — stacked cleanly */}
      <div className="no-print" style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>← Back</button>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={handlePrint}><Printer size={14} /> Print</button>
      </div>
      <div className="no-print" style={{ marginBottom: '14px' }}>
        <button className="btn" style={{ width: '100%', background: '#10b981', color: '#fff', border: 'none' }} onClick={handleShareImage}>
          <Share2 size={14} /> Share as Image
        </button>
      </div>

      {/* ✅ Invoice — hardcoded white/black, never inherits dark mode */}
      <div ref={billRef} style={{ background: '#ffffff', color: '#000000', padding: '12px', fontFamily: 'monospace', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <div style={{ textAlign: 'center', paddingBottom: '10px', borderBottom: '1px dashed #ccc', marginBottom: '10px' }}>
          <div style={{ fontSize: '1.05rem', fontWeight: 900, textTransform: 'uppercase', color: '#000', letterSpacing: '0.05em' }}>{STORE_INFO.name}</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#444', marginTop: '3px' }}>{STORE_INFO.tagline}</div>
          <div style={{ fontSize: '0.7rem', color: '#555', marginTop: '5px', lineHeight: 1.5 }}>{STORE_INFO.address}</div>
          <div style={{ fontSize: '0.7rem', color: '#555', marginTop: '3px' }}>Ph: {STORE_INFO.phone}</div>
          <div style={{ fontSize: '0.7rem', color: '#555' }}>GSTIN: {STORE_INFO.gstin}</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#000', marginBottom: '10px' }}>
          <div><div>Date: {bill.date}</div><div>Biller: {bill.biller}</div></div>
          <div style={{ textAlign: 'right' }}><div>Inv: {bill.billNo}</div></div>
        </div>

        <div style={{ borderTop: '1px dashed #ccc', paddingTop: '8px', marginBottom: '10px', fontSize: '0.75rem', color: '#000' }}>
          <div><strong>To:</strong> {bill.customer.name}</div>
          {bill.customer.shopName && <div><strong>Shop:</strong> {bill.customer.shopName}</div>}
          {bill.customer.area && <div><strong>Area:</strong> {bill.customer.area}</div>}
          {bill.customer.phone && bill.customer.phone !== 'N/A' && <div><strong>Ph:</strong> {bill.customer.phone}</div>}
        </div>

        {/* ✅ Table — explicit colors, never inherits dark */}
        <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse', marginBottom: '10px' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '5px 3px', width: '44%', background: '#f5f5f5', color: '#000', borderBottom: '1px solid #ccc', fontFamily: 'monospace' }}>ITEM</th>
              <th style={{ textAlign: 'center', padding: '5px 3px', width: '14%', background: '#f5f5f5', color: '#000', borderBottom: '1px solid #ccc', fontFamily: 'monospace' }}>QTY</th>
              <th style={{ textAlign: 'right', padding: '5px 3px', width: '21%', background: '#f5f5f5', color: '#000', borderBottom: '1px solid #ccc', fontFamily: 'monospace' }}>RATE</th>
              <th style={{ textAlign: 'right', padding: '5px 3px', width: '21%', background: '#f5f5f5', color: '#000', borderBottom: '1px solid #ccc', fontFamily: 'monospace' }}>AMT</th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((i, idx) => (
              <tr key={idx} style={{ borderBottom: '0.5px solid #eee' }}>
                <td style={{ padding: '5px 3px', color: '#000', fontFamily: 'monospace' }}>{i.name} <span style={{ color: '#666' }}>({i.weight})</span></td>
                <td style={{ textAlign: 'center', padding: '5px 3px', color: '#000', fontFamily: 'monospace' }}>{i.qty}</td>
                <td style={{ textAlign: 'right', padding: '5px 3px', color: '#000', fontFamily: 'monospace' }}>{i.price.toFixed(0)}</td>
                <td style={{ textAlign: 'right', padding: '5px 3px', fontWeight: 600, color: '#000', fontFamily: 'monospace' }}>{(i.price * i.qty).toFixed(0)}</td>
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

        <div style={{ textAlign: 'center', fontSize: '0.7rem', marginTop: '14px', color: '#555' }}>
          <div style={{ fontWeight: 600 }}>Thank you for your business!</div>
        </div>
      </div>
    </div>
  );
}
