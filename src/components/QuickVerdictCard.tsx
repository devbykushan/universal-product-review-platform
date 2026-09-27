'use client';

import React from 'react';
import { CheckCircle2, XCircle, UserCheck, UserX, Award } from 'lucide-react';

interface QuickVerdictCardProps {
  verdictShort: string;
  verdictDetail?: string;
  theGood: string[];
  theBad: string[];
  targetAudience: string;
  skipAudience: string;
  overallScore: number;
}

export function QuickVerdictCard({
  verdictShort,
  verdictDetail,
  theGood,
  theBad,
  targetAudience,
  skipAudience,
  overallScore,
}: QuickVerdictCardProps) {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md">
      {/* Header Verdict */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Award className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              The Quick Verdict (TL;DR)
            </span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
            {verdictShort}
          </p>
          {verdictDetail && (
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              {verdictDetail}
            </p>
          )}
        </div>

        <div className="flex-shrink-0 flex items-center gap-3 self-start sm:self-center bg-gradient-to-br from-slate-900 to-indigo-950 text-white px-5 py-3.5 rounded-2xl shadow-inner">
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wider text-indigo-200 font-medium">
              Editorial Score
            </div>
            <div className="text-3xl font-extrabold tracking-tight">
              {overallScore.toFixed(1)}
              <span className="text-sm text-indigo-300 font-normal"> / 10</span>
            </div>
          </div>
        </div>
      </div>

      {/* The Good vs The Bad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
        {/* Pros */}
        <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-100/90">
          <div className="flex items-center gap-2 text-emerald-800 font-bold mb-3 text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            The Good (Pros)
          </div>
          <ul className="space-y-2.5">
            {theGood.map((pro, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cons */}
        <div className="bg-rose-50/60 rounded-2xl p-5 border border-rose-100/90">
          <div className="flex items-center gap-2 text-rose-800 font-bold mb-3 text-sm">
            <XCircle className="w-4 h-4 text-rose-600" />
            The Bad (Cons)
          </div>
          <ul className="space-y-2.5">
            {theBad.map((con, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 flex-shrink-0" />
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Who is this for? / Who should skip it? */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
        <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg flex-shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Who Should Buy This?
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              {targetAudience}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
          <div className="p-2 bg-amber-100 text-amber-700 rounded-lg flex-shrink-0">
            <UserX className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Who Should Skip It?
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              {skipAudience}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
