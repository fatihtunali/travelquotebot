'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in as super_admin
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        if (user.role === 'super_admin') {
          router.replace('/admin/dashboard');
          return;
        }
      } catch {
        // Invalid data, go to login
      }
    }

    // Default: redirect to login
    router.replace('/admin/login');
  }, [router]);

  return null;
}
