import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AuthCheck() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  
  if (!token) {
    redirect('/login');
  }
  
  return null; // This component doesn't render anything
}