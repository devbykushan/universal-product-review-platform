import { prisma } from './prisma';
import { Category, Product, CommunityReview, CategoryMetric } from '../types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_COMMUNITY_REVIEWS } from '../data/mockData';
import { hashPassword } from './auth';

// Helper to seed initial data if DB is empty
export async function ensureSeeded() {
  try {
    // Seed default users if empty
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      const adminPassword = await hashPassword('admin123');
      const userPassword = await hashPassword('user123');

      await prisma.user.upsert({
        where: { email: 'admin@universalreview.com' },
        update: {},
        create: {
          id: 'admin-user-1',
          name: 'Universal Admin',
          email: 'admin@universalreview.com',
          password: adminPassword,
          role: 'admin',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200',
        },
      });

      await prisma.user.upsert({
        where: { email: 'kushan@example.com' },
        update: {},
        create: {
          id: 'demo-user-1',
          name: 'Kushan Dewmina',
          email: 'kushan@example.com',
          password: userPassword,
          role: 'user',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
        },
      });
    }

    const categoryCount = await prisma.category.count();
    if (categoryCount > 0) return;

    // Seed Categories
    for (const cat of INITIAL_CATEGORIES) {
      await prisma.category.upsert({
        where: { id: cat.id },
        update: {},
        create: {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon,
          description: cat.description,
          subcategories: JSON.stringify(cat.subcategories),
          metrics: JSON.stringify(cat.metrics),
        },
      });
    }

    // Seed Products
    for (const prod of INITIAL_PRODUCTS) {
      await prisma.product.upsert({
        where: { id: prod.id },
        update: {},
        create: {
          id: prod.id,
          slug: prod.slug,
          name: prod.name,
          brand: prod.brand,
          categoryId: prod.categoryId,
          subcategory: prod.subcategory,
          images: JSON.stringify(prod.images),
          releaseYear: prod.releaseYear,
          priceEstimate: prod.priceEstimate,
          currency: prod.currency || 'USD',
          tags: JSON.stringify(prod.tags),
          specs: JSON.stringify(prod.specs),
          affiliateLinks: JSON.stringify(prod.affiliateLinks),
          editorialReview: JSON.stringify(prod.editorialReview),
          communityReviewCount: prod.communityReviewCount,
          communityRatingAverage: prod.communityRatingAverage,
          editorsChoice: Boolean(prod.editorsChoice),
        },
      });
    }

    // Seed Community Reviews
    for (const rev of INITIAL_COMMUNITY_REVIEWS) {
      await prisma.communityReview.upsert({
        where: { id: rev.id },
        update: {},
        create: {
          id: rev.id,
          productId: rev.productId,
          userName: rev.userName,
          userAvatar: rev.userAvatar || null,
          rating: rev.rating,
          metricScores: rev.metricScores ? JSON.stringify(rev.metricScores) : null,
          title: rev.title,
          comment: rev.comment,
          verifiedBuyer: rev.verifiedBuyer,
          helpfulCount: rev.helpfulCount,
          status: rev.status,
          photos: rev.photos ? JSON.stringify(rev.photos) : null,
          createdAt: new Date(rev.createdAt),
        },
      });
    }

    console.log('✅ Universal Review DB successfully seeded with initial catalog.');
  } catch (error) {
    console.error('Database seeding error:', error);
  }
}

// Categories
export async function getCategories(): Promise<Category[]> {
  await ensureSeeded();
  const rows = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    icon: r.icon,
    description: r.description,
    subcategories: JSON.parse(r.subcategories),
    metrics: JSON.parse(r.metrics),
  }));
}

export async function saveCategory(category: Category): Promise<Category> {
  const row = await prisma.category.upsert({
    where: { id: category.id },
    update: {
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      description: category.description,
      subcategories: JSON.stringify(category.subcategories),
      metrics: JSON.stringify(category.metrics),
    },
    create: {
      id: category.id,
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      description: category.description,
      subcategories: JSON.stringify(category.subcategories),
      metrics: JSON.stringify(category.metrics),
    },
  });

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    icon: row.icon,
    description: row.description,
    subcategories: JSON.parse(row.subcategories),
    metrics: JSON.parse(row.metrics),
  };
}

