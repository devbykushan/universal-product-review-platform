import { Metadata } from 'next';
import { getProductBySlug } from '@/lib/db-service';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://universalreview.com';

  if (!product) {
    return {
      title: 'Review Not Found | UniversalReview',
      description: 'The requested product review could not be found.',
    };
  }

  const title = `${product.name} Review (${product.editorialReview.overallScore}/10) | UniversalReview`;
  const description = `${product.editorialReview.verdictShort} Read in-depth laboratory analysis, dynamic criteria radar scores, and verified buyer discussions.`;
  const imageUrl = product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/product/${product.slug}`,
      siteName: 'UniversalReview Platform',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      type: 'article',
      publishedTime: product.editorialReview.publishedAt,
      modifiedTime: product.editorialReview.updatedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `${baseUrl}/product/${product.slug}`,
    },
  };
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
