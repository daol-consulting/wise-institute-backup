import { NextResponse } from 'next/server';
import { getNewsItems } from '@/lib/news';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    console.log('[API] Fetching news items...');
    const items = await getNewsItems();
    console.log('[API] News items fetched:', items.length, 'items');
    return NextResponse.json(items);
  } catch (error) {
    console.error('[API] Error fetching news items:', error);
    if (error instanceof Error) {
      console.error('[API] Error message:', error.message);
      console.error('[API] Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Failed to fetch news items', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

