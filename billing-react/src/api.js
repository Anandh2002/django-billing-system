const BASE = 'http://localhost:8000/api';

export const api = {
  // Products
  getProducts:    ()         => fetch(`${BASE}/products/`).then(r => r.json()),
  getProduct:     (id)       => fetch(`${BASE}/products/${id}/`).then(r => r.json()),
  createProduct:  (data)     => fetch(`${BASE}/products/`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) }).then(r => r.json()),
  updateProduct:  (id, data) => fetch(`${BASE}/products/${id}/`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) }).then(r => r.json()),
  deleteProduct:  (id)       => fetch(`${BASE}/products/${id}/`, { method: 'DELETE' }),

  // Purchases
  getPurchases:   ()   => fetch(`${BASE}/purchases/`).then(r => r.json()),
  getPurchase:    (id) => fetch(`${BASE}/purchases/${id}/`).then(r => r.json()),

  // Generate bill
  generateBill: (data) => fetch(`${BASE}/generate-bill/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
};
