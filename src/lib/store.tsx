'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Category, Product, CommunityReview, CategoryMetric } from '../types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_COMMUNITY_REVIEWS } from '../data/mockData';

interface StoreContextType {
  categories: Category[];
  products: Product[];
  reviews: CommunityReview[];
  compareList: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  updateCategoryMetrics: (categoryId: string, metrics: CategoryMetric[]) => void;
  addCategory: (category: Category) => void;
  addCommunityReview: (review: Omit<CommunityReview, 'id' | 'createdAt' | 'helpfulCount' | 'status'>) => void;
  voteHelpful: (reviewId: string) => void;
  updateReviewStatus: (reviewId: string, status: 'approved' | 'flagged') => void;
  toggleCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [reviews, setReviews] = useState<CommunityReview[]>(INITIAL_COMMUNITY_REVIEWS);
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [hasHydrated, setHasHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem('uprp_products');
      const savedCategories = localStorage.getItem('uprp_categories');
      const savedReviews = localStorage.getItem('uprp_reviews');
      const savedCompare = localStorage.getItem('uprp_compare');

      if (savedProducts) setProducts(JSON.parse(savedProducts));
      if (savedCategories) setCategories(JSON.parse(savedCategories));
      if (savedReviews) setReviews(JSON.parse(savedReviews));
      if (savedCompare) setCompareList(JSON.parse(savedCompare));
    } catch (e) {
      console.warn('Storage read error:', e);
    }
    setHasHydrated(true);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!hasHydrated) return;
    try {
      localStorage.setItem('uprp_products', JSON.stringify(products));
      localStorage.setItem('uprp_categories', JSON.stringify(categories));
      localStorage.setItem('uprp_reviews', JSON.stringify(reviews));
      localStorage.setItem('uprp_compare', JSON.stringify(compareList));
    } catch (e) {
      console.warn('Storage write error:', e);
    }
  }, [products, categories, reviews, compareList, hasHydrated]);

  const addProduct = (product: Product) => {
    setProducts((prev) => [product, ...prev]);
  };

  const updateProduct = (product: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setCompareList((prev) => prev.filter((p) => p.id !== id));
  };

  const updateCategoryMetrics = (categoryId: string, metrics: CategoryMetric[]) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, metrics } : c))
    );
  };

  const addCategory = (category: Category) => {
    setCategories((prev) => [...prev, category]);
  };

  const addCommunityReview = (
    newRev: Omit<CommunityReview, 'id' | 'createdAt' | 'helpfulCount' | 'status'>
  ) => {
    const fullReview: CommunityReview = {
      ...newRev,
      id: `cr-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      helpfulCount: 0,
      status: 'approved',
    };
    setReviews((prev) => [fullReview, ...prev]);

    // Update community review count & rating for product
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === newRev.productId) {
          const productReviews = [...reviews.filter((r) => r.productId === p.id), fullReview];
          const avg =
            productReviews.reduce((acc, curr) => acc + curr.rating, 0) /
            productReviews.length;
          return {
            ...p,
            communityReviewCount: productReviews.length,
            communityRatingAverage: Math.round(avg * 10) / 10,
          };
        }
        return p;
      })
    );
  };

  const voteHelpful = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r
      )
    );
  };

  const updateReviewStatus = (reviewId: string, status: 'approved' | 'flagged') => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status } : r))
    );
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
