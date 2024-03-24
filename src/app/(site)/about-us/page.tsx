'use client'

import React from 'react';
import { useRouter } from 'next/navigation'
import PageContent from './pageContent'

export default function MyPage() {
  const router = useRouter();

  return <PageContent router={router} />;
}
