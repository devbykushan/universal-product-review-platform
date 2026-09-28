import { NextResponse } from 'next/server';
import { summarizeProductReviews } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productName, category, overallScore, editorialVerdict, theGood, theBad, communityReviews } = body;

    if (!productName) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }

    const summary = await summarizeProductReviews({
      productName,
      category: category || 'General',
      overallScore: Number(overallScore) || 9.0,
      editorialVerdict,
      theGood,
      theBad,
      communityReviews: Array.isArray(communityReviews) ? communityReviews : [],
    });

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error in AI summarize API:', error);
    return NextResponse.json({ error: 'Failed to generate AI summary' }, { status: 500 });
  }
}
