import { useState, useEffect } from "react";
import { api } from "../api";

const empty = { product_id: "", name: "", available_stocks: "", price: "", tax_percentage: "" };

export default function Products() {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(null); // null | 'add' | 'edit'
  const [form, setForm]           = useState(empty);
  const [editId, setEditId]       = useState(null);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");

  const load = () => {
    setLoading(true);
    api.getProducts()
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(empty); setEditId(null); setError(""); setModal("add"); };

  const openEdit = (p) => {
    setForm({
      product_id:       p.product_id,
      name:             p.name,
      available_stocks: p.available_stocks,
      price:            p.price,
      tax_percentage:   p.tax_percentage,
    });
    setEditId(p.id);
    setError("");
    setModal("edit");
  };

  const handleSave = async () => {
    setError("");
    if (!form.product_id || !form.name || !form.price) return setError("Product ID, Name and Price are required");
    setSaving(true);
    try {
      const data = {
        product_id:       form.product_id,
        name:             form.name,
        available_stocks: parseInt(form.available_stocks) || 0,
        price:            parseFloat(form.price),
        tax_percentage:   parseFloat(form.tax_percentage) || 0,
      };
      if (modal === "add") {
        await api.createProduct(data);
      } else {
        await api.updateProduct(editId, data);
      }
      setModal(null);
      load();
    } catch (e) {
      setError("Failed to save. Check backend.");
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await api.deleteProduct(id);
    load();
  };

  if (loading) return (
    <div className="loading">
      <div className="spinner"></div>
      Loading products...
    </div>
  );

  return (
    <div>
      <div className="flex-between page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{products.length} products in inventory</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Product</button>
      </div>

      {products.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📦</div>
          <p>No products yet</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product ID</th>
                  <th>Name</th>
                  <th>Stock</th>
                  <th>Price</th>
                  <th>Tax %</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td><span className="badge badge-blue">{p.product_id}</span></td>
                    <td>{p.name}</td>
                    <td>
                      <span className={`badge ${p.available_stocks > 10 ? 'badge-green' : 'badge-red'}`}>
                        {p.available_stocks}
                      </span>
                    </td>
                    <td>₹{p.price}</td>
                    <td>{p.tax_percentage}%</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-ghost" style={{padding:'6px 12px', fontSize:'13px'}}
                          onClick={() => openEdit(p)}>Edit</button>
                        <button className="btn btn-danger" style={{padding:'6px 12px', fontSize:'13px'}}
                          onClick={() => handleDelete(p.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{modal === "add" ? "Add Product" : "Edit Product"}</div>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="grid-2">
              <div className="form-group">
                <label>Product ID</label>
                <input placeholder="P011" value={form.product_id}
                  onChange={e => setForm({...form, product_id: e.target.value})}
                  disabled={modal === "edit"} />
              </div>
              <div className="form-group">
                <label>Name</label>
                <input placeholder="Product name" value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Price (₹)</label>
                <input type="number" placeholder="0.00" value={form.price}
                  onChange={e => setForm({...form, price: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Tax %</label>
                <input type="number" placeholder="0" value={form.tax_percentage}
                  onChange={e => setForm({...form, tax_percentage: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Stock</label>
                <input type="number" placeholder="0" value={form.available_stocks}
                  onChange={e => setForm({...form, available_stocks: e.target.value})} />
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button className="btn btn-success" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : modal === "add" ? "Add Product" : "Save Changes"}
              </button>
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
