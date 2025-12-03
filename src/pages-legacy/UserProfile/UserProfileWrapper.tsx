'use client';

import { useSearchParams } from 'next/navigation';
import UserProfileContent from './UserProfileContent';

export default function UserProfileWrapper() {
  const searchParams = useSearchParams();
  const userId = searchParams?.get('id');

  return <UserProfileContent userId={userId} />;
}
