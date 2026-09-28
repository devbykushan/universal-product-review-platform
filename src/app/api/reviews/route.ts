import { NextResponse } from 'next/server';
import {
  getCommunityReviews,
  createCommunityReview,
  voteHelpful,
  updateReviewStatus,
} from '@/lib/db-service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId') || undefined;
    const reviews = await getCommunityReviews(productId);
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newRev = await createCommunityReview(body);
    return NextResponse.json(newRev, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { action, reviewId, status } = body;

    if (action === 'voteHelpful' && reviewId) {
      const helpfulCount = await voteHelpful(reviewId);
      return NextResponse.json({ success: true, helpfulCount });
    }

    if (action === 'updateStatus' && reviewId && status) {
      await updateReviewStatus(reviewId, status);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid PATCH action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}
