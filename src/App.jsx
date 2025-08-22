// src/SalonRetailCalculator.jsx
import { useEffect, useMemo, useState } from "react";

// ⬇️ Paste your full data URL between the quotes below.
const LOGO =
  "PASTE_YOUR_DATA_URL_HERE";

const CATALOG = {
  "REF Stockholm": [
    {
      id: "ref-gift-set",
      name: "REF Gift Set",
      cost: 27.10,
      rrp: 49.99,
    },
  ],
  "MY.ORGANICS": [
    {
      id: "myorg-retail-shampoo",
      name: "MY.ORGANICS RETAIL SHAMPOO",
      cost: 10.45,
      rrp: 20.99,
    },
  ],
};

const currency = (n) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(
    isFinite(n) ? n : 0
  );

export default function SalonRetailCalculator() {
  // Defaults to REF Gift Set selected & values prefilled
  const [brand, setBrand] = useState("REF Stockholm");
  const [productId, setProductId] = useState("ref-gift-set");
  const [productName, setProductName] = useState("REF Gift Set");
  const [cost, setCost] = useState(27.1);
  const [rrp, setRrp] = useState(49.99);

  // Salon info
  const [days, setDays] = useState(5);
  const [stylists, setStylists] = useState(1);
  const [unitsPerStylistPerDay, setUnitsPerStylistPerDay] = useState(1);

  // Calculation result
  const [results, setResults] = useState(null);

  // Products for current brand
  const products = useMemo(() => CATALOG[brand] ?? [], [brand]);

  // Keep product in sync when brand changes
  useEffect(() => {
    if (!products.length) return;
    const first = products[0];
    setProductId(first.id);
    setProductName(first.name);
    setCost(first.cost);
    setRrp(first.rrp);
    setResults(null);
  }, [brand]); // eslint-disable-line react-hooks/exhaustive-deps

  // When product changes, load its pricing
  useEffect(() => {
    const p = products.find((x) => x.id === productId);
    if (p) {
      setProductName(p.name);
      setCost(p.cost);
      setRrp(p.rrp);
      setResults(null);
    }
  }, [productId, products]);

  const perUnitProfit = useMemo(() => rrp - cost, [rrp, cost]);

  const handleCalculate = () => {
    const perDayPerStylist = Number(unitsPerStylistPerDay) || 0;
    const stylistCount = Number(stylists) || 0;
    const promoDays = Number(days) || 0;

    const totalUnits = perDayPerStylist * stylistCount * promoDays;
    const totalCost = totalUnits * (Number(cost) || 0);
    const revenue = totalUnits * (Number(rrp) || 0);
    const profit = revenue - totalCost;

    setResults({
      perDayPerStylist,
      totalUnits,
      totalCost,
      revenue,
      profit,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-10">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          {LOGO ? (
            <img
              src={LOGO}
              alt="Logo"
              className="h-14 w-auto object-contain drop-shadow"
            />
          ) : (
            <div className="h-14 w-14 rounded-lg bg-slate-200" />
          )}
          <div>
            <h1 className="text-2xl font-bold">Salon Retail Profit Calculator</h1>
            <p className="text-sm text-slate-500">
              Estimate units, revenue & profit for your retail promotion.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Product & Pricing */}
          <div className="rounded-2xl bg-white p-5 shadow">
            <h2 className="mb-4 text-lg font-semibold">Product & Pricing</h2>

            {/* Brand */}
            <label className="block text-sm font-medium">Brand</label>
            <select
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            >
              {Object.keys(CATALOG).map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            {/* Product */}
            <label className="mt-4 block text-sm font-medium">
              Product (by brand)
            </label>
            <select
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Read-only product name */}
            <label className="mt-4 block text-sm font-medium">
              Product name
            </label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2"
              value={productName}
              readOnly
            />

            {/* Cost / RRP */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Salon Cost</label>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                  type="number"
                  min="0"
                  step="0.01"
                  value={cost}
                  onChange={(e) => setCost(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Salon RRP</label>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                  type="number"
                  min="0"
                  step="0.01"
                  value={rrp}
                  onChange={(e) => setRrp(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Per-unit profit */}
            <div className="mt-3 text-sm text-slate-600">
              <span className="font-medium">Salon Profit (per unit): </span>
              <span>{currency(perUnitProfit)}</span>
            </div>
          </div>

          {/* Salon Information */}
          <div className="rounded-2xl bg-white p-5 shadow">
            <h2 className="mb-4 text-lg font-semibold">Salon Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">
                  How many days are you running this promotion?
                </label>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                  type="number"
                  min="0"
                  step="1"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  How many stylist do you have?
                </label>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                  type="number"
                  min="0"
                  step="1"
                  value={stylists}
                  onChange={(e) => setStylists(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  How many do you think each stylist can sell a day
                </label>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                  type="number"
                  min="0"
                  step="1"
                  value={unitsPerStylistPerDay}
                  onChange={(e) =>
                    setUnitsPerStylistPerDay(Number(e.target.value))
                  }
                />
              </div>
            </div>

            <button
              onClick={handleCalculate}
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              Calculate
            </button>
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {/* Outcome */}
            <div className="rounded-2xl bg-white p-5 shadow">
              <h3 className="mb-3 text-lg font-semibold">Outcome</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>your stylist will sell (per day)</span>
                  <span className="font-semibold">
                    {results.perDayPerStylist}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Your Stylist will sell (Time you are running the promotion)</span>
                  <span className="font-semibold">{results.totalUnits}</span>
                </div>
                <div className="flex justify-between">
                  <span>This will cost you -</span>
                  <span className="font-semibold">
                    {currency(results.totalCost)}
                  </span>
                </div>
              </div>
            </div>

            {/* Profit (green & eye-catching) */}
            <div className="rounded-2xl bg-emerald-50 p-5 shadow ring-1 ring-emerald-200">
              <h3 className="mb-4 text-lg font-semibold text-emerald-900">
                PROFIT
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-900/80">Revenue Generated</span>
                  <span className="font-semibold text-emerald-900">
                    {currency(results.revenue)}
                  </span>
                </div>
                <div className="h-px bg-emerald-200" />
                <div className="flex items-center justify-between">
                  <span className="text-emerald-900">PROFIT</span>
                  <span className="text-2xl font-extrabold text-emerald-700">
                    {currency(results.profit)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer tip */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Tip: change brand/product to auto-populate pricing, then hit Calculate.
        </p>
      </div>
    </div>
  );
}
