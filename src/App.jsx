// src/App.jsx
import { useEffect, useMemo, useState } from "react";
import { LOGO } from "./logo";

const CATALOG = {
  "REF Stockholm": [
    { id: "ref-gift-set", name: "REF Gift Set" }, // (no preset pricing)
  ],
  "MY.ORGANICS": [
    {
      id: "myorg-retail-shampoo",
      name: "MY.ORGANICS RETAIL SHAMPOO",
      salonCost: 10.45,
      salonRrp: 20.99,
    },
  ],
};

const BRANDS = Object.keys(CATALOG);

function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {}
  }, [key, val]);
  return [val, setVal];
}

export default function App() {
  /* ------------------------ Product selection & pricing ------------------------ */
  const [brand, setBrand] = useLocalStorage("brand", BRANDS[0]);
  const products = useMemo(() => CATALOG[brand] || [], [brand]);
  const [productId, setProductId] = useLocalStorage(
    "productId",
    (CATALOG[brand] && CATALOG[brand][0]?.id) || ""
  );

  // Pricing (editable numbers, but product name is fixed via dropdown)
  const [salonCost, setSalonCost] = useLocalStorage("salonCost", 0);
  const [salonRrp, setSalonRrp] = useLocalStorage("salonRrp", 0);

  // When brand changes, reset product to that brand's first
  useEffect(() => {
    const first = CATALOG[brand]?.[0]?.id ?? "";
    setProductId(first);
  }, [brand, setProductId]);

  // When product changes, auto-fill cost/rrp if the catalog has presets
  useEffect(() => {
    const p = products.find((x) => x.id === productId);
    if (p) {
      if (typeof p.salonCost === "number") setSalonCost(p.salonCost);
      if (typeof p.salonRrp === "number") setSalonRrp(p.salonRrp);
    }
  }, [productId, products, setSalonCost, setSalonRrp]);

  /* --------------------------- Salon Info (calculator) -------------------------- */
  const [promoDays, setPromoDays] = useLocalStorage("promoDays", 7);
  const [stylists, setStylists] = useLocalStorage("stylists", 3);
  const [perStylistPerDay, setPerStylistPerDay] = useLocalStorage(
    "perStylistPerDay",
    2
  );

  const perDayTotal = Math.max(0, Number(stylists) || 0) * Math.max(0, Number(perStylistPerDay) || 0);
  const totalUnits = perDayTotal * Math.max(0, Number(promoDays) || 0);
  const totalCost = (Number(salonCost) || 0) * totalUnits;

  const selectedProduct = products.find((x) => x.id === productId);

  const money = (n) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 2,
    }).format(isFinite(n) ? n : 0);

  const num = (v, setter) => {
    const clean = v.replace(/[^0-9.]/g, "");
    setter(clean);
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <img src={LOGO} alt="Salon Brands Pro" style={styles.logo} />
        <h1 style={styles.title}>Salon Retail Calculator</h1>
      </header>

      {/* Product by Brand */}
      <section style={styles.card}>
        <h2 style={styles.h2}>Product (by brand)</h2>
        <div style={styles.row}>
          <label style={styles.label}>Brand</label>
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            style={styles.select}
          >
            {BRANDS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.row}>
          <label style={styles.label}>Product</label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            style={styles.select}
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.grid2}>
          <div style={styles.row}>
            <label style={styles.label}>Salon Cost (£)</label>
            <input
              type="number"
              step="0.01"
              value={salonCost}
              onChange={(e) => num(e.target.value, setSalonCost)}
              style={styles.input}
            />
          </div>
          <div style={styles.row}>
            <label style={styles.label}>Salon RRP (£)</label>
            <input
              type="number"
              step="0.01"
              value={salonRrp}
              onChange={(e) => num(e.target.value, setSalonRrp)}
              style={styles.input}
            />
          </div>
        </div>

        <p style={styles.note}>
          Product name is chosen from the list (not editable).{" "}
          {selectedProduct ? (
            <em>Selected: {selectedProduct.name}</em>
          ) : (
            <em>Choose a product</em>
          )}
        </p>
      </section>

      {/* Salon Information calculator */}
      <section style={styles.card}>
        <h2 style={styles.h2}>Salon Information</h2>

        <div style={styles.grid3}>
          <div style={styles.row}>
            <label style={styles.label}>How many days are you running this promotion?</label>
            <input
              type="number"
              min="0"
              value={promoDays}
              onChange={(e) => num(e.target.value, setPromoDays)}
              style={styles.input}
            />
          </div>

          <div style={styles.row}>
            <label style={styles.label}>How many stylists do you have?</label>
            <input
              type="number"
              min="0"
              value={stylists}
              onChange={(e) => num(e.target.value, setStylists)}
              style={styles.input}
            />
          </div>

          <div style={styles.row}>
            <label style={styles.label}>How many do you think each stylist can sell a day?</label>
            <input
              type="number"
              min="0"
              step="1"
              value={perStylistPerDay}
              onChange={(e) => num(e.target.value, setPerStylistPerDay)}
              style={styles.input}
            />
          </div>
        </div>
      </section>

      {/* Outcome */}
      <section style={styles.card}>
        <h2 style={styles.h2}>Outcome</h2>

        <div style={styles.kpis}>
          <div style={styles.kpi}>
            <div style={styles.kpiLabel}>Your stylists will sell (per day)</div>
            <div style={styles.kpiValue}>{perDayTotal.toLocaleString()}</div>
          </div>

          <div style={styles.kpi}>
            <div style={styles.kpiLabel}>Your stylists will sell (promotion total)</div>
            <div style={styles.kpiValue}>{totalUnits.toLocaleString()}</div>
          </div>

          <div style={styles.kpi}>
            <div style={styles.kpiLabel}>This will cost you</div>
            <div style={styles.kpiValue}>{money(totalCost)}</div>
          </div>
        </div>
        <p style={styles.noteSmall}>
          Cost is calculated as <code>total units × salon cost</code>.
        </p>
      </section>

      <footer style={styles.footer}>
        <small>© {new Date().getFullYear()} Salon Brands Pro</small>
      </footer>
    </div>
  );
}

/* --------------------------------- Styles -------------------------------- */
const styles = {
  app: {
    maxWidth: 980,
    margin: "24px auto",
    padding: 16,
    fontFamily:
      "-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif",
    color: "#0f172a",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 12,
  },
  logo: { height: 44, width: "auto" },
  title: { fontSize: 22, margin: 0, fontWeight: 700 },
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },
  h2: { margin: "0 0 12px", fontSize: 18 },
  row: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, color: "#475569" },
  input: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    fontSize: 14,
  },
  select: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    fontSize: 14,
    background: "#fff",
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginTop: 8,
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 12,
  },
  kpis: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 12,
    marginTop: 8,
  },
  kpi: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: 14,
  },
  kpiLabel: { fontSize: 12, color: "#64748b" },
  kpiValue: { fontSize: 22, fontWeight: 700, marginTop: 4 },
  note: { marginTop: 8, color: "#64748b", fontSize: 13 },
  noteSmall: { marginTop: 8, color: "#64748b", fontSize: 12 },
  footer: { textAlign: "center", marginTop: 24, color: "#64748b" },
};
