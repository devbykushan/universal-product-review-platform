import { NextResponse } from 'next/server';
import { recordAffiliateClick, getAffiliateAnalytics } from '@/lib/db-service';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, storeName, url } = body;

    if (!productId || !storeName || !url) {
      return NextResponse.json({ error: 'Missing required click tracking parameters' }, { status: 400 });
    }

    const userAgent = req.headers.get('user-agent') || undefined;
    const referer = req.headers.get('referer') || undefined;

    await recordAffiliateClick({
      productId,
      storeName,
      url,
      userAgent,
      referer,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging affiliate click:', error);
    return NextResponse.json({ error: 'Failed to record click' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const analytics = await getAffiliateAnalytics();
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching affiliate analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
