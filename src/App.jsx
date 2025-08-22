import React, { useEffect, useMemo, useState } from "react";

// Brand logo data URL. To hard-code your logo, paste a full data URL below like:
// const LOGO = "data:image/png;base64,....";
// Leaving it empty enables the Upload button in the header.
const LOGO = "";

// ==== Utility functions ====
const gbp = (n) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(
    Number.isFinite(n) ? n : 0
  );

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

// Pure calculator for easy testing
export function computeTotals({ cost, rrp, days, stylists, unitsPerStylistPerDay }) {
  const d = Math.max(0, Number(days) || 0);
  const s = Math.max(0, Number(stylists) || 0);
  const u = Math.max(0, Number(unitsPerStylistPerDay) || 0);
  const c = Math.max(0, Number(cost) || 0);
  const r = Math.max(0, Number(rrp) || 0);

  const totalUnits = d * s * u;
  const totalCost = round2(totalUnits * c);
  const revenue = round2(totalUnits * r);
  const profitTotal = round2(revenue - totalCost);
  const unitProfit = round2(r - c);
  return { perDayPerStylist: u, totalUnits, totalCost, revenue, profitTotal, unitProfit };
}

export default function SalonRetailCalculator() {
  // Inputs
  const [productName, setProductName] = useState("REF Gift Set");
  const [cost, setCost] = useState(27.1); // Salon Cost per unit
  const [rrp, setRrp] = useState(49.99);  // Salon RRP per unit

  const [days, setDays] = useState(5);
  const [stylists, setStylists] = useState(1);
  const [unitsPerStylistPerDay, setUnitsPerStylistPerDay] = useState(1);

  // Logo state: uses embedded LOGO if provided or lets the user upload one
  const [logoDataUrl, setLogoDataUrl] = useState(LOGO && LOGO.startsWith("data:image") ? LOGO : null);

  const onLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || "");
      if (url.startsWith("data:image")) setLogoDataUrl(url);
    };
    reader.readAsDataURL(file);
  };

  // Results (populated when clicking Calculate)
  const [results, setResults] = useState(null);

  const unitProfit = useMemo(() => (Number(rrp) || 0) - (Number(cost) || 0), [rrp, cost]);

  const calculate = () => {
    const res = computeTotals({ cost, rrp, days, stylists, unitsPerStylistPerDay });
    setResults(res);
  };

  const reset = () => {
    setProductName("REF Gift Set");
    setCost(27.1);
    setRrp(49.99);
    setDays(5);
    setStylists(1);
    setUnitsPerStylistPerDay(1);
    setResults(null);
  };

  // --- Hidden smoke tests (console only; no UI) ---
  useEffect(() => {
    const tests = [
      {
        name: "Example from brief",
        input: { cost: 27.1, rrp: 49.99, days: 5, stylists: 1, unitsPerStylistPerDay: 1 },
        expected: { totalUnits: 5, revenue: 249.95, totalCost: 135.5, profitTotal: 114.45, unitProfit: 22.89 },
      },
      {
        name: "Zero stylists yields zero",
        input: { cost: 10, rrp: 20, days: 5, stylists: 0, unitsPerStylistPerDay: 3 },
        expected: { totalUnits: 0, revenue: 0, totalCost: 0, profitTotal: 0, unitProfit: 10 },
      },
      {
        name: "Negative inputs treated as 0",
        input: { cost: -5, rrp: 15, days: -2, stylists: 2, unitsPerStylistPerDay: 2 },
        expected: { totalUnits: 0, revenue: 0, totalCost: 0, profitTotal: 0, unitProfit: 20 },
      },
      {
        name: "RRP below cost → negative profit",
        input: { cost: 12, rrp: 10, days: 1, stylists: 1, unitsPerStylistPerDay: 1 },
        expected: { totalUnits: 1, revenue: 10.0, totalCost: 12.0, profitTotal: -2.0, unitProfit: -2.0 },
      },
      {
        name: "Rounding check small decimals",
        input: { cost: 0, rrp: 0.1, days: 1, stylists: 1, unitsPerStylistPerDay: 1 },
        expected: { totalUnits: 1, revenue: 0.1, totalCost: 0.0, profitTotal: 0.1, unitProfit: 0.1 },
      },
    ];

    const check = (a, b) => Math.abs(Number(a) - Number(b)) < 1e-9;

    tests.forEach((t) => {
      const r = computeTotals(t.input);
      const pass =
        r.totalUnits === t.expected.totalUnits &&
        check(r.revenue, t.expected.revenue) &&
        check(r.totalCost, t.expected.totalCost) &&
        check(r.profitTotal, t.expected.profitTotal) &&
        check(r.unitProfit, t.expected.unitProfit);
      // eslint-disable-next-line no-console
      console[pass ? "log" : "error"](
        `[Test] ${t.name}: ${pass ? "PASS" : "FAIL"}`,
        pass ? r : { got: r, expected: t.expected }
      );
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            {logoDataUrl ? (
              <img src={logoDataUrl} alt="Salon Brands Pro" className="h-10 md:h-12 w-auto" />
            ) : (
              <div className="mr-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-500">
                No logo yet
              </div>
            )}
            <h1 className="text-3xl font-semibold tracking-tight">Salon Retail Profit Calculator</h1>
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="logo-upload" className="cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm hover:bg-slate-50">
              Upload logo
            </label>
            <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={onLogoUpload} />
            <span className="text-sm text-slate-500">v1.3</span>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Product card */}
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-4 text-xl font-semibold">Product</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Product Name</label>
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 outline-none focus:ring-2 focus:ring-slate-800"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g., REF Gift Set"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Salon Cost (per unit)</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">£</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full rounded-xl border border-slate-300 bg-white p-3 pl-7 outline-none focus:ring-2 focus:ring-slate-800"
                      value={cost}
                      onChange={(e) => setCost(parseFloat(e.target.value))}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Salon RRP (per unit)</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">£</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full rounded-xl border border-slate-300 bg-white p-3 pl-7 outline-none focus:ring-2 focus:ring-slate-800"
                      value={rrp}
                      onChange={(e) => setRrp(parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-sm text-slate-600">Salon Profit (per unit)</div>
                <div className={`text-2xl font-semibold ${unitProfit < 0 ? "text-rose-600" : "text-slate-900"}`}>
                  {gbp(unitProfit)}
                </div>
                {unitProfit < 0 && (
                  <p className="mt-1 text-sm text-rose-600">Warning: RRP is below cost. Increase your RRP or lower cost.</p>
                )}
              </div>
            </div>
          </section>

          {/* Salon info card */}
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-4 text-xl font-semibold">Salon Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Promo Days</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full rounded-xl border border-slate-300 bg-white p-3 outline-none focus:ring-2 focus:ring-slate-800"
                    value={days}
                    onChange={(e) => setDays(parseInt(e.target.value || "0", 10))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Stylists</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full rounded-xl border border-slate-300 bg-white p-3 outline-none focus:ring-2 focus:ring-slate-800"
                    value={stylists}
                    onChange={(e) => setStylists(parseInt(e.target.value || "0", 10))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Units per stylist / day</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full rounded-xl border border-slate-300 bg-white p-3 outline-none focus:ring-2 focus:ring-slate-800"
                    value={unitsPerStylistPerDay}
                    onChange={(e) => setUnitsPerStylistPerDay(parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={calculate}
                  className="rounded-xl bg-slate-900 px-5 py-3 text-white shadow-sm transition active:scale-[0.98]"
                >
                  Calculate
                </button>
                <button
                  onClick={reset}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-slate-700 shadow-sm transition active:scale-[0.98]"
                >
                  Reset
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Results */}
        <section className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h3 className="mb-4 text-lg font-semibold">Outcome</h3>
            {results ? (
              <ul className="space-y-3">
                <li className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <span className="text-slate-600">Your stylist will sell (per day)</span>
                  <span className="text-lg font-semibold">{results.perDayPerStylist}</span>
                </li>
                <li className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <span className="text-slate-600">Your stylist will sell (time you are running the promotion)</span>
                  <span className="text-lg font-semibold">{results.totalUnits}</span>
                </li>
                <li className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <span className="text-slate-600">This will cost you</span>
                  <span className="text-lg font-semibold">{gbp(results.totalCost)}</span>
                </li>
              </ul>
            ) : (
              <p className="text-slate-500">Enter your details and click <span className="font-medium">Calculate</span> to see results.</p>
            )}
          </div>

          <div className="rounded-2xl bg-emerald-50 p-6 shadow-sm ring-1 ring-emerald-200">
            <h3 className="mb-4 text-lg font-semibold text-emerald-900">Profit</h3>
            {results && (
              <div className="mb-4 flex items-center justify-between rounded-xl bg-white p-4 ring-1 ring-emerald-200">
                <div>
                  <div className="text-xs uppercase tracking-wide text-emerald-700">Estimated Profit</div>
                  <div className="text-3xl font-extrabold text-emerald-900">{gbp(results.profitTotal)}</div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10 text-emerald-600">
                  <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-2.59a.75.75 0 0 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-2.25-2.25a.75.75 0 1 1 1.06-1.06l1.72 1.72 3.97-3.97Z" clipRule="evenodd" />
                </svg>
              </div>
            )}

            {results ? (
              <ul className="space-y-3">
                <li className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <span className="text-slate-600">Revenue Generated</span>
                  <span className="text-2xl font-bold text-emerald-900">{gbp(results.revenue)}</span>
                </li>
                <li className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <span className="text-slate-600">Profit</span>
                  <span className="text-3xl font-extrabold text-emerald-900">{gbp(results.profitTotal)}</span>
                </li>
              </ul>
            ) : (
              <p className="text-slate-500">Results will appear here after calculation.</p>
            )}

            {results && (
              <div className="mt-4 text-sm text-slate-500">
                <p>
                  Based on <span className="font-medium">{productName}</span> with unit cost {gbp(Number(cost))} and RRP {gbp(Number(rrp))}.
                </p>
              </div>
            )}
          </div>
        </section>

        <footer className="mt-8 text-center text-xs text-slate-400">
          <p>Tip: Multiply bigger targets by increasing stylists or units per day to forecast larger promos.</p>
        </footer>
      </div>
    </div>
  );
}
