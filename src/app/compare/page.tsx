'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { Product } from '@/types';
import {
  Layers,
  Trash2,
  Trophy,
  ExternalLink,
  Plus,
  ArrowRight,
  Sparkles,
  Check,
  X,
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

const CHART_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899'];

export default function ComparePage() {
  const { compareList, removeFromCompare, clearCompare, products, toggleCompare } = useStore();
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  const handleAddProduct = () => {
    if (!selectedProductId) return;
    const found = products.find((p) => p.id === selectedProductId);
    if (found) {
      toggleCompare(found);
      setSelectedProductId('');
    }
  };

  // Available products not yet in compare
  const availableToAdd = products.filter(
    (p) => !compareList.some((cp) => cp.id === p.id)
  );

  // Derive common metrics if same category, or union of metrics
  const primaryCategory = compareList[0]?.categoryId;
  const sameCategory = compareList.every((p) => p.categoryId === primaryCategory);

  // Common spec keys across products
  const allSpecNames = Array.from(
    new Set(compareList.flatMap((p) => p.specs.map((s) => s.name)))
  );

  // Metric keys to compare
  const metricKeys = Array.from(
    new Set(
      compareList.flatMap((p) =>
        Object.keys(p.editorialReview.metricScores || {})
      )
    )
  );

  // Format Recharts data for radar comparison
  const radarChartData = metricKeys.map((key) => {
    const entry: Record<string, string | number> = {
      metric: key.toUpperCase(),
    };
    compareList.forEach((prod) => {
      entry[prod.name] = prod.editorialReview.metricScores[key] ?? 0;
    });
    return entry;
  });

  // Calculate winner per metric
  const metricWinners = metricKeys.reduce((acc, key) => {
    let topScore = -1;
    let topProduct: Product | null = null;
    compareList.forEach((p) => {
      const score = p.editorialReview.metricScores[key] ?? 0;
      if (score > topScore) {
        topScore = score;
        topProduct = p;
      }
    });
    if (topProduct) {
      acc[key] = { product: topProduct, score: topScore };
    }
    return acc;
  }, {} as Record<string, { product: Product; score: number }>);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
            <Layers className="w-3.5 h-3.5" />
            Module 3: Side-by-Side Comparison Matrix
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Product Face-Off & Comparison Engine
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Compare up to 4 products side-by-side with dynamic metric radars, winner badges, and specs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {compareList.length > 0 && (
            <button
              onClick={clearCompare}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All ({compareList.length})
            </button>
          )}

          {/* Quick Add Product Dropdown */}
          {compareList.length < 4 && availableToAdd.length > 0 && (
            <div className="flex items-center gap-2">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="bg-white border border-slate-200 text-xs font-medium rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-xs"
              >
                <option value="">Select product to add...</option>
                {availableToAdd.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (${p.priceEstimate})
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddProduct}
                disabled={!selectedProductId}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Add
              </button>
            </div>
          )}
        </div>
      </div>

      {/* When Empty */}
      {compareList.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs max-w-2xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Layers className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Your comparison list is empty</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Click &quot;Compare&quot; on any product card from the home page or catalogue to evaluate them
            side-by-side with dynamic radars and winner badges.
          </p>
          <div className="pt-2 flex flex-wrap gap-2 justify-center">
            {products.slice(0, 3).map((p) => (
              <button
                key={p.id}
                onClick={() => toggleCompare(p)}
                className="text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors border border-slate-200"
              >
                + Add {p.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Section 1: Product Header Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {compareList.map((product, idx) => (
              <div
                key={product.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between relative group"
              >
                <button
                  onClick={() => removeFromCompare(product.id)}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors z-10"
                  title="Remove from comparison"
                >
                  <X className="w-4 h-4" />
                </button>

                <div>
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 mb-4">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    <div
                      className="absolute bottom-2 left-2 w-3 h-3 rounded-full border-2 border-white shadow"
                      style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                    />
                  </div>

                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                    {product.brand}
                  </span>
                  <Link href={`/product/${product.slug}`} className="block">
                    <h3 className="font-bold text-slate-900 text-sm hover:text-indigo-600 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1 bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                      {product.editorialReview.overallScore.toFixed(1)} / 10
                    </div>
                    <div className="text-sm font-extrabold text-slate-900">
                      ${product.priceEstimate}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <Link
                    href={`/product/${product.slug}`}
                    className="text-center py-1.5 px-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800"
                  >
                    View
                  </Link>
                  {product.affiliateLinks[0] && (
                    <a
                      href={product.affiliateLinks[0].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-center py-1.5 px-2 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-100 border border-indigo-200 flex items-center justify-center gap-1"
                    >
                      Buy <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Section 2: Visual Score Radar Overlay */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Dynamic Metric Face-Off (Radar Overlay)
                </h3>
                <p className="text-xs text-slate-500">
                  Visual performance comparison across evaluated dynamic dimensions
                </p>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarChartData}>
                  <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }}
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  {compareList.map((prod, idx) => (
                    <Radar
                      key={prod.id}
                      name={prod.name}
                      dataKey={prod.name}
                      stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                      fill={CHART_COLORS[idx % CHART_COLORS.length]}
                      fillOpacity={0.25}
                    />
                  ))}
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Section 3: Winner Badges Per Metric */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100 mb-4">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-bold text-slate-900">
                Category Winner Breakdown
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {metricKeys.map((key) => {
                const winner = metricWinners[key];
                if (!winner) return null;
                return (
                  <div
                    key={key}
                    className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-amber-800 uppercase">
                      <span>{key} Winner</span>
                      <span className="bg-amber-200/80 px-2 py-0.5 rounded text-[10px]">
                        {winner.score.toFixed(1)} / 10
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">
                      {winner.product.name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Brand: {winner.product.brand}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Spec-by-Spec Comparison Matrix Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                Comprehensive Technical Specification Matrix
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Direct side-by-side comparison across all published lab parameters
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                    <th className="py-3 px-4 text-left font-bold w-1/4">Parameter</th>
                    {compareList.map((p) => (
                      <th key={p.id} className="py-3 px-4 text-left font-bold">
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-500">
                      Overall Editorial Score
                    </td>
                    {compareList.map((p) => (
                      <td key={p.id} className="py-3 px-4 font-bold text-emerald-700">
                        {p.editorialReview.overallScore.toFixed(1)} / 10.0
                      </td>
                    ))}
                  </tr>

                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-500">Price Estimate</td>
                    {compareList.map((p) => (
                      <td key={p.id} className="py-3 px-4 font-extrabold text-slate-900">
                        ${p.priceEstimate} {p.currency}
                      </td>
                    ))}
                  </tr>

                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-500">Release Year</td>
                    {compareList.map((p) => (
                      <td key={p.id} className="py-3 px-4 text-slate-700">
                        {p.releaseYear}
                      </td>
                    ))}
                  </tr>

                  {/* Spec Keys */}
                  {allSpecNames.map((specName) => (
                    <tr key={specName} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-semibold text-slate-500">{specName}</td>
                      {compareList.map((p) => {
                        const item = p.specs.find((s) => s.name === specName);
                        return (
                          <td key={p.id} className="py-3 px-4 text-slate-800">
                            {item ? item.value : <span className="text-slate-300">—</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
