/**
 * 기존 뉴스 데이터를 Contentful에 추가하는 스크립트
 * 실행: npm run add-news
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// .env.local 파일 로드
config({ path: resolve(process.cwd(), '.env.local') });

import { getManagementEnv } from '../src/lib/contentfulManagement';

const newsItems = [
  {
    id: '10',
    category: 'Institute News',
    categoryColor: 'blue' as const,
    title: 'New 2025 Implant Residency Program Dates Announced',
    description: 'WISE Institute is pleased to announce the new dates for the 2025 Implant Residency Program. This comprehensive program offers hands-on training and advanced techniques in implant dentistry.',
    date: '2025-01-15',
    href: '/news/10',
    order: 0,
  },
  {
    id: '9',
    category: 'Press Release',
    categoryColor: 'teal' as const,
    title: 'WISE Institute Partners with HiOssen for Enhanced Training',
    description: 'WISE Institute announces a strategic partnership with HiOssen to provide enhanced training opportunities and access to cutting-edge implant technology for our residents.',
    date: '2025-12-10',
    href: '/news/9',
    order: 1,
  },
  {
    id: '8',
    category: 'Institute News',
    categoryColor: 'blue' as const,
    title: 'Record Number of Doctors Complete 2025 Residency Program',
    description: 'This year marks a milestone as a record number of doctors successfully completed the WISE Institute Residency Program, demonstrating our commitment to excellence in dental education.',
    date: '2025-11-20',
    href: '/news/8',
    order: 2,
  },
  {
    id: '7',
    category: 'Press Release',
    categoryColor: 'teal' as const,
    title: 'WISE Institute Live Surgery Featured at PDC 2025',
    description: 'WISE Institute was honored to feature live surgery demonstrations at the prestigious PDC 2025 conference, showcasing advanced implant techniques to an international audience.',
    date: '2025-10-05',
    href: '/news/7',
    order: 3,
  },
  {
    id: '6',
    category: 'Institute News',
    categoryColor: 'blue' as const,
    title: '2025 Fall Residency Program Successfully Completed',
    description: 'The 2025 Fall Residency Program at WISE Institute has been successfully completed, with all participants demonstrating exceptional progress in implant dentistry techniques and patient care.',
    date: '2025-09-15',
    href: '/news/6',
    order: 4,
  },
  {
    id: '5',
    category: 'Press Release',
    categoryColor: 'teal' as const,
    title: 'New Hands-on Training Facilities Open',
    description: 'WISE Institute is excited to announce the opening of new state-of-the-art hands-on training facilities, providing residents with enhanced learning environments and cutting-edge equipment.',
    date: '2025-08-20',
    href: '/news/5',
    order: 5,
  },
  {
    id: '4',
    category: 'Institute News',
    categoryColor: 'blue' as const,
    title: 'Summer Live Surgery Study Club Concludes',
    description: 'The Summer Live Surgery Study Club has successfully concluded, bringing together dental professionals for intensive hands-on learning and knowledge sharing sessions.',
    date: '2025-07-10',
    href: '/news/4',
    order: 6,
  },
  {
    id: '3',
    category: 'Press Release',
    categoryColor: 'teal' as const,
    title: 'WISE Institute Announces Partnership with Local Clinics',
    description: 'WISE Institute is proud to announce new partnerships with local dental clinics, expanding opportunities for residents to gain real-world experience and clinical exposure.',
    date: '2025-06-25',
    href: '/news/3',
    order: 7,
  },
  {
    id: '2',
    category: 'Institute News',
    categoryColor: 'blue' as const,
    title: 'Spring Residency Program Graduates 40 Doctors',
    description: 'WISE Institute celebrates the graduation of 40 doctors from the Spring Residency Program, marking another successful cohort of dental professionals trained in advanced implant techniques.',
    date: '2025-05-15',
    href: '/news/2',
    order: 8,
  },
  {
    id: '1',
    category: 'Press Release',
    categoryColor: 'teal' as const,
    title: 'WISE Institute Expands Course Offerings',
    description: 'WISE Institute is expanding its course offerings to include new specialized programs and advanced training modules, providing more comprehensive education opportunities for dental professionals.',
    date: '2025-04-10',
    href: '/news/1',
    order: 9,
  },
];

async function addNewsToContentful() {
  try {
    console.log('📝 Contentful에 뉴스 추가 시작...\n');
    
    const { env } = await getManagementEnv();
    
    for (const newsItem of newsItems) {
      try {
        console.log(`\n📰 "${newsItem.title}" 추가 중...`);
        
        // href는 상대 경로이므로 Contentful에 저장하지 않음 (URL 필드 검증 때문)
        const fields: any = {
          title: { 'en-US': newsItem.title },
          category: { 'en-US': newsItem.category },
          categoryColor: { 'en-US': newsItem.categoryColor },
          description: { 'en-US': newsItem.description },
          date: { 'en-US': newsItem.date },
          order: { 'en-US': newsItem.order },
        };
        
        // href는 전체 URL이 아니므로 제외
        
        const entry = await env.createEntry('newsItem', { fields });
        console.log(`  ✅ Entry 생성됨: ${entry.sys.id}`);
        
        const published = await entry.publish();
        console.log(`  ✅ Published: ${published.sys.id}`);
        
      } catch (error: any) {
        console.error(`  ❌ 오류 발생:`, error.message);
        if (error.details) {
          console.error(`  상세:`, JSON.stringify(error.details, null, 2));
        }
      }
    }
    
    console.log('\n\n✅ 모든 뉴스 추가 완료!');
    
  } catch (error: any) {
    console.error('❌ 스크립트 실행 실패:', error.message);
    process.exit(1);
  }
}

addNewsToContentful();

