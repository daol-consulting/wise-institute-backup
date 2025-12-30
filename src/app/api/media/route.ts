import { NextResponse } from 'next/server';
import { getMediaItems } from '@/lib/contentful';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    console.log('[API] Fetching media items...');
    const items = await getMediaItems();
    console.log('[API] Media items fetched:', items.length, 'items');
    return NextResponse.json(items);
  } catch (error) {
    console.error('[API] Error fetching media items:', error);
    if (error instanceof Error) {
      console.error('[API] Error message:', error.message);
      console.error('[API] Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Failed to fetch media items', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

