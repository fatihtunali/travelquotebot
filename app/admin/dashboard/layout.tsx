'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Block admin access from subdomains - admin should only be accessible from main domain
    const hostname = window.location.hostname;
    const isSubdomain = hostname !== 'localhost' &&
                        hostname !== 'travelquotebot.com' &&
                        hostname !== 'www.travelquotebot.com' &&
                        !hostname.startsWith('192.168.') &&
                        !hostname.startsWith('127.');

    if (isSubdomain) {
      // Redirect to main domain or show access denied
      router.push('/');
      return;
    }

    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/admin/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'super_admin') {
        // Clear any stored data and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/');
        return;
      }

      setUser(parsedUser);
    } catch {
      // Invalid user data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/admin/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (!user) return null;

  const menuItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { label: 'Tour Operators', path: '/admin/dashboard/organizations', icon: '🏢' },
    { label: 'Users', path: '/admin/dashboard/users', icon: '👥' },
    { label: 'Subscriptions', path: '/admin/dashboard/subscriptions', icon: '💳' },
    { label: 'Activity Logs', path: '/admin/dashboard/logs', icon: '📋' },
    { label: 'Google Ads', path: '/admin/dashboard/google-ads', icon: '📈' },
    { label: 'Google Places', path: '/admin/dashboard/google-places', icon: '🗺️' },
    { label: 'System Tests', path: '/admin/dashboard/system-tests', icon: '🧪' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <div className="mb-3">
            <Logo size="md" variant="gradient" />
          </div>
          <p className="text-sm text-gray-600 font-medium">Admin Panel</p>
        </div>

        <nav className="px-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                pathname === item.path || pathname.startsWith(item.path + '/')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
