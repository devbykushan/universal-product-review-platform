'use client';

import React, { useState, useEffect } from 'react';
import { Product, CommunityReview } from '../types';
import { AiSummaryResult } from '../lib/gemini';
import {
  Sparkles,
  ThumbsUp,
  AlertTriangle,
  RotateCw,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Cpu,
} from 'lucide-react';

interface AiVerdictCardProps {
  product: Product;
  communityReviews: CommunityReview[];
}

export function AiVerdictCard({ product, communityReviews }: AiVerdictCardProps) {
  const [summary, setSummary] = useState<AiSummaryResult | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAiSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: product.name,
          category: product.subcategory || product.categoryId,
          overallScore: product.editorialReview.overallScore,
          editorialVerdict: product.editorialReview.verdictShort,
          theGood: product.editorialReview.theGood,
          theBad: product.editorialReview.theBad,
          communityReviews: communityReviews.map((r) => ({
            userName: r.userName,
            rating: r.rating,
            title: r.title,
            comment: r.comment,
            verifiedBuyer: r.verifiedBuyer,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (e) {
      console.warn('AI summary fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAiSummary();
  }, [product.id, communityReviews.length]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-indigo-200/80 bg-gradient-to-br from-indigo-900/5 via-purple-900/5 to-slate-900/5 backdrop-blur-xl p-6 sm:p-8 shadow-xl shadow-indigo-500/5">
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-indigo-100/60 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Gemini AI Consensus & Synthesis
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm">
                <Cpu className="w-3 h-3" /> GenAI
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant multi-source distillation of lab metrics and {communityReviews.length} community discussions
            </p>
          </div>
        </div>

        <button
          onClick={fetchAiSummary}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white/80 hover:bg-white text-xs font-semibold text-slate-700 shadow-sm transition-all hover:border-indigo-300 disabled:opacity-50 self-start sm:self-auto"
        >
          <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
          <span>{loading ? 'Analyzing...' : 'Re-Synthesize'}</span>
        </button>
      </div>

      {loading && !summary ? (
        <div className="py-12 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-semibold text-slate-600">Gemini AI is parsing sentiments and lab telemetry...</p>
        </div>
      ) : summary ? (
        <div className="mt-6 space-y-6">
          {/* Sentiment Meter & Headline */}
          <div className="bg-white/90 rounded-2xl p-5 border border-indigo-100/80 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Community Sentiment Score
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {summary.sentimentScore}% Positive
                </span>
                <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                  Confidence: {summary.confidenceScore}%
                </span>
              </div>
            </div>

            {/* Sentiment Progress Bar */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${summary.sentimentScore}%` }}
              />
            </div>

            {/* AI Summary Headline */}
            <p className="text-sm font-medium text-slate-800 mt-4 leading-relaxed italic bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100/50">
              &ldquo;{summary.headline}&rdquo;
            </p>
          </div>

          {/* Pros & Cons Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* What Buyers Love */}
            <div className="bg-white/90 rounded-2xl p-5 border border-emerald-100/80 shadow-sm">
              <div className="flex items-center gap-2 mb-3 text-emerald-700">
                <ThumbsUp className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">What Real Buyers Love</h4>
              </div>
              <ul className="space-y-2">
                {summary.keyPros.map((pro, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700 leading-normal">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Common Complaints / Caveats */}
            <div className="bg-white/90 rounded-2xl p-5 border border-amber-100/80 shadow-sm">
              <div className="flex items-center gap-2 mb-3 text-amber-700">
                <AlertTriangle className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Common Caveats & Trade-offs</h4>
              </div>
              <ul className="space-y-2">
                {summary.keyCons.map((con, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700 leading-normal">
                    <XCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Audience Match Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-indigo-950">
              <strong className="block text-indigo-700 font-bold mb-0.5">🎯 Best Suited For:</strong>
              <p className="text-indigo-900/80">{summary.whoShouldBuy}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-100/70 border border-slate-200 text-slate-900">
              <strong className="block text-slate-600 font-bold mb-0.5">🚫 Who Should Skip It:</strong>
              <p className="text-slate-600">{summary.whoShouldAvoid}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
