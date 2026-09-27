'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { ProductCard } from '@/components/ProductCard';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  CheckCircle2,
  Sliders,
  UtensilsCrossed,
  Smartphone,
  Sparkle,
  CookingPot,
  Shirt,
  ShieldCheck,
} from 'lucide-react';

const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  'food-beverages': <UtensilsCrossed className="w-5 h-5" />,
  'tech-gadgets': <Smartphone className="w-5 h-5" />,
  'beauty-personal-care': <Sparkle className="w-5 h-5" />,
  'home-kitchen': <CookingPot className="w-5 h-5" />,
  'fashion-apparel': <Shirt className="w-5 h-5" />,
};

export default function HomePage() {
  const { categories, products, compareList } = useStore();
  const [activeTab, setActiveTab] = useState<'all' | 'editors' | 'trending'>('all');

  const editorsPicks = products.filter((p) => p.editorsChoice);
  const trendingProducts = [...products].sort(
    (a, b) => b.communityReviewCount - a.communityReviewCount
  );

  const displayedProducts =
    activeTab === 'editors'
      ? editorsPicks
      : activeTab === 'trending'
      ? trendingProducts
      : products;

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-900 via-slate-900 to-slate-900 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Glow ambient background effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-12 -left-12 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-indigo-200">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>The Universal Evaluation Standard</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Stop Guessing. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-300 via-sky-200 to-white bg-clip-text text-transparent">
              In-Depth Reviews with Dynamic Metrics
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            Whether it&apos;s battery life on a flagship phone, moisture retention in a skincare cream,
            or the crunch of an air fryer—every product is evaluated against category-specific criteria.
          </p>

          {/* Quick Metrics Bar Teaser */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
              <div className="text-[11px] uppercase tracking-wider text-indigo-300 font-bold">
                📱 Tech Gadgets
              </div>
              <div className="text-xs text-slate-200 mt-1">
                Performance, Battery, Thermals
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
              <div className="text-[11px] uppercase tracking-wider text-emerald-300 font-bold">
                🍔 Food & Drink
              </div>
              <div className="text-xs text-slate-200 mt-1">
                Taste, Ingredients, Nutrition
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
              <div className="text-[11px] uppercase tracking-wider text-pink-300 font-bold">
                💄 Beauty & Skin
              </div>
              <div className="text-xs text-slate-200 mt-1">
                Barrier Care, Formula, Scent
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
              <div className="text-[11px] uppercase tracking-wider text-amber-300 font-bold">
                🏠 Home & Kitchen
              </div>
              <div className="text-xs text-slate-200 mt-1">
                Durability, Watts, Cleaning
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Primary Category Selector Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {categories.map((cat) => {
            const productCount = products.filter((p) => p.categoryId === cat.id).length;
            return (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all mb-3">
                    {CATEGORY_ICON_MAP[cat.id] || <Sparkles className="w-5 h-5" />}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {cat.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-semibold">
                  <span>{productCount} Products</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Floating Compare Notification Bar (if items in compare) */}
      {compareList.length > 0 && (
        <aside aria-label="Product comparison panel" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-4 border border-indigo-500/50 backdrop-blur-md animate-bounce-short">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-semibold">
              {compareList.length} / 4 Products in Comparison
            </span>
          </div>
          <Link
            href="/compare"
            className="px-4 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow"
          >
            <span>Launch Comparison</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </aside>
      )}

      {/* Product Discovery Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Curated Product Reviews
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Tested by lab specialists and verified by thousands of community users
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="inline-flex p-1 bg-slate-200/80 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Products
            </button>
            <button
              onClick={() => setActiveTab('editors')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'editors'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Editor&apos;s Choice
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'trending'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Trending Reviews
            </button>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-8">
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Dynamic Rating Architecture Featurette */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-indigo-50 via-white to-slate-50 rounded-3xl p-8 sm:p-12 border border-indigo-100/80 shadow-sm">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold mb-4">
              <Sliders className="w-3.5 h-3.5" />
              Dynamic Criteria Architecture
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Why Universal Review beats generic 5-star sites
            </h3>
            <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
              Standard review websites treat a box of cereal the same way they treat a \$1,200 smartphone.
              Our proprietary Dynamic Metric Engine gives each category its own custom testing dimensions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h4 className="font-bold text-slate-900 text-base">Category-Aware Scores</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Food reviews evaluate Taste, Nutrition, and Freshness. Laptops evaluate Processing,
                Thermals, and Battery Life.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h4 className="font-bold text-slate-900 text-base">Side-by-Side Comparison</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Generate instantaneous radar graphs, spec breakdowns, and winner badges across up to
                4 rival products.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h4 className="font-bold text-slate-900 text-base">Verified Community Voice</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                We combine editorial lab rigor with verified buyer upvotes to eliminate paid bot spam and fake reviews.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
