import React from 'react';
import Link from 'next/link';
import { Sparkles, Shield, CheckCircle, Heart, ArrowUpRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5 text-white">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-base tracking-tight">UniversalReview</span>
            </div>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              The premier all-in-one universal review platform combining rigorous laboratory testing,
              dynamic category-specific metrics, and verified community feedback across consumer tech,
              food, skincare, apparel, and home essentials.
            </p>
            <div className="flex items-center gap-4 text-slate-300 text-xs font-semibold pt-2">
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-400" /> 100% Unbiased Testing
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-indigo-400" /> Verified Buyers
              </span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3">Top Categories</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/category/tech-gadgets" className="hover:text-white transition-colors">
                  Tech & Gadgets
                </Link>
              </li>
              <li>
                <Link href="/category/food-beverages" className="hover:text-white transition-colors">
                  Food & Beverages
                </Link>
              </li>
              <li>
                <Link href="/category/beauty-personal-care" className="hover:text-white transition-colors">
                  Beauty & Personal Care
                </Link>
              </li>
              <li>
                <Link href="/category/home-kitchen" className="hover:text-white transition-colors">
                  Home & Kitchen
                </Link>
              </li>
              <li>
                <Link href="/category/fashion-apparel" className="hover:text-white transition-colors">
                  Fashion & Apparel
                </Link>
              </li>
            </ul>
          </div>

          {/* Editorial & Tools */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3">Platform Tools</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/compare" className="hover:text-white transition-colors flex items-center gap-1">
                  Side-by-Side Comparison <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors flex items-center gap-1">
                  Admin & Editorial CMS <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <span className="text-slate-500">Rating Criteria Engine v2.4</span>
              </li>
              <li>
                <span className="text-slate-500">Affiliate Disclosure Policy</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <p>© {new Date().getFullYear()} UniversalReview Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with Next.js App Router, Tailwind CSS, & Dynamic Criteria Engine
          </p>
        </div>
      </div>
    </footer>
  );
}