export async function updateCategoryMetrics(categoryId: string, metrics: CategoryMetric[]) {
  const row = await prisma.category.update({
    where: { id: categoryId },
    data: {
      metrics: JSON.stringify(metrics),
    },
  });

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    icon: row.icon,
    description: row.description,
    subcategories: JSON.parse(row.subcategories),
    metrics: JSON.parse(row.metrics),
  };
}

// Products
export async function getProducts(): Promise<Product[]> {
  await ensureSeeded();
  const rows = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    categoryId: p.categoryId,
    subcategory: p.subcategory,
    images: JSON.parse(p.images),
    releaseYear: p.releaseYear,
    priceEstimate: p.priceEstimate,
    currency: p.currency,
    tags: JSON.parse(p.tags),
    specs: JSON.parse(p.specs),
    affiliateLinks: JSON.parse(p.affiliateLinks),
    editorialReview: JSON.parse(p.editorialReview),
    communityReviewCount: p.communityReviewCount,
    communityRatingAverage: p.communityRatingAverage,
    editorsChoice: p.editorsChoice,
  }));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  await ensureSeeded();
  const p = await prisma.product.findUnique({
    where: { slug },
  });

  if (!p) return null;

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    categoryId: p.categoryId,
    subcategory: p.subcategory,
    images: JSON.parse(p.images),
    releaseYear: p.releaseYear,
    priceEstimate: p.priceEstimate,
    currency: p.currency,
    tags: JSON.parse(p.tags),
    specs: JSON.parse(p.specs),
    affiliateLinks: JSON.parse(p.affiliateLinks),
    editorialReview: JSON.parse(p.editorialReview),
    communityReviewCount: p.communityReviewCount,
    communityRatingAverage: p.communityRatingAverage,
    editorsChoice: p.editorsChoice,
  };
}

export async function saveProduct(product: Product): Promise<Product> {
  const p = await prisma.product.upsert({
    where: { id: product.id },
    update: {
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      categoryId: product.categoryId,
      subcategory: product.subcategory,
      images: JSON.stringify(product.images),
      releaseYear: product.releaseYear,
      priceEstimate: product.priceEstimate,
      currency: product.currency,
      tags: JSON.stringify(product.tags),
      specs: JSON.stringify(product.specs),
      affiliateLinks: JSON.stringify(product.affiliateLinks),
      editorialReview: JSON.stringify(product.editorialReview),
      communityReviewCount: product.communityReviewCount,
      communityRatingAverage: product.communityRatingAverage,
      editorsChoice: Boolean(product.editorsChoice),
    },
    create: {
      id: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      categoryId: product.categoryId,
      subcategory: product.subcategory,
      images: JSON.stringify(product.images),
      releaseYear: product.releaseYear,
      priceEstimate: product.priceEstimate,
      currency: product.currency,
      tags: JSON.stringify(product.tags),
      specs: JSON.stringify(product.specs),
      affiliateLinks: JSON.stringify(product.affiliateLinks),
      editorialReview: JSON.stringify(product.editorialReview),
      communityReviewCount: product.communityReviewCount,
      communityRatingAverage: product.communityRatingAverage,
      editorsChoice: Boolean(product.editorsChoice),
    },
  });

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    categoryId: p.categoryId,
    subcategory: p.subcategory,
    images: JSON.parse(p.images),
    releaseYear: p.releaseYear,
    priceEstimate: p.priceEstimate,
    currency: p.currency,
    tags: JSON.parse(p.tags),
    specs: JSON.parse(p.specs),
    affiliateLinks: JSON.parse(p.affiliateLinks),
    editorialReview: JSON.parse(p.editorialReview),
    communityReviewCount: p.communityReviewCount,
    communityRatingAverage: p.communityRatingAverage,
    editorsChoice: p.editorsChoice,
  };
}

export async function deleteProduct(id: string): Promise<boolean> {
  await prisma.product.delete({
    where: { id },
  });
  return true;
}

// Community Reviews
export async function getCommunityReviews(productId?: string): Promise<CommunityReview[]> {
  await ensureSeeded();
  const rows = await prisma.communityReview.findMany({
    where: productId ? { productId } : undefined,
    orderBy: { createdAt: 'desc' },
  });

  return rows.map((r) => ({
    id: r.id,
    productId: r.productId,
    userName: r.userName,
    userAvatar: r.userAvatar || undefined,
    rating: r.rating,
    metricScores: r.metricScores ? JSON.parse(r.metricScores) : undefined,
    title: r.title,
    comment: r.comment,
    verifiedBuyer: r.verifiedBuyer,
    helpfulCount: r.helpfulCount,
    status: r.status as 'approved' | 'pending' | 'flagged',
    photos: r.photos ? JSON.parse(r.photos) : undefined,
    createdAt: r.createdAt.toISOString().split('T')[0],
  }));
}

