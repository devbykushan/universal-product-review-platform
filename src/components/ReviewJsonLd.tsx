import React from 'react';
import { Product } from '../types';

interface ReviewJsonLdProps {
  product: Product;
}

export function ReviewJsonLd({ product }: ReviewJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.editorialReview.verdictShort,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.communityRatingAverage,
      reviewCount: product.communityReviewCount || 1,
      bestRating: '5',
      worstRating: '1',
    },
    review: {
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: (product.editorialReview.overallScore / 2).toFixed(1), // Normalize 10 to 5-star standard
        bestRating: '5',
        worstRating: '1',
      },
      author: {
        '@type': 'Person',
        name: product.editorialReview.author.name,
        jobTitle: product.editorialReview.author.role,
      },
      datePublished: product.editorialReview.publishedAt,
      reviewBody: product.editorialReview.verdictDetail,
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: product.currency,
      lowPrice: product.priceEstimate,
      highPrice: product.priceEstimate * 1.1,
      offerCount: product.affiliateLinks.length,
      offers: product.affiliateLinks.map((link) => ({
        '@type': 'Offer',
        price: link.price,
        priceCurrency: link.currency,
        seller: {
          '@type': 'Organization',
          name: link.storeName,
        },
        url: link.url,
        availability: link.inStock
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      })),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
