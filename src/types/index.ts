export interface CategoryMetric {
  key: string;
  label: string;
  description: string;
  weight?: number; // optional weighting factor
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  subcategories: string[];
  metrics: CategoryMetric[];
}

export interface AffiliateLink {
  storeName: string;
  url: string;
  price: number;
  currency: string;
  isPrimary?: boolean;
  inStock?: boolean;
}

export interface SpecificationItem {
  name: string;
  value: string;
  group?: string;
}

export interface EditorialReview {
  id: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  publishedAt: string;
  updatedAt: string;
  overallScore: number; // e.g. 9.1 out of 10
  verdictShort: string;
  verdictDetail: string;
  theGood: string[];
  theBad: string[];
  targetAudience: string;
  skipAudience: string;
  metricScores: Record<string, number>; // key -> score (1 to 10 or 1 to 5)
  sections: {
    title: string;
    content: string;
  }[];
}

export interface CommunityReview {
  id: string;
  productId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1 to 5
  metricScores?: Record<string, number>;
  title: string;
  comment: string;
  verifiedBuyer: boolean;
  createdAt: string;
  helpfulCount: number;
  status: 'approved' | 'pending' | 'flagged';
  photos?: string[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  categoryId: string;
  subcategory: string;
  images: string[];
  releaseYear: number;
  priceEstimate: number;
  currency: string;
  tags: string[];
  specs: SpecificationItem[];
  affiliateLinks: AffiliateLink[];
  editorialReview: EditorialReview;
  communityReviewCount: number;
  communityRatingAverage: number;
  editorsChoice?: boolean;
}
