'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useStore } from '../lib/store';
import { useAuth } from '../lib/auth-context';
import {
  Search,
  SlidersHorizontal,
  Layers,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  X,
  Star,
  ExternalLink,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

export function Navbar() {
  const router = useRouter();
  const { categories, products, compareList } = useStore();
  const { user, logout, openAuthModal } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Filter products for instant live search
  const searchResults = searchQuery.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.subcategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .slice(0, 6)
    : [];

  // Close search & user menu dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 tracking-tight text-lg">
                Universal<span className="text-indigo-600">Review</span>
              </span>
              <span className="block text-[10px] text-slate-400 font-semibold tracking-wider uppercase -mt-1">
                Expert & Community Lab
              </span>
            </div>
          </Link>

          {/* Instant Live Search Engine */}
          <div ref={searchRef} className="flex-1 max-w-xl relative hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search across all categories (e.g. iPhone, Ninja, Cold Brew, Skincare)..."
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                className="w-full pl-10 pr-9 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white rounded-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 border border-transparent focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchOpen(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Instant Live Dropdown Results */}
            {isSearchOpen && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden z-50 animate-in fade-in-50">
                <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Found {searchResults.length} matching products</span>
                  <span className="text-[11px] text-slate-400">Press ESC to dismiss</span>
                </div>

                {searchResults.length > 0 ? (
                  <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-3 p-3 hover:bg-indigo-50/50 transition-colors group"
                      >
                        <div className="relative w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-indigo-600 uppercase">
                              {product.brand}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs text-slate-500 truncate">
                              {product.subcategory}
                            </span>
                          </div>
                          <p className="font-semibold text-sm text-slate-900 truncate group-hover:text-indigo-600">
                            {product.name}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="flex items-center gap-1 justify-end">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-bold text-slate-800">
                              {product.editorialReview.overallScore.toFixed(1)}
                            </span>
                          </div>
                          <span className="text-xs font-extrabold text-slate-900">
                            ${product.priceEstimate}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-sm text-slate-500">
                    No products found matching &quot;{searchQuery}&quot;.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Compare Bar Link */}
            <Link
              href="/compare"
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                compareList.length > 0
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Compare</span>
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                  compareList.length > 0
                    ? 'bg-white text-indigo-700 font-extrabold'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {compareList.length}
              </span>
            </Link>

            {/* Admin CMS (Shown if user is admin) */}
            {user?.role === 'admin' && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-purple-200 bg-purple-50 hover:bg-purple-100 text-xs font-semibold text-purple-700 transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600" />
                <span className="hidden sm:inline">Admin CMS</span>
              </Link>
            )}

            {/* User Profile or Sign In Button */}
            {user ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center text-xs font-bold overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-700 hidden md:inline max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-slate-100 text-slate-700">
                        {user.role === 'admin' ? (
                          <>
                            <ShieldCheck className="w-3 h-3 text-purple-600" />
                            <span className="text-purple-700">Admin</span>
                          </>
                        ) : (
                          <>
                            <UserIcon className="w-3 h-3 text-slate-500" />
                            <span>Community Member</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="py-1">
                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <SlidersHorizontal className="w-4 h-4 text-purple-600" />
                          <span>Admin CMS Dashboard</span>
                        </Link>
                      )}
                      <Link
                        href="/compare"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Layers className="w-4 h-4 text-slate-500" />
                        <span>Comparison Queue ({compareList.length})</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto py-2.5 no-scrollbar border-t border-slate-100 text-xs">
          <Link
            href="/"
            className="px-3 py-1 rounded-full font-medium whitespace-nowrap bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            All Categories
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="px-3 py-1 rounded-full font-medium whitespace-nowrap bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 border border-slate-200/60 transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
