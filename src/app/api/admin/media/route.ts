import { NextResponse } from 'next/server';
import { getManagementEnv, uploadImage } from '@/lib/contentfulManagement';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// 세션 기반 인증 확인
function isAuthenticated(request: Request): boolean {
  const cookieHeader = request.headers.get('cookie');
  
  if (!cookieHeader) return false;

  const sessionCookie = cookieHeader
    .split(';')
    .find(cookie => cookie.trim().startsWith('admin-session='));
  
  if (!sessionCookie) return false;

  try {
    const sessionValue = sessionCookie.split('=')[1];
    const decodedValue = decodeURIComponent(sessionValue);
    const sessionData = JSON.parse(Buffer.from(decodedValue, 'base64').toString());
    
    if (!sessionData.user || !sessionData.expires) return false;
    if (new Date() > new Date(sessionData.expires)) return false;
    
    return true;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const title = String(formData.get('title') || '').trim();
    const category = String(formData.get('category') || '').trim() || undefined;
    const description = String(formData.get('description') || '').trim() || undefined;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    let env;
    try {
      const result = await getManagementEnv();
      env = result.env;
    } catch (envError: any) {
      console.error('Failed to get Contentful environment:', envError);
      if (envError.name === 'OrganizationAccessGrantRequired' || envError.status === 401) {
        return NextResponse.json(
          { 
            error: 'Contentful Management API token does not have access. Please check your CONTENTFUL_MANAGEMENT_TOKEN in .env.local',
            details: 'The token may be invalid, expired, or does not have access to the Space. Generate a new token from Contentful Settings > API keys > Content management tokens'
          },
          { status: 401 }
        );
      }
      throw envError;
    }

    const thumbFiles = formData.getAll('thumbnail').filter((f): f is File => f instanceof File && f.size > 0);
    const imageFiles = formData.getAll('images').filter((f): f is File => f instanceof File && f.size > 0);
    const videoFiles = formData.getAll('videos').filter((f): f is File => f instanceof File && f.size > 0);

    let thumbAssets: any[] = [];
    let imageAssets: any[] = [];
    let videoAssets: any[] = [];

    try {
      [thumbAssets, imageAssets] = await Promise.all([
        thumbFiles.length > 0 ? Promise.all(thumbFiles.map((f) => uploadImage(env, f))) : Promise.resolve([]),
        imageFiles.length > 0 ? Promise.all(imageFiles.map((f) => uploadImage(env, f))) : Promise.resolve([]),
      ]);

      // 비디오 파일 처리 (Contentful에 직접 업로드)
      if (videoFiles.length > 0) {
        for (const videoFile of videoFiles) {
          const arrayBuffer = await videoFile.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const videoAsset = await env.createAssetFromFiles({
            fields: {
              title: { 'en-US': videoFile.name },
              description: { 'en-US': videoFile.name },
              file: {
                'en-US': {
                  contentType: videoFile.type,
                  fileName: videoFile.name,
                  file: buffer as any,
                },
              },
            },
          });
          
          // Process asset and wait for completion with polling
          let processed = await videoAsset.processForAllLocales();
          
          // Poll until asset is processed (max 2 minutes)
          const maxAttempts = 60; // 60 attempts * 2 seconds = 2 minutes
          let attempts = 0;
          while (attempts < maxAttempts) {
            try {
              // Refresh asset to check processing status
              const refreshed = await env.getAsset(processed.sys.id);
              if (refreshed.fields?.file?.['en-US']?.url) {
                // Asset is processed
                processed = refreshed;
                break;
              }
            } catch (err) {
              // Asset might not be ready yet, continue polling
            }
            
            // Wait 2 seconds before next attempt
            await new Promise(resolve => setTimeout(resolve, 2000));
            attempts++;
            
            // Refresh processed asset
            try {
              processed = await env.getAsset(processed.sys.id);
            } catch (err) {
              // Continue polling
            }
          }
          
          if (attempts >= maxAttempts) {
            console.warn(`Video asset ${processed.sys.id} processing timeout, but continuing...`);
          }
          
          const published = await processed.publish();
          videoAssets.push(published);
        }
      }
    } catch (uploadError: any) {
      console.error('Media upload error:', uploadError);
      return NextResponse.json(
        { error: `Media upload failed: ${uploadError.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    const nextOrder = -1;

    // 필드 객체 구성 (undefined 필드는 제외)
    const fields: any = {
        title: { 'en-US': title },
        order: { 'en-US': nextOrder },
    };

    // Optional 필드 추가
    if (category) {
      fields.category = { 'en-US': category };
    }
    if (description) {
      fields.description = { 'en-US': description };
    }
    if (thumbAssets.length > 0) {
      fields.thumbnail = {
              'en-US': thumbAssets.map((asset) => ({ sys: { type: 'Link', linkType: 'Asset', id: asset.sys.id } })),
      };
            }
    if (imageAssets.length > 0) {
      fields.images = {
              'en-US': imageAssets.map((asset) => ({ sys: { type: 'Link', linkType: 'Asset', id: asset.sys.id } })),
      };
            }
    if (videoAssets.length > 0) {
      fields.videos = {
              'en-US': videoAssets.map((asset) => ({ sys: { type: 'Link', linkType: 'Asset', id: asset.sys.id } })),
      };
    }

    // Content type 확인 - wiseInstitute 사용
    const contentTypeId = 'wiseInstitute';
    try {
      const contentType = await env.getContentType('wiseInstitute');
      console.log('Content type found:', contentType.sys.id, contentType.name);
    } catch (error: any) {
      console.error('Content type not found. Error:', error.message);
      return NextResponse.json(
        { 
          error: 'Content type "wiseInstitute" not found in Contentful',
          details: {
            message: 'The "Wise Institute" content type must exist in Contentful',
            steps: [
              '1. Go to Contentful dashboard',
              '2. Navigate to Content model',
              '3. Check if "Wise Institute" content type exists',
              '4. API identifier should be "wiseInstitute"'
            ]
          }
        },
        { status: 400 }
      );
    }

    const entry = await env.createEntry(contentTypeId, { fields });

    const published = await entry.publish();

    return NextResponse.json({ id: published.sys.id }, { status: 201 });
  } catch (err: any) {
    console.error('Admin create media error:', err);
    
    if (err.details) {
      return NextResponse.json(
        { 
          error: err.message || 'Internal Server Error',
          details: err.details,
          requestId: err.requestId
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      },
      { status: 500 }
    );
  }
}

