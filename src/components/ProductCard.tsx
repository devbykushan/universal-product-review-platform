'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '../types';
import { StarRating } from './StarRating';
import { useStore } from '../lib/store';
import { Check, Plus, ExternalLink, ArrowRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { toggleCompare, isInCompare, categories } = useStore();
  const inCompare = isInCompare(product.id);
  const category = categories.find((c) => c.id === product.categoryId);

  const primaryAffiliate =
    product.affiliateLinks.find((l) => l.isPrimary) || product.affiliateLinks[0];

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Image Container */}
        <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />

          {/* Top Overlays */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full bg-slate-900/80 text-white backdrop-blur-md">
              {category?.name.split('&')[0] || product.subcategory}
            </span>

            {/* Overall Score Badge */}
            <div className="flex items-center gap-1 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
              <span>{product.editorialReview.overallScore.toFixed(1)}</span>
              <span className="text-[10px] text-emerald-200">/ 10</span>
            </div>
          </div>

          {/* Editor's Choice Ribbon */}
          {product.editorsChoice && (
            <div className="absolute bottom-3 left-3 bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded shadow">
              Editor’s Choice
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-indigo-600 uppercase tracking-wider text-[11px]">
              {product.brand}
            </span>
            <span>{product.releaseYear}</span>
          </div>

          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-indigo-600 transition-colors">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
            {product.editorialReview.verdictShort}
          </p>

          {/* Rating & Review Counts */}
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <StarRating rating={product.communityRatingAverage} size="sm" />
              <span className="font-semibold text-slate-700">
                {product.communityRatingAverage.toFixed(1)}
              </span>
            </div>
            <span>({product.communityReviewCount} reviews)</span>
          </div>
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="p-5 pt-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-xs text-slate-400">Est. Price</span>
            <div className="text-base font-extrabold text-slate-900">
              ${product.priceEstimate}
            </div>
          </div>

          {/* Compare Button */}
          <button
            onClick={() => toggleCompare(product)}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              inCompare
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {inCompare ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Comparing
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                Compare
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link
            href={`/product/${product.slug}`}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
          >
            <span>Read Review</span>
            <ArrowRight className="w-3 h-3" />
          </Link>

          {primaryAffiliate && (
            <a
              href={primaryAffiliate.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors border border-indigo-200/60"
            >
              <span>{primaryAffiliate.storeName}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
