import { useState, useEffect } from "react";
import { api } from "../api";

const DENOMS = [500, 50, 20, 10, 5, 2, 1];

export default function BillingPage() {
  const [email, setEmail]         = useState("");
  const [rows, setRows]           = useState([{ product_id: "", quantity: "" }]);
  const [denoms, setDenoms]       = useState({});
  const [cashPaid, setCashPaid]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [result, setResult]       = useState(null);
  const [products, setProducts]   = useState([]);

  useEffect(() => {
    api.getProducts().then(setProducts).catch(() => {});
  }, []);

  const addRow = () => setRows([...rows, { product_id: "", quantity: "" }]);

  const removeRow = (i) => setRows(rows.filter((_, idx) => idx !== i));

  const updateRow = (i, field, val) => {
    const updated = [...rows];
    updated[i][field] = val;
    setRows(updated);
  };

  const updateDenom = (d, val) => setDenoms({ ...denoms, [d]: val });

  const handleSubmit = async () => {
    setError("");
    setResult(null);
    if (!email) return setError("Customer email is required");
    if (rows.some(r => !r.product_id || !r.quantity)) return setError("Fill all product rows");

    setLoading(true);
    try {
      const data = {
        customer_email: email,
        products:       rows.map(r => ({ product_id: r.product_id, quantity: parseInt(r.quantity) })),
        denominations:  denoms,
        cash_paid:      parseFloat(cashPaid) || 0,
      };
      const res = await api.generateBill(data);
      if (res.errors) {
        setError(res.errors.join(", "));
      } else {
        setResult(res);
        setEmail(""); setRows([{ product_id: "", quantity: "" }]);
        setDenoms({}); setCashPaid("");
      }
    } catch (e) {
      setError("Something went wrong. Is the backend running?");
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">New Bill</h1>
        <p className="page-subtitle">Generate a bill and send invoice to customer</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {result && (
        <div className="bill-result section">
          <div className="bill-id">Bill #{result.id}</div>
          <p className="text-muted mb-1">Invoice sent to {result.customer_email}</p>
          <hr className="divider" />
          <div className="stat-row"><span className="stat-label">Total (before tax)</span><span className="stat-value">₹{result.total_without_tax}</span></div>
          <div className="stat-row"><span className="stat-label">Total Tax</span><span className="stat-value">₹{result.total_tax}</span></div>
          <div className="stat-row"><span className="stat-label">Net Price</span><span className="stat-value">₹{result.net_price}</span></div>
          <div className="stat-row"><span className="stat-label">Rounded Net</span><span className="stat-value">₹{result.rounded_net_price}</span></div>
          <div className="stat-row"><span className="stat-label">Cash Paid</span><span className="stat-value">₹{result.cash_paid}</span></div>
          <div className="stat-row"><span className="stat-label">Balance</span><span className="stat-value accent">₹{result.balance}</span></div>
          {result.denom_returned && Object.keys(result.denom_returned).length > 0 && (
            <>
              <hr className="divider" />
              <div className="card-title"><span className="dot" style={{background:'var(--accent2)'}}></span>Return denominations</div>
              {Object.entries(result.denom_returned).map(([d, c]) => (
                <div className="stat-row" key={d}>
                  <span className="stat-label">₹{d} note</span>
                  <span className="stat-value">× {c}</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      <div className="grid-2" style={{alignItems:'start', gap:'1.5rem'}}>

        {/* LEFT — Bill section */}
        <div>
          <div className="card section">
            <div className="card-title"><span className="dot"></span>Customer</div>
            <div className="form-group">
              <label>Email address</label>
              <input type="email" placeholder="customer@email.com"
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="card section">
            <div className="card-title"><span className="dot"></span>Products</div>
            {rows.map((row, i) => (
              <div className="product-row" key={i}>
                <div className="form-group" style={{margin:0}}>
                  {i === 0 && <label>Product ID</label>}
                  <input
                    placeholder="e.g. P001"
                    value={row.product_id}
                    onChange={e => updateRow(i, 'product_id', e.target.value)}
                    list={`products-list-${i}`}
                  />
                  <datalist id={`products-list-${i}`}>
                    {products.map(p => <option key={p.id} value={p.product_id}>{p.name}</option>)}
                  </datalist>
                </div>
                <div className="form-group" style={{margin:0}}>
                  {i === 0 && <label>Quantity</label>}
                  <input type="number" placeholder="Qty" min="1"
                    value={row.quantity}
                    onChange={e => updateRow(i, 'quantity', e.target.value)} />
                </div>
                <button className="btn btn-danger" style={{padding:'10px 12px'}}
                  onClick={() => removeRow(i)} disabled={rows.length === 1}>✕</button>
              </div>
            ))}
            <button className="btn btn-ghost mt-2" onClick={addRow}>+ Add product</button>
          </div>
        </div>

        {/* RIGHT — Denominations */}
        <div>
          <div className="card section">
            <div className="card-title"><span className="dot" style={{background:'var(--accent2)'}}></span>Denominations received</div>
            <div className="denom-grid">
              {DENOMS.map(d => (
                <div className="form-group" key={d} style={{margin:0}}>
                  <label>₹{d}</label>
                  <input type="number" placeholder="0" min="0"
                    value={denoms[d] || ""}
                    onChange={e => updateDenom(d, e.target.value)} />
                </div>
              ))}
            </div>
          </div>

          <div className="card section">
            <div className="card-title"><span className="dot" style={{background:'var(--warning)'}}></span>Cash paid</div>
            <div className="form-group">
              <label>Total amount (₹)</label>
              <input type="number" placeholder="0.00" min="0" step="0.01"
                value={cashPaid} onChange={e => setCashPaid(e.target.value)} />
            </div>
            <button className="btn btn-success" style={{width:'100%', justifyContent:'center', padding:'12px'}}
              onClick={handleSubmit} disabled={loading}>
              {loading ? "Generating..." : "Generate Bill"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
