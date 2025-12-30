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
    const category = String(formData.get('category') || '').trim();
    const categoryColor = String(formData.get('categoryColor') || 'gray').trim() as 'blue' | 'teal' | 'gray';
    const description = String(formData.get('description') || '').trim();
    const date = String(formData.get('date') || '').trim();
    const hrefInput = String(formData.get('href') || '/news').trim();

    if (!title || !category || !description || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // href가 상대 경로인 경우 전체 URL로 변환하거나 제외
    // Contentful의 URL 필드는 전체 URL만 허용
    let href: string | undefined = undefined;
    if (hrefInput) {
      // 전체 URL인지 확인 (http:// 또는 https://로 시작)
      if (/^(https?|ftp):\/\//i.test(hrefInput)) {
        href = hrefInput;
      } else if (hrefInput.startsWith('/')) {
        // 상대 경로인 경우, 실제 도메인을 모르므로 필드를 제외
        // 또는 placeholder URL 사용 (나중에 프론트엔드에서 처리)
        // href = `https://placeholder.com${hrefInput}`;
        // 상대 경로는 필드를 제외 (Contentful에서 optional로 설정되어 있어야 함)
        href = undefined;
      } else {
        // 그 외의 경우도 전체 URL로 간주하지 않음
        href = undefined;
      }
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

    const imageFile = formData.get('image') as File | null;
    let imageAsset: any = null;

    if (imageFile && imageFile.size > 0) {
      try {
        imageAsset = await uploadImage(env, imageFile);
      } catch (uploadError: any) {
        console.error('Image upload error:', uploadError);
        return NextResponse.json(
          { error: `Image upload failed: ${uploadError.message || 'Unknown error'}` },
          { status: 500 }
        );
      }
    }

    const nextOrder = -1;

    const fields: any = {
        title: { 'en-US': title },
        category: { 'en-US': category },
        categoryColor: { 'en-US': categoryColor },
        description: { 'en-US': description },
        date: { 'en-US': date },
        order: { 'en-US': nextOrder },
    };

    // href가 전체 URL인 경우에만 추가
    if (href) {
      fields.href = { 'en-US': href };
    }

    // image가 있는 경우에만 추가
    if (imageAsset) {
      fields.image = {
              'en-US': { sys: { type: 'Link', linkType: 'Asset', id: imageAsset.sys.id } },
      };
    }

    const entry = await env.createEntry('newsItem', { fields });
    console.log('News entry created:', entry.sys.id);

    const published = await entry.publish();
    console.log('News entry published:', published.sys.id);

    return NextResponse.json({ id: published.sys.id }, { status: 201 });
  } catch (err: any) {
    console.error('Admin create news error:', err);
    
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

