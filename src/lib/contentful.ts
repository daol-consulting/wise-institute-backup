import { createClient } from 'contentful';

// 클라이언트 컴포넌트에서 import할 수 있도록 초기화를 지연
function getClient() {
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
  const environment = process.env.CONTENTFUL_ENVIRONMENT || 'master';

  if (!spaceId || !accessToken) {
    console.warn('⚠️ Contentful 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인하세요.');
    throw new Error('CONTENTFUL_SPACE_ID and CONTENTFUL_ACCESS_TOKEN are required');
  }

  return createClient({
    space: spaceId,
    accessToken: accessToken,
    environment: environment,
  });
}

// 지연 초기화된 클라이언트
let clientInstance: ReturnType<typeof createClient> | null = null;

export const client = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    if (!clientInstance) {
      clientInstance = getClient();
    }
    return (clientInstance as any)[prop];
  }
});

export type MediaItem = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  thumbnail: string[];
  images: string[];
  videos?: string[];
  createdAt: string;
  order?: number;
};

export async function getMediaItems(): Promise<MediaItem[]> {
  try {
    const spaceId = process.env.CONTENTFUL_SPACE_ID;
    const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
    const environment = process.env.CONTENTFUL_ENVIRONMENT || 'master';
    
    if (!spaceId || !accessToken) {
      const error = new Error('CONTENTFUL_SPACE_ID and CONTENTFUL_ACCESS_TOKEN are required');
      console.error('❌ Contentful environment variables missing:', {
        hasSpaceId: !!spaceId,
        hasAccessToken: !!accessToken,
        environment,
      });
      throw error;
    }
    
    // Validate access token format (should not be empty and should have reasonable length)
    if (accessToken.length < 10) {
      const error = new Error('CONTENTFUL_ACCESS_TOKEN appears to be invalid (too short)');
      console.error('❌ Contentful access token validation failed:', {
        tokenLength: accessToken.length,
        tokenPrefix: accessToken.substring(0, 5) + '...',
      });
      throw error;
    }
    
    console.log('Fetching media items from Contentful...');
    console.log('Space ID:', spaceId);
    console.log('Environment:', environment);
    
    // wiseInstitute 또는 mediaItem content type 사용
    // include 파라미터로 linked assets 포함
    const response = await client.getEntries({
      content_type: 'wiseInstitute', // 기존 content type 사용
      include: 10, // 최대 10단계까지 linked assets 포함
    });

    console.log('Contentful response items count:', response.items.length);
    if (response.items.length > 0) {
      console.log('First item fields:', JSON.stringify(response.items[0].fields, null, 2));
      console.log('First item sys:', JSON.stringify(response.items[0].sys, null, 2));
    }
    console.log('Includes:', response.includes ? Object.keys(response.includes) : 'none');
    if (response.includes?.Asset) {
      console.log('Included assets count:', response.includes.Asset.length);
    }

    // Linked assets를 Map으로 변환 (빠른 조회를 위해)
    const assetMap = new Map<string, any>();
    if (response.includes?.Asset) {
      response.includes.Asset.forEach((asset: any) => {
        assetMap.set(asset.sys.id, asset);
      });
    }

    const mediaItems = response.items.map((item) => {
      const fields = (item.fields as any) || {};
      
      if (response.items.indexOf(item) === 0) {
        console.log('First item fields:', JSON.stringify(fields, null, 2));
      }
      
      // Contentful 필드는 'en-US' 로케일로 접근
      const getField = (fieldName: string, defaultValue: any = '') => {
        const field = fields[fieldName];
        if (!field) return defaultValue;
        // 로케일이 있는 경우
        if (typeof field === 'object' && field !== null && field['en-US'] !== undefined) {
          return field['en-US'];
        }
        // 직접 값인 경우
        return field || defaultValue;
      };

      const title = getField('title', '');
      const description = getField('description', '');
      const category = getField('category', '');
      const order = getField('order', 0);
      
      // Helper: Asset Link를 URL로 변환
      const resolveAssetUrl = (link: any, isVideo: boolean = false): string | null => {
        // Link 객체인 경우 (unresolved)
        if (link?.sys?.type === 'Link' && link?.sys?.linkType === 'Asset') {
          const asset = assetMap.get(link.sys.id);
          if (asset?.fields?.file) {
            const file = asset.fields.file;
            const fileUrl = file?.['en-US']?.url || file?.url;
            if (fileUrl) {
              if (isVideo) {
                return fileUrl.startsWith('//') ? `https:${fileUrl}` : fileUrl;
              }
              return `https:${fileUrl}${fileUrl.includes('?') ? '&' : '?'}fm=webp&q=100`;
            }
          }
        }
        // 이미 resolve된 Asset인 경우
        else if (link?.fields?.file) {
          const file = link.fields.file;
          const fileUrl = file?.['en-US']?.url || file?.url;
          if (fileUrl) {
            if (isVideo) {
              return fileUrl.startsWith('//') ? `https:${fileUrl}` : fileUrl;
            }
            return `https:${fileUrl}${fileUrl.includes('?') ? '&' : '?'}fm=webp&q=100`;
          }
        }
        return null;
      };
      
      // Thumbnail 처리
      const thumbnailField = getField('thumbnail', []);
      const thumbnail: string[] = [];
      if (Array.isArray(thumbnailField)) {
        thumbnailField.forEach((link: any) => {
          const url = resolveAssetUrl(link, false);
          if (url) thumbnail.push(url);
        });
      }
      
      // Images 처리
      const imagesField = getField('images', []);
      const images: string[] = [];
      if (Array.isArray(imagesField)) {
        imagesField.forEach((link: any) => {
          const url = resolveAssetUrl(link, false);
          if (url) images.push(url);
        });
      }
      
      // Videos 처리
      const videosField = getField('videos', []);
      const videos: string[] = [];
      if (Array.isArray(videosField)) {
        videosField.forEach((link: any) => {
          const url = resolveAssetUrl(link, true);
          if (url) videos.push(url);
        });
      }

      const mappedItem = {
      id: item.sys.id,
        title,
        description,
        category,
        thumbnail,
        images,
        videos,
      createdAt: item.sys.createdAt || new Date().toISOString(),
        order: typeof order === 'number' ? order : 0,
      };

      if (response.items.indexOf(item) === 0) {
        console.log('Sample mapped item:', JSON.stringify(mappedItem, null, 2));
      }
      return mappedItem;
    });

    // 필터링 로직 일시적으로 비활성화 (디버깅용)
    const validItems = mediaItems; // .filter(item => item.title);
    console.log(`Valid media items: ${validItems.length} out of ${mediaItems.length}`);

    // 중복 제거: 같은 ID를 가진 항목은 하나만 유지 (가장 최근 것 유지)
    const itemMap = new Map<string, MediaItem>();
    for (const item of validItems) {
      const existing = itemMap.get(item.id);
      if (!existing || new Date(item.createdAt).getTime() > new Date(existing.createdAt).getTime()) {
        itemMap.set(item.id, item);
      }
    }
    const uniqueItems = Array.from(itemMap.values());

    // order 필드로 정렬 (order가 없는 경우 createdAt으로 정렬)
    const sortedItems = uniqueItems.sort((a, b) => {
      // 둘 다 order가 있으면 order로 정렬 (작은 값이 위로)
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      // 하나만 order가 있으면 order가 있는 것을 앞으로
      if (a.order !== undefined && b.order === undefined) {
        return -1;
      }
      if (a.order === undefined && b.order !== undefined) {
        return 1;
      }
      // 둘 다 order가 없으면 createdAt으로 정렬 (최신순)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return sortedItems;
  } catch (error: any) {
    console.error('❌ Error fetching media items from Contentful:', error);
    if (error instanceof Error) {
      console.error('  Error message:', error.message);
      console.error('  Error stack:', error.stack);
    }
    const spaceId = process.env.CONTENTFUL_SPACE_ID;
    const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
    const environment = process.env.CONTENTFUL_ENVIRONMENT || 'master';
    
    // Contentful SDK의 에러 구조 확인
    if (error.response) {
      console.error('  Contentful API response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      });
    }
    
    console.error('Error details:', {
      spaceId,
      environment,
      hasAccessToken: !!accessToken,
      accessTokenLength: accessToken?.length || 0,
      accessTokenPrefix: accessToken ? accessToken.substring(0, 10) + '...' : 'N/A'
    });
    
    // 401 에러인 경우 더 명확한 메시지 제공
    if (error.response?.status === 401) {
      const authError = new Error('Contentful API authentication failed. Please check CONTENTFUL_ACCESS_TOKEN and CONTENTFUL_SPACE_ID in .env.local');
      (authError as any).response = error.response;
      throw authError;
    }
    
    // 에러를 다시 throw하여 API 라우트에서 처리할 수 있도록 함
    throw error;
  }
}

