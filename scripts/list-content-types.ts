/**
 * Contentful의 모든 content type을 나열하는 스크립트
 * 실행: npm run list-content-types
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// .env.local 파일 로드
config({ path: resolve(process.cwd(), '.env.local') });

import { getManagementEnv } from '../src/lib/contentfulManagement';

async function listContentTypes() {
  try {
    console.log('📋 Contentful의 모든 content type 목록:\n');
    
    const { env } = await getManagementEnv();
    
    const contentTypes = await env.getContentTypes();
    
    console.log(`총 ${contentTypes.items.length}개의 content type이 있습니다:\n`);
    
    contentTypes.items.forEach((ct, index) => {
      console.log(`${index + 1}. 이름: "${ct.name}"`);
      console.log(`   API identifier: ${ct.sys.id}`);
      console.log(`   Published: ${ct.sys.publishedVersion ? 'Yes' : 'No'}`);
      console.log(`   필드 수: ${ct.fields.length}`);
      console.log('');
    });
    
    // mediaItem 관련 찾기
    const mediaItem = contentTypes.items.find(ct => 
      ct.sys.id === 'mediaItem' || 
      ct.name.toLowerCase().includes('media') ||
      ct.name.toLowerCase().includes('wise')
    );
    
    if (mediaItem) {
      console.log('\n📌 Media 관련 content type 발견:');
      console.log(`   이름: "${mediaItem.name}"`);
      console.log(`   API identifier: ${mediaItem.sys.id}`);
    }
    
  } catch (error: any) {
    console.error('❌ 오류 발생:', error.message);
    if (error.details) {
      console.error('상세 정보:', JSON.stringify(error.details, null, 2));
    }
    process.exit(1);
  }
}

listContentTypes();

