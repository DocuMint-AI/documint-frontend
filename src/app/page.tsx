'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to upload page on initial load
    router.replace('/upload');
  }, [router]);

  return null;
}