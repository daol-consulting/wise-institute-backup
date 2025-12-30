import { NextResponse } from 'next/server';
import { getManagementEnv, uploadImage } from '@/lib/contentfulManagement';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { env } = await getManagementEnv();
    const entry = await env.getEntry(params.id);

    const contentType = entry.sys.contentType?.sys?.id;
    if (contentType !== 'newsItem') {
      return NextResponse.json({ error: 'Not a news item entry' }, { status: 400 });
    }

    const formData = await request.formData();

    const updateField = (key: string, val?: string) => {
      if (val !== undefined && val !== '') {
        (entry.fields as any)[key] = { 'en-US': val };
      }
    };

    updateField('title', String(formData.get('title') || '').trim() || undefined);
    updateField('category', String(formData.get('category') || '').trim() || undefined);
    updateField('categoryColor', String(formData.get('categoryColor') || 'gray').trim() || undefined);
    updateField('description', String(formData.get('description') || '').trim() || undefined);
    updateField('date', String(formData.get('date') || '').trim() || undefined);
    
    // href 처리: 전체 URL만 허용, 상대 경로는 필드 제외
    const hrefInput = String(formData.get('href') || '').trim();
    if (hrefInput) {
      // 전체 URL인지 확인 (http:// 또는 https://로 시작)
      if (/^(https?|ftp):\/\//i.test(hrefInput)) {
        updateField('href', hrefInput);
      } else {
        // 상대 경로인 경우 필드를 제거 (null로 설정)
        (entry.fields as any).href = { 'en-US': null };
      }
    } else {
      // 빈 값인 경우 필드 제거
      (entry.fields as any).href = { 'en-US': null };
    }

    const imageFile = formData.get('image') as File | null;
    const clearImage = String(formData.get('clearImage') || '').toLowerCase() === 'true';

    if (clearImage) {
      (entry.fields as any).image = { 'en-US': null };
    } else if (imageFile && imageFile.size > 0) {
      const uploaded = await uploadImage(env, imageFile);
      (entry.fields as any).image = {
        'en-US': { sys: { type: 'Link', linkType: 'Asset', id: uploaded.sys.id } },
      };
    }

    const updated = await entry.update();
    const published = await updated.publish();
    
    return NextResponse.json({ id: published.sys.id }, { status: 200 });
  } catch (err: any) {
    console.error('Admin update news error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { env } = await getManagementEnv();
    const entry = await env.getEntry(params.id);

    try {
      if ((entry as any).isPublished()) {
        await entry.unpublish();
      }
    } catch (unpublishError) {
      console.warn('Failed to unpublish before deletion:', unpublishError);
    }

    await entry.delete();
    
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    console.error('Admin delete news error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

