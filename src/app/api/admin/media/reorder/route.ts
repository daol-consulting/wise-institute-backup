import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/contentfulManagement';

// 인증 체크 함수
function isAuthenticated(request: NextRequest): boolean {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return false;

  const sessionCookie = cookieHeader
    .split(';')
    .find(cookie => cookie.trim().startsWith('admin-session='));

  if (!sessionCookie) return false;

  try {
    const sessionValue = sessionCookie.split('=')[1];
    const decodedSession = decodeURIComponent(sessionValue);
    const sessionData = JSON.parse(Buffer.from(decodedSession, 'base64').toString());
    
    if (!sessionData.user || !sessionData.expires) return false;
    if (new Date() > new Date(sessionData.expires)) return false;
    
    return true;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { itemIds } = await request.json();

    if (!Array.isArray(itemIds)) {
      return NextResponse.json({ error: 'Invalid item IDs' }, { status: 400 });
    }

    const client = await createClient();
    const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID!);
    const environment = await space.getEnvironment('master');

    const backup: Array<{id: string, order: number, published: boolean}> = [];
    
    for (const itemId of itemIds) {
      try {
        const entry = await environment.getEntry(itemId);
        backup.push({
          id: itemId,
          order: entry.fields.order?.['en-US'] || 0,
          published: entry.isPublished()
        });
      } catch (error) {
        console.error(`Failed to backup item ${itemId}:`, error);
      }
    }

    const updateResults: Array<{id: string, success: boolean, error?: string}> = [];
    const totalItems = itemIds.length;
    
    for (let i = 0; i < itemIds.length; i++) {
      try {
        const entry = await environment.getEntry(itemIds[i]);
        const wasPublished = entry.isPublished();
        
        if (wasPublished) {
          await entry.unpublish();
          const refreshedEntry = await environment.getEntry(itemIds[i]);
          refreshedEntry.fields.order = { 'en-US': i };
          await refreshedEntry.update();
        } else {
          entry.fields.order = { 'en-US': i };
          await entry.update();
        }
        
        if (wasPublished) {
          const finalEntry = await environment.getEntry(itemIds[i]);
          await finalEntry.publish();
        }
        
        updateResults.push({ id: itemIds[i], success: true });
        
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        updateResults.push({ id: itemIds[i], success: false, error: errorMsg });
        console.error(`Failed to update order for item ${itemIds[i]}:`, error);
      }
    }

    const failedUpdates = updateResults.filter(result => !result.success);
    if (failedUpdates.length > 0) {
      try {
        for (const backupItem of backup) {
          try {
            const entry = await environment.getEntry(backupItem.id);
            const isCurrentlyPublished = entry.isPublished();
            
            if (isCurrentlyPublished !== backupItem.published) {
              if (backupItem.published && !isCurrentlyPublished) {
                await entry.publish();
              } else if (!backupItem.published && isCurrentlyPublished) {
                await entry.unpublish();
              }
            }
            
            entry.fields.order = { 'en-US': backupItem.order };
            await entry.update();
          } catch (rollbackError) {
            console.error(`Failed to rollback item ${backupItem.id}:`, rollbackError);
          }
        }
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError);
      }
      
      return NextResponse.json({ 
        error: 'Some updates failed and rollback attempted', 
        failedUpdates,
        backup 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, backup, progress: 100 });
  } catch (error) {
    console.error('Error updating media order:', error);
    return NextResponse.json({ error: 'Failed to update media order' }, { status: 500 });
  }
}

