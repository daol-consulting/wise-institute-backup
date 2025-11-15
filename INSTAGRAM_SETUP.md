# Instagram Feed 통합 가이드

## 방법 1: Instagram Graph API (권장)

### 1. Instagram 비즈니스 계정 설정
1. Instagram 앱을 비즈니스 계정으로 전환
2. Facebook 페이지와 연결

### 2. Facebook 개발자 계정 생성
1. [Facebook Developers](https://developers.facebook.com/) 접속
2. 새 앱 생성
3. "Instagram" 제품 추가

### 3. Access Token 생성
1. Graph API Explorer에서 토큰 생성
2. 또는 서버 사이드에서 토큰 생성 (더 안전)

### 4. 환경 변수 설정
`.env.local` 파일에 추가:

```env
NEXT_PUBLIC_INSTAGRAM_ACCESS_TOKEN=your_access_token_here
NEXT_PUBLIC_INSTAGRAM_USER_ID=your_user_id_here
```

### 5. 사용 예시
```tsx
import InstagramFeed from '@/components/InstagramFeed'

export default function HomePage() {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <SectionHeader
          eyebrow="SOCIAL"
          title="Follow Us on Instagram"
          description="Stay connected with our latest updates and behind-the-scenes content"
        />
        <InstagramFeed
          accessToken={process.env.NEXT_PUBLIC_INSTAGRAM_ACCESS_TOKEN}
          userId={process.env.NEXT_PUBLIC_INSTAGRAM_USER_ID}
          limit={6}
        />
      </div>
    </section>
  )
}
```

## 방법 2: 서드파티 서비스 사용

### Snapppt, Elfsight 등
- 무료 플랜 제공
- 설정이 간단
- 위젯 코드를 직접 삽입

### 예시: Elfsight Instagram Feed
1. [Elfsight](https://elfsight.com/instagram-feed/) 가입
2. 위젯 생성
3. 제공된 코드를 컴포넌트에 삽입

## 방법 3: 서버 사이드 API (더 안전)

Access Token을 서버에서 관리하는 것이 더 안전합니다.

### API Route 생성
`src/app/api/instagram/route.ts`:

```typescript
import { NextResponse } from 'next/server'

export async function GET() {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN
  const userId = process.env.INSTAGRAM_USER_ID

  if (!accessToken || !userId) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 500 })
  }

  try {
    const response = await fetch(
      `https://graph.instagram.com/${userId}/media?fields=id,media_type,media_url,permalink,caption,timestamp,thumbnail_url&limit=6&access_token=${accessToken}`
    )

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
```

### 클라이언트에서 사용
```tsx
useEffect(() => {
  fetch('/api/instagram')
    .then(res => res.json())
    .then(data => setPosts(data.data))
}, [])
```

## 주의사항

1. **Access Token 보안**: 클라이언트에 노출되지 않도록 서버 사이드에서 관리 권장
2. **Rate Limits**: Instagram API는 요청 제한이 있음
3. **Token 갱신**: Long-lived token은 60일마다 갱신 필요
4. **비즈니스 계정**: Graph API는 비즈니스/크리에이터 계정 필요

## 유용한 링크

- [Instagram Graph API 문서](https://developers.facebook.com/docs/instagram-api/)
- [Access Token 생성 가이드](https://developers.facebook.com/docs/instagram-basic-display-api/overview)

