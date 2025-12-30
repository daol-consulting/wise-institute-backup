import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminClient from './AdminClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

// 서버 컴포넌트에서 직접 인증 체크
async function checkAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin-session')?.value;
  
  if (!session) {
    redirect('/login?callbackUrl=/admin');
  }

  try {
    const sessionData = JSON.parse(Buffer.from(session, 'base64').toString());
    
    if (!sessionData.user || !sessionData.expires || new Date() > new Date(sessionData.expires)) {
      redirect('/login?callbackUrl=/admin');
    }
  } catch {
    redirect('/login?callbackUrl=/admin');
  }
}

export default async function AdminPage() {
  // 서버에서 인증 체크
  await checkAuth();
  return <AdminClient />;
}

