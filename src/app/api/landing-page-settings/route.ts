import { NextResponse } from 'next/server';
import { getLandingPageSettings } from '@/lib/landingPageSettings';
import { getMediaItems } from '@/lib/contentful';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const settings = await getLandingPageSettings();
    const mediaItems = await getMediaItems();

    if (!settings) {
      // Contentful에 설정이 없으면 fallback 이미지 반환
      return NextResponse.json({
        settings: {
          heroSlides: [],
          campaignItems: [],
          statsImage: '/gallery/wise3.webp',
          statsImageType: 'image',
          featureLeftImage: '/gallery/WiseInstitute.jpg',
          featureLeftImageType: 'image',
          featureRightImage: '/gallery/gallery.jpg',
          featureRightImageType: 'image',
          programStoryImages: ['/gallery/real_patient.jpg', '/gallery/wise.webp', '/gallery/wise2.webp'],
          programStoryImageTypes: ['image', 'image', 'image'],
        },
        mediaItems,
      });
    }

    // 미디어 아이템과 연결
    const heroSlidesWithMedia = settings.heroSlides.map(slide => {
      const mediaItem = mediaItems.find(m => m.id === slide.mediaItemId);
      return {
        ...slide,
        image: mediaItem?.thumbnail?.[0] || '',
        desktopImage: mediaItem?.thumbnail?.[1] || mediaItem?.thumbnail?.[0] || '',
      };
    });

    const campaignItemsWithMedia = (settings.campaignItems || []).map(item => {
      if (!item || !item.mediaItemId) {
        // mediaItemId가 없으면 빈 객체 반환 (필터링됨)
        return null;
      }
      const mediaItem = mediaItems.find(m => m.id === item.mediaItemId);
      const imageUrl = mediaItem?.thumbnail?.[0] || mediaItem?.images?.[0];
      const videoUrl = mediaItem?.videos?.[0];
      
      return {
        ...item,
        src: imageUrl || videoUrl || '',
        title: item.title || mediaItem?.title || '',
        description: item.description || '',
        ctaText: item.ctaText || 'LEARN MORE',
        ctaLink: item.ctaLink || '/programs',
        mediaItemId: item.mediaItemId,
      };
    }).filter(Boolean); // null 제거

    // Helper function: mediaItemId를 URL로 변환 (이미지 또는 비디오)
    const resolveMediaUrl = (mediaItemId: string | undefined, fallback: string): { url: string; type: 'image' | 'video' } => {
      if (!mediaItemId) {
        return { url: fallback, type: 'image' };
      }
      
      const mediaItem = mediaItems.find(m => m.id === mediaItemId);
      if (!mediaItem) {
        return { url: fallback, type: 'image' };
      }
      
      // 비디오가 있으면 비디오 우선 사용
      if (mediaItem.videos && mediaItem.videos.length > 0) {
        return { url: mediaItem.videos[0], type: 'video' };
      }
      
      // 이미지 사용
      const imageUrl = mediaItem.thumbnail?.[0] || mediaItem.images?.[0];
      if (imageUrl) {
        return { url: imageUrl, type: 'image' };
      }
      
      // 미디어 아이템이 있지만 URL이 없으면 fallback 사용
      return { url: fallback, type: 'image' };
    };

    // 추가 이미지 필드 처리 (fallback 포함)
    const statsMedia = resolveMediaUrl(settings.statsImage, '/gallery/wise3.webp');
    const featureLeftMedia = resolveMediaUrl(settings.featureLeftImage, '/gallery/gallery.jpg');
    const featureRightMedia = resolveMediaUrl(settings.featureRightImage, '/gallery/wise2.webp');
    
    // programStoryImages 처리
    const defaultProgramStoryImages = ['/gallery/wise2.webp', '/gallery/wise.webp', '/gallery/wise3.webp'];
    let programStoryMediaUrls: Array<{ url: string; type: 'image' | 'video' }> = defaultProgramStoryImages.map(url => ({ url, type: 'image' as const }));
    
    if (settings.programStoryImages && settings.programStoryImages.length > 0) {
      programStoryMediaUrls = settings.programStoryImages.map((imgId, index) => {
        const fallback = defaultProgramStoryImages[index] || defaultProgramStoryImages[0];
        return resolveMediaUrl(imgId, fallback);
      });
    }

    return NextResponse.json({
      settings: {
        ...settings,
        heroSlides: heroSlidesWithMedia,
        campaignItems: campaignItemsWithMedia,
        statsImage: statsMedia.url,
        statsImageType: statsMedia.type,
        featureLeftImage: featureLeftMedia.url,
        featureLeftImageType: featureLeftMedia.type,
        featureRightImage: featureRightMedia.url,
        featureRightImageType: featureRightMedia.type,
        programStoryImages: programStoryMediaUrls.map(m => m.url),
        programStoryImageTypes: programStoryMediaUrls.map(m => m.type),
      },
      mediaItems,
    });
  } catch (error) {
    console.error('Error fetching landing page settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch landing page settings' },
      { status: 500 }
    );
  }
}

