import { client } from './contentful';

export type NewsItem = {
  id: string;
  category: string;
  categoryColor: 'blue' | 'teal' | 'gray';
  title: string;
  description: string;
  date: string;
  href?: string;
  image?: string;
  createdAt: string;
  order?: number;
  views?: number;
};

export async function getNewsItems(): Promise<NewsItem[]> {
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
    
    console.log('Fetching news items from Contentful...');
    
    // Published된 항목만 가져오기 (기본값이지만 명시적으로 설정)
    // include 파라미터로 linked assets 포함
    const response = await client.getEntries({
      content_type: 'newsItem',
      include: 10, // Linked assets를 포함하도록 설정
    });

    console.log('Contentful response:', response);
    console.log('Contentful response items count:', response.items.length);
    console.log('Includes:', response.includes ? Object.keys(response.includes) : 'none');

    const assetMap = new Map<string, any>();
    if (response.includes?.Asset) {
      response.includes.Asset.forEach((asset: any) => {
        assetMap.set(asset.sys.id, asset);
      });
    }

    const newsItems = response.items.map((item) => {
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

      const resolveAssetUrl = (link: any): string | null => {
        if (link?.sys?.type === 'Link' && link?.sys?.linkType === 'Asset') {
          const asset = assetMap.get(link.sys.id);
          if (asset?.fields?.file) {
            const file = asset.fields.file;
            const fileUrl = file?.['en-US']?.url || file?.url;
            if (fileUrl) {
              return `https:${fileUrl}${fileUrl.includes('?') ? '&' : '?'}fm=webp&q=100`;
            }
          }
        } else if (link?.fields?.file) {
          const file = link.fields.file;
          const fileUrl = file?.['en-US']?.url || file?.url;
          if (fileUrl) {
            return `https:${fileUrl}${fileUrl.includes('?') ? '&' : '?'}fm=webp&q=100`;
          }
        }
        return null;
      };

      const category = getField('category', '');
      const categoryColor = getField('categoryColor', 'gray');
      const title = getField('title', '');
      const description = getField('description', '');
      const date = getField('date', '');
      const href = getField('href', '/news');
      const order = getField('order', 0);
      const views = getField('views', 0);
      const imageField = getField('image', null);
      
      let image: string | undefined = undefined;
      if (imageField) {
        image = resolveAssetUrl(imageField) || undefined;
      }

      const mappedItem = {
      id: item.sys.id,
        category,
        categoryColor,
        title,
        description,
        date,
        href,
        image,
      createdAt: item.sys.createdAt || new Date().toISOString(),
        order: typeof order === 'number' ? order : 0,
        views: typeof views === 'number' ? views : 0,
      };

      if (response.items.indexOf(item) === 0) {
        console.log('Sample mapped item:', JSON.stringify(mappedItem, null, 2));
      }
      return mappedItem;
    });

    // 필터링 로직 일시적으로 비활성화 (디버깅용)
    const validItems = newsItems; // .filter(item => item.title && item.description && item.date);
    console.log(`Valid news items: ${validItems.length} out of ${newsItems.length}`);

    // 중복 제거
    const itemMap = new Map<string, NewsItem>();
    for (const item of validItems) {
      const existing = itemMap.get(item.id);
      if (!existing || new Date(item.createdAt).getTime() > new Date(existing.createdAt).getTime()) {
        itemMap.set(item.id, item);
      }
    }
    const uniqueItems = Array.from(itemMap.values());

    // order 필드로 정렬
    const sortedItems = uniqueItems.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      if (a.order !== undefined && b.order === undefined) {
        return -1;
      }
      if (a.order === undefined && b.order !== undefined) {
        return 1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return sortedItems;
  } catch (error: any) {
    console.error('❌ Error fetching news items from Contentful:', error);
    if (error instanceof Error) {
      console.error('  Error message:', error.message);
      console.error('  Error stack:', error.stack);
    }
    
    // Contentful SDK의 에러 구조 확인
    if (error.response) {
      console.error('  Contentful API response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      });
    }
    
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

