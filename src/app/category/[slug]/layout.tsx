import { Metadata } from 'next';
import { getCategories } from '@/lib/db-service';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === params.slug);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://universalreview.com';

  if (!category) {
    return {
      title: 'Category Not Found | UniversalReview',
      description: 'The requested category could not be found.',
    };
  }

  const title = `Best ${category.name} Reviews & Lab Comparisons | UniversalReview`;
  const description = `${category.description} Browse top-rated products evaluated by dynamic criteria metrics and community reviews.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/category/${category.slug}`,
      siteName: 'UniversalReview Platform',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `${baseUrl}/category/${category.slug}`,
    },
  };
}

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
