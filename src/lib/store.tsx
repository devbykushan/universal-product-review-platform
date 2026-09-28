'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Category, Product, CommunityReview, CategoryMetric } from '../types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_COMMUNITY_REVIEWS } from '../data/mockData';

interface StoreContextType {
  categories: Category[];
  products: Product[];
  reviews: CommunityReview[];
  compareList: Product[];
  isLoading: boolean;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateCategoryMetrics: (categoryId: string, metrics: CategoryMetric[]) => Promise<void>;
  addCategory: (category: Category) => Promise<void>;
  addCommunityReview: (review: Omit<CommunityReview, 'id' | 'createdAt' | 'helpfulCount' | 'status'>) => Promise<void>;
  voteHelpful: (reviewId: string) => Promise<void>;
  updateReviewStatus: (reviewId: string, status: 'approved' | 'flagged') => Promise<void>;
  toggleCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  refreshData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [reviews, setReviews] = useState<CommunityReview[]>(INITIAL_COMMUNITY_REVIEWS);
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch all initial data from Database API
  const refreshData = useCallback(async () => {
    try {
      const [catRes, prodRes, revRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/products'),
        fetch('/api/reviews'),
      ]);

      if (catRes.ok) {
        const catData = await catRes.json();
        if (Array.isArray(catData) && catData.length > 0) setCategories(catData);
      }

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        if (Array.isArray(prodData) && prodData.length > 0) setProducts(prodData);
      }

      if (revRes.ok) {
        const revData = await revRes.json();
        if (Array.isArray(revData)) setReviews(revData);
      }
    } catch (e) {
      console.warn('API sync warning, falling back to local cache:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load: Load compareList from localStorage and fetch from DB
  useEffect(() => {
    try {
      const savedCompare = localStorage.getItem('uprp_compare');
      if (savedCompare) setCompareList(JSON.parse(savedCompare));
    } catch (e) {
      console.warn('Compare storage read error:', e);
    }

    refreshData();
  }, [refreshData]);

  // Persist compare list to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('uprp_compare', JSON.stringify(compareList));
    } catch (e) {
      console.warn('Compare storage write error:', e);
    }
  }, [compareList]);

  // Add Product to Database
  const addProduct = async (product: Product) => {
    setProducts((prev) => [product, ...prev]);
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
    } catch (e) {
      console.error('Failed to add product to database:', e);
    }
  };

  // Update Product in Database
  const updateProduct = async (product: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
    } catch (e) {
      console.error('Failed to update product in database:', e);
    }
  };

  // Delete Product from Database
  const deleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setCompareList((prev) => prev.filter((p) => p.id !== id));
    try {
      await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.error('Failed to delete product from database:', e);
    }
  };

  // Add Category to Database
  const addCategory = async (category: Category) => {
    setCategories((prev) => [...prev, category]);
    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });
    } catch (e) {
      console.error('Failed to save category to database:', e);
    }
  };

  // Update Category Metrics in Database
  const updateCategoryMetrics = async (categoryId: string, metrics: CategoryMetric[]) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, metrics } : c))
    );
    try {
      await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, metrics }),
      });
    } catch (e) {
      console.error('Failed to update category metrics in database:', e);
    }
  };

  // Add Community Review to Database
  const addCommunityReview = async (
    newRev: Omit<CommunityReview, 'id' | 'createdAt' | 'helpfulCount' | 'status'>
  ) => {
    const tempReview: CommunityReview = {
      ...newRev,
      id: `cr-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      helpfulCount: 0,
      status: 'approved',
    };
    setReviews((prev) => [tempReview, ...prev]);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRev),
      });
      if (res.ok) {
        const savedRev = await res.json();
        setReviews((prev) => prev.map((r) => (r.id === tempReview.id ? savedRev : r)));
        // Refresh products to get updated average rating and count
        const prodRes = await fetch('/api/products');
        if (prodRes.ok) {
          const prods = await prodRes.json();
          setProducts(prods);
        }
      }
    } catch (e) {
      console.error('Failed to save review to database:', e);
    }
  };

  // Upvote review in Database
  const voteHelpful = async (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r
      )
    );
    try {
      await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'voteHelpful', reviewId }),
      });
    } catch (e) {
      console.error('Failed to upvote review in database:', e);
    }
  };

  // Moderate review status in Database
  const updateReviewStatus = async (reviewId: string, status: 'approved' | 'flagged') => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status } : r))
    );
    try {
      await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateStatus', reviewId, status }),
      });
    } catch (e) {
      console.error('Failed to update review status in database:', e);
    }
  };

  const toggleCompare = (product: Product) => {
    setCompareList((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= 4) {
        alert('You can compare a maximum of 4 products side-by-side.');
        return prev;
      }
      return [...prev, product];
    });
  };

  const removeFromCompare = (productId: string) => {
    setCompareList((prev) => prev.filter((p) => p.id !== productId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const isInCompare = (productId: string) => {
    return compareList.some((p) => p.id === productId);
  };

  return (
    <StoreContext.Provider
      value={{
        categories,
        products,
        reviews,
        compareList,
        isLoading,
        addProduct,
        updateProduct,
        deleteProduct,
        updateCategoryMetrics,
        addCategory,
        addCommunityReview,
        voteHelpful,
        updateReviewStatus,
        toggleCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        refreshData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
