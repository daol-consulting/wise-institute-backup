/**
 * Contentful에서 중복된 뉴스 항목을 찾아 삭제하는 스크립트
 * 실행: npm run remove-duplicate-news
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// .env.local 파일 로드
config({ path: resolve(process.cwd(), '.env.local') });

import { getManagementEnv } from '../src/lib/contentfulManagement';

async function removeDuplicateNews() {
  try {
    console.log('🔍 Contentful에서 중복된 뉴스 항목 찾기...\n');
    
    const { env } = await getManagementEnv();
    
    // 모든 newsItem 항목 가져오기
    const entries = await env.getEntries({
      content_type: 'newsItem',
      limit: 1000,
    });
    
    console.log(`📰 총 ${entries.items.length}개의 뉴스 항목 발견\n`);
    
    // 제목별로 그룹화하여 중복 찾기
    const titleMap = new Map<string, any[]>();
    
    entries.items.forEach((entry: any) => {
      const title = entry.fields?.title?.['en-US'] || '';
      if (!titleMap.has(title)) {
        titleMap.set(title, []);
      }
      titleMap.get(title)!.push(entry);
    });
    
    // 중복된 항목 찾기 (같은 제목이 2개 이상인 경우)
    const duplicates: Array<{ title: string; entries: any[] }> = [];
    titleMap.forEach((entries, title) => {
      if (entries.length > 1) {
        duplicates.push({ title, entries });
      }
    });
    
    if (duplicates.length === 0) {
      console.log('✅ 중복된 뉴스 항목이 없습니다.');
      return;
    }
    
    console.log(`⚠️  ${duplicates.length}개의 중복된 제목 발견:\n`);
    
    let totalDeleted = 0;
    
    for (const { title, entries: duplicateEntries } of duplicates) {
      console.log(`\n📰 "${title}" - ${duplicateEntries.length}개 발견`);
      
      // 최신 항목(가장 최근에 생성된 것)을 제외하고 나머지 삭제
      // 또는 가장 최근에 수정된 것을 제외
      const sorted = duplicateEntries.sort((a, b) => {
        const aUpdated = new Date(a.sys.updatedAt).getTime();
        const bUpdated = new Date(b.sys.updatedAt).getTime();
        return bUpdated - aUpdated; // 최신순
      });
      
      // 첫 번째 항목(가장 최신)은 유지, 나머지 삭제
      const toKeep = sorted[0];
      const toDelete = sorted.slice(1);
      
      console.log(`  ✅ 유지: ${toKeep.sys.id} (${new Date(toKeep.sys.updatedAt).toLocaleString()})`);
      
      for (const entry of toDelete) {
        try {
          console.log(`  🗑️  삭제 중: ${entry.sys.id}...`);
          
          // Published된 경우 먼저 unpublish
          try {
            const entryObj = await env.getEntry(entry.sys.id);
            if ((entryObj as any).isPublished()) {
              await entryObj.unpublish();
              console.log(`    ✅ Unpublished`);
            }
          } catch (unpublishError) {
            // 이미 unpublished이거나 오류가 발생해도 계속 진행
          }
          
          // Entry 삭제
          const entryToDelete = await env.getEntry(entry.sys.id);
          await entryToDelete.delete();
          console.log(`    ✅ 삭제 완료`);
          totalDeleted++;
        } catch (error: any) {
          console.error(`    ❌ 삭제 실패: ${error.message}`);
        }
      }
    }
    
    console.log(`\n\n✅ 완료! 총 ${totalDeleted}개의 중복 항목이 삭제되었습니다.`);
    
  } catch (error: any) {
    console.error('❌ 스크립트 실행 실패:', error.message);
    if (error.details) {
      console.error('상세:', JSON.stringify(error.details, null, 2));
    }
    process.exit(1);
  }
}

removeDuplicateNews();

