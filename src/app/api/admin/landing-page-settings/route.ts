import { NextResponse } from 'next/server';
import { getManagementEnv } from '@/lib/contentfulManagement';

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

export async function GET(request: Request) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { env } = await getManagementEnv();
    
    const response = await env.getEntries({
      content_type: 'landingPageSettings',
      limit: 1,
    });

    if (response.items.length === 0) {
      return NextResponse.json({ settings: null });
    }

    const item = response.items[0];
    const fields = item.fields as any;

    return NextResponse.json({
      settings: {
        id: item.sys.id,
        heroSlides: fields.heroSlides?.['en-US'] || [],
        campaignItems: fields.campaignItems?.['en-US'] || [],
        statsImage: fields.statsImage?.['en-US'] || undefined,
        featureLeftImage: fields.featureLeftImage?.['en-US'] || undefined,
        featureRightImage: fields.featureRightImage?.['en-US'] || undefined,
        programStoryImages: fields.programStoryImages?.['en-US'] || undefined,
      },
    });
  } catch (error: any) {
    console.error('Error fetching landing page settings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch landing page settings' },
      { status: 500 }
    );
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

    const body = await request.json();
    const { heroSlides, campaignItems, statsImage, featureLeftImage, featureRightImage, programStoryImages } = body;

    const { env } = await getManagementEnv();

    // 기존 설정 확인
    const existingResponse = await env.getEntries({
      content_type: 'landingPageSettings',
      limit: 1,
    });

    let entry;
    if (existingResponse.items.length > 0) {
      // 업데이트
      entry = existingResponse.items[0];
      
      // Published된 entry를 업데이트하기 전에 unpublish해야 할 수 있음
      try {
        if ((entry as any).isPublished && (entry as any).isPublished()) {
          entry = await entry.unpublish();
        }
      } catch (unpublishError) {
        // 이미 unpublish된 경우 무시
        console.warn('Failed to unpublish entry (may already be unpublished):', unpublishError);
      }
      
      // 개별 필드만 업데이트 (기존 필드 유지)
      (entry.fields as any).heroSlides = { 'en-US': heroSlides || [] };
      (entry.fields as any).campaignItems = { 'en-US': campaignItems || [] };
      
      // undefined가 아닌 필드만 업데이트 (필드가 존재하는 경우에만)
      const contentType = await env.getContentType('landingPageSettings');
      const fieldIds = contentType.fields.map((f: any) => f.id);
      
      if (statsImage !== undefined && fieldIds.includes('statsImage')) {
        (entry.fields as any).statsImage = { 'en-US': statsImage };
      }
      if (featureLeftImage !== undefined && fieldIds.includes('featureLeftImage')) {
        (entry.fields as any).featureLeftImage = { 'en-US': featureLeftImage };
      }
      if (featureRightImage !== undefined && fieldIds.includes('featureRightImage')) {
        (entry.fields as any).featureRightImage = { 'en-US': featureRightImage };
      }
      if (programStoryImages !== undefined && fieldIds.includes('programStoryImages')) {
        (entry.fields as any).programStoryImages = { 'en-US': programStoryImages };
      }
      
      entry = await entry.update();
    } else {
      // 생성
      const fieldsToCreate: any = {
        heroSlides: { 'en-US': heroSlides || [] },
        campaignItems: { 'en-US': campaignItems || [] },
      };
      
      // undefined가 아닌 필드만 추가
      if (statsImage) {
        fieldsToCreate.statsImage = { 'en-US': statsImage };
      }
      if (featureLeftImage) {
        fieldsToCreate.featureLeftImage = { 'en-US': featureLeftImage };
      }
      if (featureRightImage) {
        fieldsToCreate.featureRightImage = { 'en-US': featureRightImage };
      }
      if (programStoryImages) {
        fieldsToCreate.programStoryImages = { 'en-US': programStoryImages };
      }
      
      entry = await env.createEntry('landingPageSettings', {
        fields: fieldsToCreate,
      });
    }

    // Publish
    const published = await entry.publish();

    return NextResponse.json({ id: published.sys.id }, { status: 200 });
  } catch (error: any) {
    console.error('Error saving landing page settings:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      details: error.response?.data || error.details,
      stack: error.stack,
    });
    return NextResponse.json(
      { 
        error: error.message || 'Failed to save landing page settings',
        details: error.response?.data || error.details,
      },
      { status: 500 }
    );
  }
}

