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
    PenLine,
    X,
    Building2,
    UserCircle,
    CalendarCheck,
    Download
} from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Quotes', href: '/dashboard/quotes', icon: FileText },
    { name: 'Manual Quote', href: '/dashboard/quotes/create', icon: PenLine },
    { name: 'AI Quote', href: '/dashboard/quotes/ai-generate', icon: Sparkles },
    { name: 'Bookings', href: '/dashboard/bookings', icon: CalendarCheck },
    { name: 'Requests', href: '/dashboard/customer-requests', icon: MessageSquare },
    { name: 'Agents', href: '/dashboard/agents', icon: Building2 },
    { name: 'Clients', href: '/dashboard/clients', icon: UserCircle },
    { name: 'Exports', href: '/dashboard/exports', icon: Download },
    { name: 'Branding', href: '/dashboard/branding', icon: Palette },
    { name: 'Pricing', href: '/dashboard/pricing', icon: CreditCard },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Billing', href: '/dashboard/billing', icon: Wallet },
    { name: 'Team', href: '/dashboard/team', icon: Users },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
                md:relative md:translate-x-0 md:flex md:flex-col
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex h-16 items-center justify-between px-6 border-b border-gray-100">
                    <Link href="/" onClick={onClose}>
                        <Logo size="sm" variant="gradient" />
                    </Link>
                    {/* Mobile close button */}
                    <button
                        onClick={onClose}
                        className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto py-4">
                    <nav className="space-y-1 px-3">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={onClose}
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
                            onClick={onClose}
                            className="block w-full rounded-md bg-white px-3 py-2 text-center text-xs font-semibold text-blue-600 shadow-sm hover:bg-blue-50 border border-blue-100"
                        >
                            Contact Support
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
