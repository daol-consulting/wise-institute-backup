import { client } from './contentful';

export type LandingPageSettings = {
  id: string;
  heroSlides: Array<{
    mediaItemId: string;
    subtitle?: string;
    title: string;
    description?: string;
    ctaText?: string;
    ctaLink?: string;
    slideLabel?: string;
  }>;
  campaignItems: Array<{
    mediaItemId: string;
    title?: string;
    description?: string;
    ctaText?: string;
    ctaLink?: string;
  }>;
  statsImage?: string; // StatsSection 이미지
  featureLeftImage?: string; // FeatureLinksSection 왼쪽 이미지
  featureRightImage?: string; // FeatureLinksSection 오른쪽 이미지
  programStoryImages?: string[]; // ProgramInfoSection 스토리 이미지들
};

export async function getLandingPageSettings(): Promise<LandingPageSettings | null> {
  try {
    const response = await client.getEntries({
      content_type: 'landingPageSettings',
      limit: 1,
    });

    if (response.items.length === 0) {
      return null;
    }

    const item = response.items[0];
    const fields = item.fields as any;

    return {
      id: item.sys.id,
      heroSlides: fields.heroSlides?.['en-US'] || [],
      campaignItems: fields.campaignItems?.['en-US'] || [],
      statsImage: fields.statsImage?.['en-US'] || undefined,
      featureLeftImage: fields.featureLeftImage?.['en-US'] || undefined,
      featureRightImage: fields.featureRightImage?.['en-US'] || undefined,
      programStoryImages: fields.programStoryImages?.['en-US'] || undefined,
    };
  } catch (error) {
    console.error('Error fetching landing page settings:', error);
    return null;
  }
}

