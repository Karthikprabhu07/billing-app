import sys

path = r'c:/Users/devil/.gemini/antigravity/scratch/karthik-billing-app/src/App.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

changes = [
    (
        '  const [activeTab, setActiveTab] = useState("billing");',
        '  const [activeTab, setActiveTab] = useState("billing");\n  const [products, setProducts] = useState(() => store.get("kc_products") || PRODUCTS);'
    ),
    (
        '  const [inventory, setInventory] = useState(() => store.get("kc_inventory") || initInventory());',
        '  const [inventory, setInventory] = useState(() => store.get("kc_inventory") || initInventory(store.get("kc_products") || PRODUCTS));'
    ),
    (
        '  useEffect(() => { store.set("kc_customers", customers); }, [customers]);',
        '  useEffect(() => { store.set("kc_customers", customers); }, [customers]);\n  useEffect(() => { store.set("kc_products", products); }, [products]);'
    ),
    (
        '  function initInventory() {\n    const inv = {};\n    Object.values(PRODUCTS).flat().forEach(p => { inv[p.id] = 50; });\n    return inv;\n  }',
        '  function initInventory(prods = products) {\n    const inv = {};\n    Object.values(prods).flat().forEach(p => { inv[p.id] = 50; });\n    return inv;\n  }'
    ),
    (
        '          {activeTab === "billing" && <BillingScreen customers={customers} inventory={inventory} setInventory={setInventory} bills={bills} setBills={setBills} notify={notify} billerName={profileName} />}\n          {activeTab === "customers" && <CustomersScreen customers={customers} setCustomers={setCustomers} notify={notify} />}\n          {activeTab === "products" && <ProductsScreen />}\n          {activeTab === "inventory" && <InventoryScreen inventory={inventory} setInventory={setInventory} notify={notify} />}',
        '          {activeTab === "billing" && <BillingScreen customers={customers} inventory={inventory} setInventory={setInventory} bills={bills} setBills={setBills} notify={notify} billerName={profileName} products={products} />}\n          {activeTab === "customers" && <CustomersScreen customers={customers} setCustomers={setCustomers} notify={notify} />}\n          {activeTab === "products" && <ProductsScreen products={products} setProducts={setProducts} notify={notify} />}\n          {activeTab === "inventory" && <InventoryScreen inventory={inventory} setInventory={setInventory} notify={notify} products={products} />}'
    ),
    (
        'function BillingScreen({ customers, inventory, setInventory, bills, setBills, notify, billerName }) {',
        'function BillingScreen({ customers, inventory, setInventory, bills, setBills, notify, billerName, products }) {'
    ),
    (
        '            {PRODUCTS[tab].map(p => {',
        '            {products[tab].map(p => {'
    ),
    (
        '<div style={{ fontSize: \'0.85rem\', color: \'var(--text-muted)\' }}>{c.phone} · {c.area}</div>',
        '<div style={{ fontSize: \'0.85rem\', color: \'var(--text-muted)\' }}>{c.phone} · {c.shopName ? c.shopName + \' - \' : \'\'}{c.area || \'\'}</div>'
    ),
    (
        '        <div style={{ fontSize: \'0.8rem\', marginBottom: \'10px\', borderBottom: \'1px dashed #000\', paddingBottom: \'10px\' }}>\n          <div><strong>To:</strong> {bill.customer.name}</div>\n          {bill.customer.phone && <div><strong>Ph:</strong> {bill.customer.phone}</div>}\n        </div>',
        '        <div style={{ fontSize: \'0.8rem\', marginBottom: \'10px\', borderBottom: \'1px dashed #000\', paddingBottom: \'10px\' }}>\n          <div><strong>To:</strong> {bill.customer.name}</div>\n          {bill.customer.shopName && <div><strong>Shop:</strong> {bill.customer.shopName}</div>}\n          {bill.customer.area && <div><strong>Area:</strong> {bill.customer.area}</div>}\n          {bill.customer.phone && <div><strong>Ph:</strong> {bill.customer.phone}</div>}\n        </div>'
    ),
    (
        '  const [form, setForm] = useState({ name: "", phone: "", area: "", address: "" });',
        '  const [form, setForm] = useState({ name: "", phone: "", shopName: "", area: "" });'
    ),
    (
        '    c.area.toLowerCase().includes(search.toLowerCase())',
        '    (c.area && c.area.toLowerCase().includes(search.toLowerCase())) ||\n    (c.shopName && c.shopName.toLowerCase().includes(search.toLowerCase()))'
    ),
    (
        '    setForm({ name: "", phone: "", area: "", address: "" });',
        '    setForm({ name: "", phone: "", shopName: "", area: "" });'
    ),
    (
        '            <div className="input-group">\n              <label className="label">Locality / Area</label>\n              <input className="input" placeholder="e.g. Jayanagar" value={form.area} onChange={e => setForm(p => ({ ...p, area: e.target.value }))} />\n            </div>\n            <div className="input-group">\n              <label className="label">Full Address</label>\n              <input className="input" placeholder="Complete door / street address" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />\n            </div>',
        '            <div className="input-group">\n              <label className="label">Shop Name</label>\n              <input className="input" placeholder="e.g. Sri Krishna Stores" value={form.shopName} onChange={e => setForm(p => ({ ...p, shopName: e.target.value }))} />\n            </div>\n            <div className="input-group">\n              <label className="label">Locality / Area</label>\n              <input className="input" placeholder="e.g. Jayanagar" value={form.area} onChange={e => setForm(p => ({ ...p, area: e.target.value }))} />\n            </div>'
    ),
    (
        '                <th>Area / Address</th>',
        '                <th>Shop & Area</th>'
    ),
    (
        '                    <td>\n                      <div>{c.area || "—"}</div>\n                      {c.address && <div style={{ fontSize: \'0.8rem\', color: \'var(--text-muted)\' }}>{c.address}</div>}\n                    </td>',
        '                    <td>\n                      <div style={{ fontWeight: 600 }}>{c.shopName || "—"}</div>\n                      <div style={{ fontSize: \'0.8rem\', color: \'var(--text-muted)\' }}>{c.area || "—"}</div>\n                    </td>'
    ),
    (
        'function ProductsScreen() {\n  const [tab, setTab] = useState("flour");',
        'function ProductsScreen({ products, setProducts, notify }) {\n  const [tab, setTab] = useState("flour");\n  const [adding, setAdding] = useState(false);\n  const [form, setForm] = useState({ name: "", weight: "", price: "" });\n\n  const addProduct = () => {\n    if (!form.name || !form.weight || !form.price) { notify("All fields required", "error"); return; }\n    const newProd = { id: genId(), name: form.name, weight: form.weight, price: Number(form.price) };\n    setProducts(prev => ({ ...prev, [tab]: [...prev[tab], newProd] }));\n    setForm({ name: "", weight: "", price: "" });\n    setAdding(false);\n    notify("Product added successfully!");\n  };'
    ),
    (
        '      <div className="section-header">\n        <h2 className="section-title">Product Master List</h2>\n      </div>',
        '      <div className="section-header">\n        <h2 className="section-title">Product Master List</h2>\n        <button className="btn btn-primary" onClick={() => setAdding(!adding)}>\n          {adding ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Add Product</>}\n        </button>\n      </div>\n      {adding && (\n        <div className="card animate-slide-down" style={{ borderLeft: \'4px solid var(--primary)\', marginBottom: \'24px\' }}>\n          <div className="card-title">New Product in {tab.toUpperCase()}</div>\n          <div className="grid-2-col" style={{ gap: \'16px\' }}>\n             <div className="input-group">\n               <label className="label">Product Name *</label>\n               <input className="input" placeholder="e.g. Ragi Fine" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />\n             </div>\n             <div className="input-group">\n               <label className="label">Weight / Unit *</label>\n               <input className="input" placeholder="e.g. 500 gms" value={form.weight} onChange={e => setForm(p => ({ ...p, weight: e.target.value }))} />\n             </div>\n             <div className="input-group">\n               <label className="label">Price (₹) *</label>\n               <input className="input" type="number" placeholder="e.g. 45" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />\n             </div>\n          </div>\n          <button className="btn btn-primary" style={{ marginTop: \'16px\' }} onClick={addProduct}><Check size={16} /> Save Product</button>\n        </div>\n      )}'
    ),
    (
        '              {PRODUCTS[tab].map((p, i) => (',
        '              {products[tab].map((p, i) => ('
    ),
    (
        '                  <td style={{ textAlign: \'right\', fontWeight: 800, color: \'var(--primary)\', fontSize: \'1.1rem\' }}>{fmt(p.price)}</td>',
        '                  <td style={{ textAlign: \'right\' }}>\n                    <div style={{ display: \'flex\', alignItems: \'center\', justifyContent: \'flex-end\', gap: \'4px\' }}>\n                      <span style={{ fontWeight: 800, color: \'var(--primary)\', fontSize: \'1.1rem\' }}>₹</span>\n                      <input\n                        className="input"\n                        type="number"\n                        style={{ width: \'60px\', textAlign: \'right\', fontWeight: 800, color: \'var(--primary)\', fontSize: \'1.1rem\', padding: \'4px\' }}\n                        value={p.price}\n                        onChange={e => {\n                          const val = Number(e.target.value);\n                          if (isNaN(val) || val < 0) return;\n                          setProducts(prev => {\n                            const n = { ...prev };\n                            n[tab] = n[tab].map(prod => prod.id === p.id ? { ...prod, price: val } : prod);\n                            return n;\n                          });\n                        }}\n                      />\n                    </div>\n                  </td>'
    ),
    (
        'function InventoryScreen({ inventory, setInventory, notify }) {',
        'function InventoryScreen({ inventory, setInventory, notify, products }) {'
    ),
    (
        '              {PRODUCTS[tab].map(p => {',
        '              {products[tab].map(p => {'
    )
]

for idx, (old, new_) in enumerate(changes):
    if old not in content:
        print(f"Could not find item {idx}: {old[:50]}...")
    else:
        content = content.replace(old, new_, 1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done.")
