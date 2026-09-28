import { NextResponse } from 'next/server';
import { generateEditorialReviewDraft } from '@/lib/gemini';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const body = await req.json();
    const { productName, brand, categoryName, subcategory, price, metrics } = body;

    if (!productName || !brand) {
      return NextResponse.json({ error: 'Product name and brand are required' }, { status: 400 });
    }

    const draft = await generateEditorialReviewDraft({
      productName,
      brand,
      categoryName: categoryName || 'Tech',
      subcategory: subcategory || 'Gadgets',
      price: Number(price) || 99,
      metrics: Array.isArray(metrics) ? metrics : [],
    });

    return NextResponse.json(draft);
  } catch (error) {
    console.error('Error in AI generate-review API:', error);
    return NextResponse.json({ error: 'Failed to generate review draft' }, { status: 500 });
  }
}
