import { useMemo, useState } from "react";
import { LOGO } from "./logo";

// --- Product catalogue (by brand) ---
const CATALOG = {
  "REF Stockholm": [
    // If you have default prices for this, add them like the MY.ORGANICS example below
    { id: "ref-gift-set", name: "REF Gift Set" },
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

export default function App() {
  // Form state
  const [brand, setBrand] = useState(BRANDS[0]);
  const [productId, setProductId] = useState(CATALOG[BRANDS[0]][0]?.id ?? "");
  const selectedProduct = useMemo(
    () => CATALOG[brand].find((p) => p.id === productId) ?? null,
    [brand, productId]
  );

  // Price state (autofills on product change if product has defaults)
  const [salonCost, setSalonCost] = useState(
    selectedProduct?.salonCost ?? ""
  );
  const [salonRrp, setSalonRrp] = useState(
    selectedProduct?.salonRrp ?? ""
  );

  // When brand changes, reset to first product and re-apply defaults
  const handleBrandChange = (e) => {
    const nextBrand = e.target.value;
    setBrand(nextBrand);
    const first = CATALOG[nextBrand][0] ?? null;
    setProductId(first?.id ?? "");
    if (first?.salonCost != null) setSalonCost(first.salonCost);
    else setSalonCost("");
    if (first?.salonRrp != null) setSalonRrp(first.salonRrp);
    else setSalonRrp("");
  };

  // When product changes, (re)apply defaults if present
  const handleProductChange = (e) => {
    const nextId = e.target.value;
    setProductId(nextId);
    const p = CATALOG[brand].find((x) => x.id === nextId);
    if (p?.salonCost != null) setSalonCost(p.salonCost);
    else setSalonCost("");
    if (p?.salonRrp != null) setSalonRrp(p.salonRrp);
    else setSalonRrp("");
  };

  // Derived calcs
  const numericCost = parseFloat(salonCost) || 0;
  const numericRrp = parseFloat(salonRrp) || 0;
  const profit = Math.max(numericRrp - numericCost, 0);
  const marginPct = numericRrp > 0 ? (profit / numericRrp) * 100 : 0;
  const markupPct = numericCost > 0 ? (profit / numericCost) * 100 : 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fafafa",
        color: "#111",
        fontFamily:
          "-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif",
        padding: "16px",
      }}
    >
      {/* Header with hard-coded logo */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 24,
          borderBottom: "1px solid #eee",
          paddingBottom: 16,
        }}
      >
        <img
          src={LOGO}
          alt="Salon Brands Pro"
          style={{ height: 48, width: "auto", display: "block" }}
        />
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
          Salon Retail Calculator
        </h1>
      </header>

      {/* Main content (single column; upload panel removed) */}
      <main
        style={{
          maxWidth: 900,
          margin: "0 auto",
          display: "grid",
          gap: 16,
        }}
      >
        {/* Product by brand (no custom option) */}
        <section
          style={{
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: 16 }}>Product (by brand)</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <div>
              <label
                style={{ display: "block", fontSize: 13, marginBottom: 6 }}
              >
                Brand
              </label>
              <select
                value={brand}
                onChange={handleBrandChange}
                style={selectStyle}
              >
                {BRANDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{ display: "block", fontSize: 13, marginBottom: 6 }}
              >
                Product
              </label>
              <select
                value={productId}
                onChange={handleProductChange}
                style={selectStyle}
              >
                {CATALOG[brand].map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label
                style={{ display: "block", fontSize: 13, marginBottom: 6 }}
              >
                Product name (read-only)
              </label>
              <input
                type="text"
                value={selectedProduct?.name ?? ""}
                readOnly
                style={{ ...inputStyle, background: "#f6f6f6" }}
              />
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section
          style={{
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: 16 }}>Pricing</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <div>
              <label
                style={{ display: "block", fontSize: 13, marginBottom: 6 }}
              >
                Salon cost (£)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={salonCost}
                onChange={(e) => setSalonCost(e.target.value)}
                placeholder="e.g. 10.45"
                style={inputStyle}
              />
            </div>
            <div>
              <label
                style={{ display: "block", fontSize: 13, marginBottom: 6 }}
              >
                Salon RRP (£)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={salonRrp}
                onChange={(e) => setSalonRrp(e.target.value)}
                placeholder="e.g. 20.99"
                style={inputStyle}
              />
            </div>
          </div>
        </section>

        {/* Results */}
        <section
          style={{
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: 16 }}>Results</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
            }}
          >
            <Stat label="Profit (£)" value={fmt(profit)} />
            <Stat label="Margin (%)" value={fmt(marginPct)} />
            <Stat label="Markup (%)" value={fmt(markupPct)} />
          </div>
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div
      style={{
        border: "1px dashed #ddd",
        borderRadius: 10,
        padding: 12,
        background: "#fcfcfc",
      }}
    >
      <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 14,
  outline: "none",
};

const selectStyle = {
  ...inputStyle,
  background: "#fff",
};

function fmt(n) {
  // for money/percent display
  const isNum = Number.isFinite(n);
  if (!isNum) return "—";
  // show 2 decimals for money, 1 for %
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

