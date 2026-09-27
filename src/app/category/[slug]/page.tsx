'use client';

import React, { useState, useMemo } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { ProductCard } from '@/components/ProductCard';
import {
  Filter,
  SlidersHorizontal,
  Star,
  Tag,
  ArrowUpDown,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';

export default function CategoryBrowsePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { categories, products } = useStore();

  const category = categories.find((c) => c.slug === slug);

  // Faceted Filter States
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [priceTier, setPriceTier] = useState<string>('all'); // all, budget, mid, premium
  const [minRating, setMinRating] = useState<number>(0);
  const [onlyEditorsChoice, setOnlyEditorsChoice] = useState<boolean>(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('highest-rated');

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Category Not Found</h2>
        <p className="text-slate-500 mt-2">
          The requested category &quot;{slug}&quot; does not exist.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  // All products belonging to this category
  const categoryProducts = products.filter((p) => p.categoryId === category.id);

  // Extract all unique tags in this category
  const availableTags = useMemo(() => {
    const set = new Set<string>();
    categoryProducts.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [categoryProducts]);

  // Apply Faceted Filtering
  const filteredProducts = useMemo(() => {
    return categoryProducts.filter((product) => {
      // Subcategory
      if (selectedSubcategory !== 'all' && product.subcategory !== selectedSubcategory) {
        return false;
      }

      // Price Tiers
      if (priceTier === 'budget' && product.priceEstimate >= 50) return false;
      if (
        priceTier === 'mid' &&
        (product.priceEstimate < 50 || product.priceEstimate > 250)
      )
        return false;
      if (priceTier === 'premium' && product.priceEstimate <= 250) return false;

      // Min Rating
      if (minRating > 0 && product.communityRatingAverage < minRating) return false;

      // Editor's Choice
      if (onlyEditorsChoice && !product.editorsChoice) return false;

      // Tags
      if (
        selectedTags.length > 0 &&
        !selectedTags.some((tag) => product.tags.includes(tag))
      ) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'highest-rated') {
        return b.editorialReview.overallScore - a.editorialReview.overallScore;
      }
      if (sortBy === 'popular') {
        return b.communityReviewCount - a.communityReviewCount;
      }
      if (sortBy === 'price-low') {
        return a.priceEstimate - b.priceEstimate;
      }
      if (sortBy === 'price-high') {
        return b.priceEstimate - a.priceEstimate;
      }
      if (sortBy === 'newest') {
        return b.releaseYear - a.releaseYear;
      }
      return 0;
    });
  }, [
    categoryProducts,
    selectedSubcategory,
    priceTier,
    minRating,
    onlyEditorsChoice,
    selectedTags,
    sortBy,
  ]);

  const resetFilters = () => {
    setSelectedSubcategory('all');
    setPriceTier('all');
    setMinRating(0);
    setOnlyEditorsChoice(false);
    setSelectedTags([]);
    setSortBy('highest-rated');
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb Header */}
      <div>
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <Link href="/" className="hover:text-indigo-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-semibold">{category.name}</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              {category.name} Reviews
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              {category.description}
            </p>
          </div>

          {/* Metric Badges Info */}
          <div className="flex flex-wrap gap-2 items-center bg-indigo-50/70 border border-indigo-100 p-3 rounded-2xl">
            <span className="text-xs font-bold text-indigo-700">Dynamic Metrics:</span>
            {category.metrics.map((m) => (
              <span
                key={m.key}
                className="text-[11px] font-semibold bg-white text-slate-700 px-2.5 py-0.5 rounded-full shadow-2xs border border-indigo-100"
              >
                {m.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Browse Layout: Faceted Filter Sidebar + Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Faceted Filter Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                Faceted Filters
              </div>
              <button
                onClick={resetFilters}
                className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* Subcategories */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Subcategory
              </label>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedSubcategory('all')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedSubcategory === 'all'
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All ({categoryProducts.length})
                </button>
                {category.subcategories.map((sub) => {
                  const count = categoryProducts.filter((p) => p.subcategory === sub).length;
                  return (
                    <button
                      key={sub}
                      onClick={() => setSelectedSubcategory(sub)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                        selectedSubcategory === sub
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>{sub}</span>
                      <span className="text-[11px] opacity-75">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Tier */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Price Range
              </label>
              <div className="grid grid-cols-1 gap-1.5 text-xs">
                {[
                  { id: 'all', label: 'Any Price' },
                  { id: 'budget', label: 'Budget (Under $50)' },
                  { id: 'mid', label: 'Mid-Range ($50 - $250)' },
                  { id: 'premium', label: 'Premium ($250+)' },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => setPriceTier(tier.id)}
                    className={`text-left px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      priceTier === tier.id
                        ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Minimum Rating */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Community Rating
              </label>
              <div className="space-y-1.5">
                {[4.5, 4.0, 3.5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      minRating === rating
                        ? 'bg-amber-50 text-amber-800 font-bold border border-amber-200'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{rating}+ Stars</span>
                    </div>
                    {minRating === rating && (
                      <span className="text-[10px] text-amber-700 font-semibold">Active</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Editor's Choice Toggle */}
            <div className="pt-4 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyEditorsChoice}
                  onChange={(e) => setOnlyEditorsChoice(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-800">
                  Only Editor&apos;s Choice
                </span>
              </label>
            </div>

            {/* Custom Feature Tags */}
            {availableTags.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-600" />
                  Custom Feature Tags
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Results Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Results Control Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
            <span className="text-sm text-slate-600">
              Showing <strong className="text-slate-900">{filteredProducts.length}</strong>{' '}
              verified reviews in {category.name}
            </span>

            {/* Sorting Options */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <label htmlFor="sort-dropdown" className="text-xs text-slate-500 font-medium">Sort By:</label>
              <select
                id="sort-dropdown"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="highest-rated">Highest Editorial Score</option>
                <option value="popular">Most Community Reviews</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest Releases</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 space-y-3">
              <p className="text-base font-semibold text-slate-700">
                No products match the selected filters.
              </p>
              <p className="text-xs text-slate-400">
                Try widening your price range, clearing tags, or resetting filters.
              </p>
              <button
                onClick={resetFilters}
                className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
