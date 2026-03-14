import { useState, useEffect } from "react";
import { api } from "../api";

export default function PurchaseHistory() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);

  useEffect(() => {
    api.getPurchases()
      .then(setPurchases)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const viewDetail = async (id) => {
    const data = await api.getPurchase(id);
    setSelected(data);
  };

  if (loading) return (
    <div className="loading">
      <div className="spinner"></div>
      Loading purchases...
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Purchase History</h1>
        <p className="page-subtitle">{purchases.length} total purchases</p>
      </div>

      {purchases.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🧾</div>
          <p>No purchases yet</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Net Price</th>
                  <th>Cash Paid</th>
                  <th>Balance</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {purchases.map(p => (
                  <tr key={p.id}>
                    <td><span className="badge badge-blue">#{p.id}</span></td>
                    <td>{p.customer_email}</td>
                    <td>₹{p.rounded_net_price}</td>
                    <td>₹{p.cash_paid}</td>
                    <td><span className="badge badge-green">₹{p.balance}</span></td>
                    <td className="text-muted">{new Date(p.created_at).toLocaleDateString('en-IN')}</td>
                    <td>
                      <button className="btn btn-ghost" style={{padding:'6px 14px', fontSize:'13px'}}
                        onClick={() => viewDetail(p.id)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Bill #{selected.id}</div>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>

            <p className="text-muted mb-1">{selected.customer_email}</p>
            <hr className="divider" />

            <div className="card-title"><span className="dot"></span>Items</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Tax %</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.items.map(item => (
                    <tr key={item.id}>
                      <td>{item.product_name}</td>
                      <td>{item.quantity}</td>
                      <td>₹{item.unit_price}</td>
                      <td>{item.tax_percentage}%</td>
                      <td>₹{item.line_total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <hr className="divider" />
            <div className="stat-row"><span className="stat-label">Total (before tax)</span><span className="stat-value">₹{selected.total_without_tax}</span></div>
            <div className="stat-row"><span className="stat-label">Total Tax</span><span className="stat-value">₹{selected.total_tax}</span></div>
            <div className="stat-row"><span className="stat-label">Net Price</span><span className="stat-value">₹{selected.net_price}</span></div>
            <div className="stat-row"><span className="stat-label">Rounded Net</span><span className="stat-value">₹{selected.rounded_net_price}</span></div>
            <div className="stat-row"><span className="stat-label">Cash Paid</span><span className="stat-value">₹{selected.cash_paid}</span></div>
            <div className="stat-row"><span className="stat-label">Balance</span><span className="stat-value accent">₹{selected.balance}</span></div>

            {selected.denom_returned && Object.keys(selected.denom_returned).length > 0 && (
              <>
                <hr className="divider" />
                <div className="card-title"><span className="dot" style={{background:'var(--accent2)'}}></span>Change given</div>
                {Object.entries(selected.denom_returned).map(([d, c]) => (
                  <div className="stat-row" key={d}>
                    <span className="stat-label">₹{d}</span>
                    <span className="stat-value">× {c}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
