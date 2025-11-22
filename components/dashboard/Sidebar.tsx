'use client';

import { useState, useEffect } from 'react';
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
    Download,
    Receipt,
    Scale,
    Truck,
    Banknote,
    ChevronDown,
    ChevronRight,
    DollarSign,
    BookOpen,
    Settings,
    TrendingUp
} from 'lucide-react';

interface NavItem {
    name: string;
    href: string;
    icon: React.ElementType;
}

interface NavSection {
    name: string;
    icon: React.ElementType;
    items: NavItem[];
    defaultOpen?: boolean;
}

// Organized navigation structure
const navigationSections: NavSection[] = [
    {
        name: 'Quotes',
        icon: FileText,
        defaultOpen: true,
        items: [
            { name: 'All Quotes', href: '/dashboard/quotes', icon: FileText },
            { name: 'Create Quote', href: '/dashboard/quotes/create', icon: PenLine },
            { name: 'AI Generator', href: '/dashboard/quotes/ai-generate', icon: Sparkles },
        ]
    },
    {
        name: 'Finance',
        icon: DollarSign,
        defaultOpen: true,
        items: [
            { name: 'Invoices', href: '/dashboard/finance/invoices', icon: Receipt },
            { name: 'Agent Accounts', href: '/dashboard/finance/agent-balances', icon: Scale },
            { name: 'Suppliers', href: '/dashboard/finance/suppliers', icon: Truck },
            { name: 'Bills to Pay', href: '/dashboard/finance/payables', icon: Banknote },
        ]
    },
    {
        name: 'Contacts',
        icon: Users,
        items: [
            { name: 'Travel Agents', href: '/dashboard/agents', icon: Building2 },
            { name: 'Customers', href: '/dashboard/clients', icon: UserCircle },
            { name: 'Inquiries', href: '/dashboard/customer-requests', icon: MessageSquare },
        ]
    },
    {
        name: 'Reports',
        icon: TrendingUp,
        items: [
            { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
            { name: 'Exports', href: '/dashboard/exports', icon: Download },
        ]
    },
    {
        name: 'Settings',
        icon: Settings,
        items: [
            { name: 'Rate Cards', href: '/dashboard/pricing', icon: CreditCard },
            { name: 'Branding', href: '/dashboard/branding', icon: Palette },
            { name: 'Team', href: '/dashboard/team', icon: Users },
            { name: 'Subscription', href: '/dashboard/billing', icon: Wallet },
        ]
    },
];

// Standalone items (always visible)
const standaloneItems: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Bookings', href: '/dashboard/bookings', icon: CalendarCheck },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

    // Load saved state from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('sidebarSections');
        if (saved) {
            setExpandedSections(JSON.parse(saved));
        } else {
            // Set defaults
            const defaults: Record<string, boolean> = {};
            navigationSections.forEach(section => {
                defaults[section.name] = section.defaultOpen || false;
            });
            setExpandedSections(defaults);
        }
    }, []);

    // Save state to localStorage
    const toggleSection = (sectionName: string) => {
        const newState = {
            ...expandedSections,
            [sectionName]: !expandedSections[sectionName]
        };
        setExpandedSections(newState);
        localStorage.setItem('sidebarSections', JSON.stringify(newState));
    };

    // Check if any item in a section is active
    const isSectionActive = (section: NavSection) => {
        return section.items.some(item =>
            pathname === item.href || pathname?.startsWith(item.href + '/')
        );
    };

    const renderNavItem = (item: NavItem, indent: boolean = false) => {
        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
        return (
            <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    indent ? 'ml-4' : ''
                } ${isActive
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
                <item.icon
                    className={`mr-3 h-4 w-4 flex-shrink-0 ${
                        isActive ? 'text-teal-600' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                />
                {item.name}
            </Link>
        );
    };

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
                        {/* Standalone items */}
                        {standaloneItems.map(item => renderNavItem(item))}

                        {/* Collapsible sections */}
                        {navigationSections.map((section) => {
                            const isExpanded = expandedSections[section.name];
                            const sectionActive = isSectionActive(section);

                            return (
                                <div key={section.name} className="pt-2">
                                    <button
                                        onClick={() => toggleSection(section.name)}
                                        className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                            sectionActive
                                                ? 'text-teal-700 bg-teal-50/50'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                    >
                                        <div className="flex items-center">
                                            <section.icon
                                                className={`mr-3 h-4 w-4 flex-shrink-0 ${
                                                    sectionActive ? 'text-teal-600' : 'text-gray-400'
                                                }`}
                                            />
                                            {section.name}
                                        </div>
                                        {isExpanded ? (
                                            <ChevronDown className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4 text-gray-400" />
                                        )}
                                    </button>

                                    {isExpanded && (
                                        <div className="mt-1 space-y-1">
                                            {section.items.map(item => renderNavItem(item, true))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>
                </div>
                <div className="border-t border-gray-200 p-4">
                    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-4">
                        <p className="text-xs font-semibold text-teal-800 mb-1">Need Help?</p>
                        <p className="text-xs text-teal-600 mb-3">Check our documentation or contact support.</p>
                        <Link
                            href="/contact"
                            onClick={onClose}
                            className="block w-full rounded-md bg-white px-3 py-2 text-center text-xs font-semibold text-teal-600 shadow-sm hover:bg-teal-50 border border-teal-100"
                        >
                            Contact Support
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
