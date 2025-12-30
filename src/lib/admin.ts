'use client';

// 클라이언트 사이드에서 어드민 세션 체크 (비동기)
export async function checkAdminSession(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/check', {
      method: 'GET',
      credentials: 'include',
    });
    if (response.ok) {
      const data = await response.json();
      return data.isAdmin === true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

// 어드민 세션 체크 (동기적, 쿠키 기반)
export function isAdminClient(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const cookies = document.cookie.split(';');
    const sessionCookie = cookies.find(cookie => 
      cookie.trim().startsWith('admin-session=')
    );
    
    if (!sessionCookie) return false;
    
    const sessionValue = sessionCookie.split('=')[1];
    if (!sessionValue) return false;
    
    try {
      const decodedValue = decodeURIComponent(sessionValue);
      // 브라우저에서는 atob 사용
      const sessionData = JSON.parse(atob(decodedValue));
      
      if (!sessionData.user || !sessionData.expires) return false;
      if (new Date() > new Date(sessionData.expires)) return false;
      
      return true;
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}

