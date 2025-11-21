'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/Logo';
import {
    LayoutDashboard,
    FileText,
    Sparkles,
    MessageSquare,
    Palette,
    CreditCard,
    BarChart3,
    Wallet,
    Users,
    PenLine
} from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Manual Quote', href: '/dashboard/quotes/create', icon: PenLine },
    { name: 'AI Quote', href: '/dashboard/quotes/ai-generate', icon: Sparkles },
    { name: 'Requests', href: '/dashboard/customer-requests', icon: MessageSquare },
    { name: 'Branding', href: '/dashboard/branding', icon: Palette },
    { name: 'Pricing', href: '/dashboard/pricing', icon: CreditCard },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Billing', href: '/dashboard/billing', icon: Wallet },
    { name: 'Team', href: '/dashboard/team', icon: Users },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
            <div className="flex h-16 items-center px-6 border-b border-gray-100">
                <Link href="/">
                    <Logo size="sm" variant="gradient" />
                </Link>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-3">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon
                                    className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                                        }`}
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="border-t border-gray-200 p-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
                    <p className="text-xs font-semibold text-blue-800 mb-1">Need Help?</p>
                    <p className="text-xs text-blue-600 mb-3">Check our documentation or contact support.</p>
                    <Link
                        href="/contact"
                        className="block w-full rounded-md bg-white px-3 py-2 text-center text-xs font-semibold text-blue-600 shadow-sm hover:bg-blue-50 border border-blue-100"
                    >
                        Contact Support
                    </Link>
                </div>
            </div>
        </div>
    );
}