export async function createCommunityReview(
  rev: Omit<CommunityReview, 'id' | 'createdAt' | 'helpfulCount' | 'status'>
): Promise<CommunityReview> {
  const newId = `cr-${Date.now()}`;
  const row = await prisma.communityReview.create({
    data: {
      id: newId,
      productId: rev.productId,
      userName: rev.userName,
      userAvatar: rev.userAvatar || null,
      rating: rev.rating,
      metricScores: rev.metricScores ? JSON.stringify(rev.metricScores) : null,
      title: rev.title,
      comment: rev.comment,
      verifiedBuyer: rev.verifiedBuyer,
      helpfulCount: 0,
      status: 'approved',
      photos: rev.photos ? JSON.stringify(rev.photos) : null,
    },
  });

  // Re-calculate product community stats
  const allProductReviews = await prisma.communityReview.findMany({
    where: { productId: rev.productId, status: 'approved' },
  });

  const count = allProductReviews.length;
  const avg = count > 0 ? allProductReviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;

  await prisma.product.update({
    where: { id: rev.productId },
    data: {
      communityReviewCount: count,
      communityRatingAverage: Math.round(avg * 10) / 10,
    },
  });

  return {
    id: row.id,
    productId: row.productId,
    userName: row.userName,
    userAvatar: row.userAvatar || undefined,
    rating: row.rating,
    metricScores: row.metricScores ? JSON.parse(row.metricScores) : undefined,
    title: row.title,
    comment: row.comment,
    verifiedBuyer: row.verifiedBuyer,
    helpfulCount: row.helpfulCount,
    status: row.status as 'approved' | 'pending' | 'flagged',
    photos: row.photos ? JSON.parse(row.photos) : undefined,
    createdAt: row.createdAt.toISOString().split('T')[0],
  };
}

export async function voteHelpful(reviewId: string): Promise<number> {
  const row = await prisma.communityReview.update({
    where: { id: reviewId },
    data: {
      helpfulCount: { increment: 1 },
    },
  });
  return row.helpfulCount;
}

export async function updateReviewStatus(
  reviewId: string,
  status: 'approved' | 'flagged'
): Promise<boolean> {
  await prisma.communityReview.update({
    where: { id: reviewId },
    data: { status },
  });
  return true;
}

// Affiliate Click Tracking & Analytics
export async function recordAffiliateClick(params: {
  productId: string;
  storeName: string;
  url: string;
  userAgent?: string;
  referer?: string;
}) {
  await ensureSeeded();
  return prisma.affiliateClick.create({
    data: {
      productId: params.productId,
      storeName: params.storeName,
      url: params.url,
      userAgent: params.userAgent || null,
      referer: params.referer || null,
    },
  });
}

export async function getAffiliateAnalytics() {
  await ensureSeeded();
  const totalClicks = await prisma.affiliateClick.count();

  // Group by store name
  const clicks = await prisma.affiliateClick.findMany({
    include: {
      product: {
        select: {
          id: true,
          name: true,
          brand: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const storeMap: Record<string, number> = {};
  const productMap: Record<string, { id: string; name: string; brand: string; count: number }> = {};

  clicks.forEach((c) => {
    storeMap[c.storeName] = (storeMap[c.storeName] || 0) + 1;
    if (c.product) {
      if (!productMap[c.product.id]) {
        productMap[c.product.id] = {
          id: c.product.id,
          name: c.product.name,
          brand: c.product.brand,
          count: 0,
        };
      }
      productMap[c.product.id].count += 1;
    }
  });

  const byStore = Object.entries(storeMap)
    .map(([storeName, count]) => ({ storeName, count }))
    .sort((a, b) => b.count - a.count);

  const topProducts = Object.values(productMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const recentClicks = clicks.slice(0, 10).map((c) => ({
    id: c.id,
    storeName: c.storeName,
    productName: c.product?.name || 'Unknown Product',
    url: c.url,
    createdAt: c.createdAt.toISOString(),
  }));

  return {
    totalClicks,
    byStore,
    topProducts,
    recentClicks,
  };
}
