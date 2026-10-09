"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OdevlerRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/odevlerim');
  }, [router]);

  return null;
}
