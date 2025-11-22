'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserCheck, X } from 'lucide-react';

interface ImpersonationData {
  active: boolean;
  adminId: number;
  adminEmail: string;
}

interface OrgData {
  id: number;
  name: string;
  slug: string;
}

export default function ImpersonationBanner() {
  const router = useRouter();
  const [impersonation, setImpersonation] = useState<ImpersonationData | null>(null);
  const [org, setOrg] = useState<OrgData | null>(null);

  useEffect(() => {
    // Check for impersonation data in localStorage
    const impersonationData = localStorage.getItem('impersonation');
    const orgData = localStorage.getItem('impersonatedOrg');

    if (impersonationData && orgData) {
      try {
        setImpersonation(JSON.parse(impersonationData));
        setOrg(JSON.parse(orgData));
      } catch (e) {
        // Invalid data, clear it
        localStorage.removeItem('impersonation');
        localStorage.removeItem('impersonatedOrg');
      }
    }
  }, []);

  const handleStopImpersonation = () => {
    // Restore original admin session
    const adminToken = localStorage.getItem('adminToken');
    const adminUser = localStorage.getItem('adminUser');

    if (adminToken && adminUser) {
      localStorage.setItem('token', adminToken);
      localStorage.setItem('user', adminUser);
    }

    // Clear impersonation data
    localStorage.removeItem('impersonation');
    localStorage.removeItem('impersonatedOrg');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');

    // Redirect back to admin organizations page
    router.push('/admin/dashboard/organizations');
  };

  if (!impersonation || !org) {
    return null;
  }

  return (
    <div className="bg-purple-600 text-white px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <UserCheck className="w-4 h-4" />
        <span className="text-sm font-medium">
          Impersonating: <strong>{org.name}</strong>
        </span>
        <span className="text-purple-200 text-xs">
          (as {impersonation.adminEmail})
        </span>
      </div>
      <button
        onClick={handleStopImpersonation}
        className="flex items-center gap-1 px-3 py-1 bg-white text-purple-600 text-xs font-medium rounded hover:bg-purple-50 transition-colors"
      >
        <X className="w-3 h-3" />
        Stop Impersonation
      </button>
    </div>
  );
}
