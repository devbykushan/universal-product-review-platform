'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { Product, CategoryMetric, Category } from '@/types';
import {
  SlidersHorizontal,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Edit,
  Package,
  FileText,
  Sliders,
  ShieldCheck,
  Save,
  Check,
  X,
  ExternalLink,
  Lock,
  Mail,
  ArrowLeft,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const {
    products,
    categories,
    reviews,
    addProduct,
    deleteProduct,
    updateCategoryMetrics,
    addCategory,
    updateReviewStatus,
  } = useStore();

  const { user, isLoading: isAuthLoading, login } = useAuth();
  const [adminEmail, setAdminEmail] = useState('admin@universalreview.com');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);
  const [adminSubmitting, setAdminSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState<
    'products' | 'review-builder' | 'schema-builder' | 'moderation'
  >('products');

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // --- Category Schema Builder State ---
  const [selectedCategoryForSchema, setSelectedCategoryForSchema] = useState<string>(
    categories[0]?.id || ''
  );
  const currentCategoryObj = categories.find((c) => c.id === selectedCategoryForSchema);
  const [newMetricKey, setNewMetricKey] = useState('');
  const [newMetricLabel, setNewMetricLabel] = useState('');
  const [newMetricDesc, setNewMetricDesc] = useState('');

  // New Category Creation
  const [showNewCatModal, setShowNewCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const handleAddMetricToCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCategoryObj || !newMetricKey.trim() || !newMetricLabel.trim()) return;

    const key = newMetricKey.trim().toLowerCase().replace(/\s+/g, '_');
    const existing = currentCategoryObj.metrics.find((m) => m.key === key);
    if (existing) {
      alert('A metric with this key already exists in this category.');
      return;
    }

    const updated = [
      ...currentCategoryObj.metrics,
      {
        key,
        label: newMetricLabel.trim(),
        description: newMetricDesc.trim() || `${newMetricLabel} evaluation score`,
      },
    ];

    updateCategoryMetrics(currentCategoryObj.id, updated);
    setNewMetricKey('');
    setNewMetricLabel('');
    setNewMetricDesc('');
    showToast(`Added dynamic metric "${newMetricLabel}" to ${currentCategoryObj.name}!`);
  };

  const handleRemoveMetric = (key: string) => {
    if (!currentCategoryObj) return;
    const updated = currentCategoryObj.metrics.filter((m) => m.key !== key);
    updateCategoryMetrics(currentCategoryObj.id, updated);
    showToast(`Removed metric from category.`);
  };

  const handleCreateNewCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const slug = (newCatSlug || newCatName).toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newCategory: Category = {
      id: slug,
      name: newCatName.trim(),
      slug,
      icon: 'Sparkles',
      description: newCatDesc.trim() || 'Custom evaluated category',
      subcategories: ['General'],
      metrics: [
        { key: 'quality', label: 'Overall Quality', description: 'General quality metric' },
        { key: 'value', label: 'Value for Money', description: 'Price to performance' },
      ],
    };

    addCategory(newCategory);
    setSelectedCategoryForSchema(newCategory.id);
    setShowNewCatModal(false);
    setNewCatName('');
    setNewCatSlug('');
    setNewCatDesc('');
    showToast(`Created new category schema for "${newCategory.name}"!`);
  };

  // --- Product & Review Builder State ---
  const [pName, setPName] = useState('');
  const [pBrand, setPBrand] = useState('');
  const [pCategory, setPCategory] = useState(categories[0]?.id || '');
  const [pSubcategory, setPSubcategory] = useState('');
  const [pPrice, setPPrice] = useState(99);
  const [pImage, setPImage] = useState(
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80'
  );
  const [pTags, setPTags] = useState('#LabTested, #TopTier');
  const [pVerdictShort, setPVerdictShort] = useState('');
  const [pVerdictDetail, setPVerdictDetail] = useState('');
  const [pPros, setPPros] = useState('Outstanding build quality\nExceptional real-world reliability');
  const [pCons, setPCons] = useState('Premium pricing barrier');
  const [pTarget, setPTarget] = useState('Discerning consumers wanting premium durability');
  const [pSkip, setPSkip] = useState('Budget shoppers seeking entry-level simplicity');
  const [pScore, setPScore] = useState(9.0);

  // Dynamic scores for the chosen category
  const activeReviewCat = categories.find((c) => c.id === pCategory) || categories[0];
  const [dynamicScores, setDynamicScores] = useState<Record<string, number>>({});

  const handleScoreChange = (metricKey: string, val: number) => {
    setDynamicScores((prev) => ({ ...prev, [metricKey]: val }));
  };

  const handlePublishProductAndReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim() || !pBrand.trim() || !pVerdictShort.trim()) {
      alert('Please fill out the product title, brand, and quick verdict.');
      return;
    }

    const slug = `${pBrand}-${pName}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Default dynamic scores if not customized
    const finalScores: Record<string, number> = {};
    activeReviewCat.metrics.forEach((m) => {
      finalScores[m.key] = dynamicScores[m.key] ?? 9.0;
    });

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      slug,
      name: pName.trim(),
      brand: pBrand.trim(),
      categoryId: pCategory,
      subcategory: pSubcategory.trim() || activeReviewCat.subcategories[0] || 'General',
      images: [pImage.trim()],
      releaseYear: new Date().getFullYear(),
      priceEstimate: Number(pPrice),
      currency: 'USD',
      tags: pTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      editorsChoice: pScore >= 9.0,
      specs: [
        { name: 'Category Standard', value: activeReviewCat.name },
        { name: 'Evaluation Lab', value: 'Universal Lab Benchmark v2.4' },
      ],
      affiliateLinks: [
        {
          storeName: 'Amazon',
          url: 'https://amazon.com',
          price: Number(pPrice),
          currency: 'USD',
          isPrimary: true,
          inStock: true,
        },
      ],
      editorialReview: {
        id: `rev-${Date.now()}`,
        author: {
          name: 'Editorial Staff',
          role: 'Lead Lab Tester',
          avatar:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        },
        publishedAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        overallScore: Number(pScore),
        verdictShort: pVerdictShort.trim(),
        verdictDetail: pVerdictDetail.trim() || pVerdictShort.trim(),
        theGood: pPros
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        theBad: pCons
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        targetAudience: pTarget.trim(),
        skipAudience: pSkip.trim(),
        metricScores: finalScores,
        sections: [
          {
            title: 'Initial Laboratory Benchmarks',
            content:
              'In our controlled laboratory assessment, the product met all strict baseline tolerance levels with consistent performance.',
          },
        ],
      },
      communityReviewCount: 0,
      communityRatingAverage: 5.0,
    };

    addProduct(newProduct);
    showToast(`Published review for "${newProduct.name}"!`);
    setActiveTab('products');

    // Reset inputs
    setPName('');
    setPBrand('');
    setPVerdictShort('');
    setPVerdictDetail('');
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-600">Verifying administrator credentials...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    const handleAdminLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setAdminAuthError(null);
      setAdminSubmitting(true);
      const res = await login(adminEmail, adminPassword);
      if (!res.success) {
        setAdminAuthError(res.error || 'Invalid administrator credentials');
      }
      setAdminSubmitting(false);
    };

    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl p-8 text-center">
          <div className="inline-flex p-4 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admin CMS Restricted Area</h2>
          <p className="text-xs text-slate-500 mt-2 mb-6">
            This module is reserved for editorial staff and administrators. Please authenticate with administrator credentials to manage products, categories, and reviews.
          </p>

          {user && user.role !== 'admin' && (
            <div className="mb-6 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-800">
              <p className="font-bold">Logged in as {user.name} (Member)</p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Your account does not possess administrative privileges. Please log in with the administrator account below.
              </p>
            </div>
          )}

          {adminAuthError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 text-left flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{adminAuthError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={adminSubmitting}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 transition-all disabled:opacity-50"
            >
              {adminSubmitting ? 'Authenticating...' : 'Sign In as Administrator'}
            </button>
          </form>

          {/* 1-Click Demo Fill */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Default Admin Demo Access
            </p>
            <button
              type="button"
              onClick={() => {
                setAdminEmail('admin@universalreview.com');
                setAdminPassword('admin123');
              }}
              className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 flex items-center justify-between"
            >
              <span>admin@universalreview.com</span>
              <span className="font-mono text-[10px] bg-slate-200 px-2 py-0.5 rounded text-slate-700">admin123</span>
            </button>
          </div>

          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Public Platform
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-indigo-500 animate-slide-in">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Module 4: Editorial & Admin CMS Dashboard
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Universal Review Management Studio
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage products, build editorial reviews, configure dynamic category criteria, and moderate community posts.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors self-start"
        >
          View Public Site <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Dashboard Nav Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 overflow-x-auto text-sm font-bold">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'products'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          Product Manager ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('review-builder')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'review-builder'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Review & Verdict Builder
        </button>

        <button
          onClick={() => setActiveTab('schema-builder')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'schema-builder'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Dynamic Category Schema Builder
        </button>

        <button
          onClick={() => setActiveTab('moderation')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'moderation'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Community Moderation Queue ({reviews.length})
        </button>
      </div>

      {/* TAB 1: Product Manager */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Published Products</h2>
            <button
              onClick={() => setActiveTab('review-builder')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" /> Publish New Review
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                    <th className="py-3 px-4 text-left font-bold">Product</th>
                    <th className="py-3 px-4 text-left font-bold">Category</th>
                    <th className="py-3 px-4 text-left font-bold">Price</th>
                    <th className="py-3 px-4 text-left font-bold">Editorial Score</th>
                    <th className="py-3 px-4 text-left font-bold">Reviews</th>
                    <th className="py-3 px-4 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                            <Image
                              src={p.images[0]}
                              alt={p.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{p.name}</span>
                            <span className="text-[11px] text-slate-500">{p.brand}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {p.subcategory}
                      </td>
                      <td className="py-3 px-4 font-extrabold text-slate-900">
                        ${p.priceEstimate}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {p.editorialReview.overallScore.toFixed(1)} / 10
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {p.communityReviewCount} community
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <Link
                          href={`/product/${p.slug}`}
                          className="px-2.5 py-1 text-slate-600 hover:text-indigo-600 font-semibold"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => {
                            if (confirm(`Delete ${p.name}?`)) {
                              deleteProduct(p.id);
                              showToast(`Deleted ${p.name}`);
                            }
                          }}
                          className="p-1 text-rose-500 hover:text-rose-700"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Review & Verdict Builder */}
      {activeTab === 'review-builder' && (
        <form
          onSubmit={handlePublishProductAndReview}
          className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-2xs space-y-8"
        >
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Publish New In-Depth Review
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Add product specifications, TL;DR verdict, pros/cons, and category-tailored dynamic metric scores.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                Product Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Pixel 9 Pro Fold"
                value={pName}
                onChange={(e) => setPName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                Brand / Manufacturer
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Google"
                value={pBrand}
                onChange={(e) => setPBrand(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                Primary Category
              </label>
              <select
                value={pCategory}
                onChange={(e) => setPCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                Subcategory / Segment
              </label>
              <input
                type="text"
                placeholder="e.g., Foldable Phones"
                value={pSubcategory}
                onChange={(e) => setPSubcategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                Price Estimate ($ USD)
              </label>
              <input
                type="number"
                required
                value={pPrice}
                onChange={(e) => setPPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                Image URL
              </label>
              <input
                type="text"
                required
                value={pImage}
                onChange={(e) => setPImage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Quick Verdict & TL;DR */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Quick Verdict (TL;DR) & Scores
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bottom-Line Verdict (1 - 2 sentences)
              </label>
              <input
                type="text"
                required
                placeholder="e.g., The best foldable yet with ultra-thin hinges and superb bright displays."
                value={pVerdictShort}
                onChange={(e) => setPVerdictShort(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  The Good (Pros - One per line)
                </label>
                <textarea
                  rows={3}
                  value={pPros}
                  onChange={(e) => setPPros(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  The Bad (Cons - One per line)
                </label>
                <textarea
                  rows={3}
                  value={pCons}
                  onChange={(e) => setPCons(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Who is this for?
                </label>
                <input
                  type="text"
                  value={pTarget}
                  onChange={(e) => setPTarget(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Who should skip it?
                </label>
                <input
                  type="text"
                  value={pSkip}
                  onChange={(e) => setPSkip(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Category Scores Input Panel */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Dynamic Category Metrics for &quot;{activeReviewCat.name}&quot;
                </h4>
                <p className="text-[11px] text-slate-500">
                  Adjust scores (1 - 10) dynamically based on this category&apos;s registered schema
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold text-indigo-700">Overall Score:</span>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="10"
                  value={pScore}
                  onChange={(e) => setPScore(Number(e.target.value))}
                  className="w-20 ml-2 px-2 py-1 rounded border border-slate-300 text-xs font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeReviewCat.metrics.map((metric) => (
                <div key={metric.key} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800">{metric.label}</span>
                    <span className="font-bold text-indigo-600">
                      {(dynamicScores[metric.key] ?? 9.0).toFixed(1)} / 10
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={0.1}
                    value={dynamicScores[metric.key] ?? 9.0}
                    onChange={(e) => handleScoreChange(metric.key, Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md transition-all"
            >
              <Save className="w-4 h-4" />
              Publish Editorial Review
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: Dynamic Category Schema Builder */}
      {activeTab === 'schema-builder' && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Category Schema & Metric Builder
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Define custom evaluation parameters for any category dynamically without touching source code.
              </p>
            </div>

            <button
              onClick={() => setShowNewCatModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" /> New Category
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Category Selector List */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">
                Select Category Schema
              </h3>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryForSchema(cat.id)}
                  className={`w-full text-left p-3 rounded-2xl text-xs font-semibold transition-all flex items-center justify-between ${
                    selectedCategoryForSchema === cat.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-[11px] opacity-80">
                    {cat.metrics.length} metrics
                  </span>
                </button>
              ))}
            </div>

            {/* Metric Configuration Panel */}
            <div className="lg:col-span-2 space-y-6">
              {currentCategoryObj && (
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {currentCategoryObj.name} Evaluation Dimensions
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {currentCategoryObj.description}
                    </p>
                  </div>

                  {/* List of currently active dynamic metrics */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Active Evaluation Metrics
                    </label>
                    <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                      {currentCategoryObj.metrics.map((metric) => (
                        <div
                          key={metric.key}
                          className="p-3.5 flex items-center justify-between hover:bg-slate-50 text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-900">
                              {metric.label}
                            </span>
                            <span className="text-slate-400 font-mono text-[11px] ml-2">
                              ({metric.key})
                            </span>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {metric.description}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveMetric(metric.key)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Remove Metric"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add New Metric Form */}
                  <form
                    onSubmit={handleAddMetricToCategory}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4"
                  >
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Add Custom Dynamic Metric
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Metric Label
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ergonomics & Comfort"
                          value={newMetricLabel}
                          onChange={(e) => {
                            setNewMetricLabel(e.target.value);
                            if (!newMetricKey) {
                              setNewMetricKey(
                                e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_')
                              );
                            }
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Key / Identifier
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. ergonomics"
                          value={newMetricKey}
                          onChange={(e) => setNewMetricKey(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Evaluation Description
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Hand fatigue during prolonged 3+ hour use"
                        value={newMetricDesc}
                        onChange={(e) => setNewMetricDesc(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      + Add Metric to Category
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* New Category Modal */}
          {showNewCatModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900">
                    Create New Category Schema
                  </h3>
                  <button
                    onClick={() => setShowNewCatModal(false)}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateNewCategory} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Category Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Automotive & EVs"
                      value={newCatName}
                      onChange={(e) => {
                        setNewCatName(e.target.value);
                        setNewCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      required
                      value={newCatSlug}
                      onChange={(e) => setNewCatSlug(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Short Description
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Electric vehicles, charging gear, and accessories"
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowNewCatModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow"
                    >
                      Create Category
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Community Moderation Queue */}
      {activeTab === 'moderation' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Community Moderation Queue
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Review and approve community feedback, verify authentic buyer reports, and filter out promotional spam.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden">
            {reviews.map((rev) => {
              const prod = products.find((p) => p.id === rev.productId);
              return (
                <div key={rev.id} className="p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{rev.userName}</span>
                      <span className="text-xs text-slate-400">• on {prod?.name || 'Product'}</span>
                      {rev.status === 'approved' ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          Approved
                        </span>
                      ) : (
                        <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">
                          Flagged
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-slate-800">{rev.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                      {rev.comment}
                    </p>

                    <div className="text-[11px] text-slate-400">
                      Rating: {rev.rating} ★ • Helpful Votes: {rev.helpfulCount}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    {rev.status !== 'approved' && (
                      <button
                        onClick={() => {
                          updateReviewStatus(rev.id, 'approved');
                          showToast('Review approved!');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold border border-emerald-200 flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                    )}
                    {rev.status !== 'flagged' && (
                      <button
                        onClick={() => {
                          updateReviewStatus(rev.id, 'flagged');
                          showToast('Review flagged for inspection');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold border border-rose-200 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3.5 h-3.5" /> Flag
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
