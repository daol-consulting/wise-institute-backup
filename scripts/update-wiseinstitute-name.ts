/**
 * Contentful의 wiseInstitute content type 이름을 "Media Item"으로 변경하는 스크립트
 * 실행: npm run update-wise-name
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// .env.local 파일 로드
config({ path: resolve(process.cwd(), '.env.local') });

import { getManagementEnv } from '../src/lib/contentfulManagement';

async function updateWiseInstituteName() {
  try {
    console.log('📝 wiseInstitute content type 이름 확인 및 변경...\n');
    
    const { env } = await getManagementEnv();
    
    // Content type 가져오기
    const contentType = await env.getContentType('wiseInstitute');
    console.log(`현재 이름: "${contentType.name}"`);
    console.log(`API identifier: ${contentType.sys.id}`);
    console.log(`Published: ${contentType.sys.publishedVersion ? 'Yes' : 'No'}`);
    
    // 이름이 이미 "Media Item"이면 변경 불필요
    if (contentType.name === 'Media Item') {
      console.log('\n✅ 이미 이름이 "Media Item"으로 설정되어 있습니다.');
      return;
    }
    
    // 이름 변경
    console.log(`\n📝 이름을 "Media Item"으로 변경 중...`);
    
    // Unpublish 필요 (이름 변경은 published 상태에서 불가능)
    if (contentType.sys.publishedVersion) {
      console.log('📤 Content type을 unpublish 중...');
      await contentType.unpublish();
      // 다시 가져오기
      const refreshed = await env.getContentType('wiseInstitute');
      refreshed.name = 'Media Item';
      const updated = await refreshed.update();
      console.log('✅ 이름 변경 완료');
      console.log(`   새 이름: "${updated.name}"`);
      
      console.log('\n📤 Content type을 다시 활성화 중...');
      const published = await updated.publish();
      console.log('✅ Content type 활성화 완료!');
    } else {
      contentType.name = 'Media Item';
      const updated = await contentType.update();
      console.log('✅ 이름 변경 완료');
      console.log(`   새 이름: "${updated.name}"`);
    }
    
    console.log('\n\n✅ wiseInstitute content type 이름 변경 완료!');
    console.log('⚠️  참고: API identifier는 변경할 수 없습니다. 코드에서는 "wiseInstitute"를 사용합니다.');
    
  } catch (error: any) {
    console.error('❌ 오류 발생:', error.message);
    if (error.details) {
      console.error('상세 정보:', JSON.stringify(error.details, null, 2));
    }
    if (error.requestId) {
      console.error('Request ID:', error.requestId);
    }
    process.exit(1);
  }
}

updateWiseInstituteName();

