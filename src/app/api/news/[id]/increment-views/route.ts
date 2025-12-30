import { NextResponse } from 'next/server';
import { getManagementEnv } from '@/lib/contentfulManagement';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { env } = await getManagementEnv();
    
    // Get the entry
    const entry = await env.getEntry(params.id);
    
    const contentType = entry.sys.contentType?.sys?.id;
    if (contentType !== 'newsItem') {
      return NextResponse.json({ error: 'Not a news item entry' }, { status: 400 });
    }

    // Check if views field exists
    const currentViews = (entry.fields as any).views?.['en-US'] || 0;
    
    // Unpublish if published
    let wasPublished = false;
    try {
      if ((entry as any).isPublished && (entry as any).isPublished()) {
        wasPublished = true;
        await entry.unpublish();
        // Get fresh entry after unpublish
        const refreshedEntry = await env.getEntry(params.id);
        (refreshedEntry.fields as any).views = { 'en-US': currentViews + 1 };
        await refreshedEntry.update();
        await refreshedEntry.publish();
      } else {
        (entry.fields as any).views = { 'en-US': currentViews + 1 };
        await entry.update();
      }
    } catch (error: any) {
      // If views field doesn't exist, try to update without it
      console.warn('Failed to update views (field may not exist):', error);
      return NextResponse.json({ 
        views: currentViews,
        message: 'Views field not found in Contentful. Please add a "views" field (Number type) to the newsItem content type.'
      }, { status: 200 });
    }

    return NextResponse.json({ views: currentViews + 1 }, { status: 200 });
  } catch (error: any) {
    console.error('Error incrementing views:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to increment views' },
      { status: 500 }
    );
  }
}

