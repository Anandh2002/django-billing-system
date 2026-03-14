import { useState } from "react";
import BillingPage from "./pages/BillingPage";
import PurchaseHistory from "./pages/PurchaseHistory";
import Products from "./pages/Products";
import "./App.css";

export default function App() {
  const [page, setPage] = useState("billing");

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand">
          <span className="nav-logo">⬡</span>
          <span className="nav-title">BillFlow</span>
        </div>
        <div className="nav-links">
          {[
            { id: "billing", label: "New Bill" },
            { id: "history", label: "History" },
            { id: "products", label: "Products" },
          ].map((item) => (
            <button
              key={item.id}
              className={`nav-btn ${page === item.id ? "active" : ""}`}
              onClick={() => setPage(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>
      <main className="main-content">
        {page === "billing"  && <BillingPage />}
        {page === "history"  && <PurchaseHistory />}
        {page === "products" && <Products />}
      </main>
    </div>
  );
}
