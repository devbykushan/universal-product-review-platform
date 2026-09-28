'use client';

import React, { useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { StarRating } from '@/components/StarRating';
import { QuickVerdictCard } from '@/components/QuickVerdictCard';
import { AiVerdictCard } from '@/components/AiVerdictCard';
import { DynamicScoreRadar } from '@/components/DynamicScoreRadar';
import { CommunityReviewsList } from '@/components/CommunityReviewsList';
import { ReviewJsonLd } from '@/components/ReviewJsonLd';
import {
  ChevronRight,
  ExternalLink,
  ShoppingCart,
  Calendar,
  Layers,
  Check,
  Plus,
  Share2,
  Bookmark,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  Info,
} from 'lucide-react';

export default function ProductReviewPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { products, categories, reviews, toggleCompare, isInCompare } = useStore();

  const product = products.find((p) => p.slug === slug);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [specsOpen, setSpecsOpen] = useState(true);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Review Not Found</h2>
        <p className="text-slate-500 mt-2">
          We could not find an in-depth review for &quot;{slug}&quot;.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold"
        >
          Browse All Reviews
        </Link>
      </div>
    );
  }

  const category = categories.find((c) => c.id === product.categoryId);
  const inCompare = isInCompare(product.id);
  const productReviews = reviews.filter((r) => r.productId === product.id && r.status === 'approved');

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="space-y-12 pb-24">
      {/* Automated SEO JSON-LD schema injection */}
      <ReviewJsonLd product={product} />

      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <nav className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-indigo-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          {category && (
            <>
              <Link
                href={`/category/${category.slug}`}
                className="hover:text-indigo-600 transition-colors"
              >
                {category.name}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </>
          )}
          <span className="text-slate-900 font-semibold truncate max-w-xs">
            {product.name}
          </span>
        </nav>
      </div>

      {/* Module 1: Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left: Image Carousel & Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-md">
              <Image
                src={product.images[activeImageIndex]}
                alt={product.name}
                fill
                priority
                className="object-cover transition-all duration-300"
              />

              {/* Badges Overlay */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-slate-900/80 text-white backdrop-blur-md text-xs font-bold uppercase tracking-wider">
                  {product.subcategory}
                </span>
                {product.editorsChoice && (
                  <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-extrabold uppercase tracking-wider shadow">
                    Editor&apos;s Choice
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Navigation */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      activeImageIndex === idx
                        ? 'border-indigo-600 ring-2 ring-indigo-200'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt={`Angle ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Key Product Metadata & Buy Box */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
                <span>{product.brand}</span>
                <span className="text-slate-400 font-normal">Release: {product.releaseYear}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {product.name}
              </h1>

              {/* Author & Publication metadata */}
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100">
                <div className="relative w-9 h-9 rounded-full overflow-hidden bg-slate-200">
                  <Image
                    src={product.editorialReview.author.avatar}
                    alt={product.editorialReview.author.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Reviewed by {product.editorialReview.author.name}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {product.editorialReview.author.role} • Updated {product.editorialReview.updatedAt}
                  </div>
                </div>
              </div>
            </div>

            {/* Overall Score Badge Card */}
            <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider text-indigo-300 font-bold block mb-1">
                    Universal Lab Score
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                      {product.editorialReview.overallScore.toFixed(1)}
                    </span>
                    <span className="text-slate-400 text-sm font-semibold">/ 10.0</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <StarRating rating={product.communityRatingAverage} size="sm" />
                    <span className="text-xs text-indigo-200 font-medium">
                      {product.communityRatingAverage.toFixed(1)} Community ({product.communityReviewCount} reviews)
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Market Price</div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white">
                    ${product.priceEstimate}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-bold mt-1">
                    ✓ Price Verified
                  </div>
                </div>
              </div>

              {/* Background ambient lighting */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl" />
            </div>

            {/* Quick Actions (Compare & Share) */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleCompare(product)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs ${
                  inCompare
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                }`}
              >
                {inCompare ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Comparison
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Add to Comparison Tool
                  </>
                )}
              </button>

              <button
                onClick={handleShare}
                className="px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>{copiedLink ? 'Copied URL!' : 'Share'}</span>
              </button>
            </div>

            {/* "Where to Buy" Direct Affiliate Box */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <ShoppingCart className="w-4 h-4 text-indigo-600" />
                  Where to Buy (Verified Retailers)
                </span>
                <span className="text-[11px] text-slate-400">Affiliate Link Notice</span>
              </div>

              <div className="space-y-2">
                {product.affiliateLinks.map((aff, i) => (
                  <a
                    key={i}
                    href={aff.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-white hover:bg-indigo-50/60 border border-slate-200/80 hover:border-indigo-300 transition-all group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-indigo-600">
                        {aff.storeName}
                      </span>
                      {aff.isPrimary && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                          Best Offer
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-sm text-slate-900">
                        ${aff.price.toFixed(2)}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Review Body Layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Module 1 Part 1.5: Gemini AI Consensus & Synthesis */}
        <AiVerdictCard product={product} communityReviews={productReviews} />

        {/* Module 1 Part 2: Quick Verdict Card (TL;DR) */}
        <QuickVerdictCard
          verdictShort={product.editorialReview.verdictShort}
          verdictDetail={product.editorialReview.verdictDetail}
          theGood={product.editorialReview.theGood}
          theBad={product.editorialReview.theBad}
          targetAudience={product.editorialReview.targetAudience}
          skipAudience={product.editorialReview.skipAudience}
          overallScore={product.editorialReview.overallScore}
        />

        {/* Module 1 Part 3: Dynamic Score Breakdown (Radar & Metric Bars) */}
        {category && (
          <DynamicScoreRadar
            metrics={category.metrics}
            scores={product.editorialReview.metricScores}
            productName={product.name}
          />
        )}

        {/* Module 1 Part 4: In-Depth Long Form Review & Specifications */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Editorial Articles */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-2xs space-y-8">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-2xl font-extrabold text-slate-900">
                Detailed Laboratory & Hands-On Analysis
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Our in-depth test methodology results, real-world benchmarks, and ergonomic testing
              </p>
            </div>

            {product.editorialReview.sections.map((section, idx) => (
              <div key={idx} className="space-y-3">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  {section.title}
                </h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}

            {/* Editorial Ethics Callout */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 flex items-start gap-3 text-xs text-slate-600">
              <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Our Editorial Independence Guarantee:</strong> All review units are either
                purchased at standard retail prices or evaluated under strict NDA terms without
                sponsor oversight. We never accept payment in exchange for favorable scores.
              </p>
            </div>
          </div>

          {/* Specifications Drawer / Table */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-base">
                  Technical Specifications
                </h3>
                <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  {product.specs.length} Verified Points
                </span>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {product.specs.map((item, idx) => (
                  <div key={idx} className="py-3 flex flex-col gap-0.5">
                    <span className="text-slate-400 font-medium">{item.name}</span>
                    <span className="font-semibold text-slate-800">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Category Tags */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs">
              <h3 className="font-bold text-slate-900 text-sm mb-3">Product Tags</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Module 1 Part 5: Community Reviews & Discussions */}
        {category && (
          <CommunityReviewsList
            productId={product.id}
            metrics={category.metrics}
          />
        )}
      </section>
    </div>
  );
}
