'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, LogOut, User } from 'lucide-react';

export default function DashboardHeader() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [orgName, setOrgName] = useState('');

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsed = JSON.parse(userData);
            setUser(parsed);
            // Ideally fetch org data here or pass it down, but for header display we might just use user name
            // For now, we'll try to get org name from local storage if available, or fetch it
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/');
    };

    return (
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-8">
            <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
                <button className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
                </button>
                <div className="h-8 w-px bg-gray-200 mx-2"></div>
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-medium text-gray-900">
                            {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
                        </span>
                        <span className="text-xs text-gray-500">Administrator</span>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200">
                        <User className="h-5 w-5" />
                    </div>
                    <button
                        onClick={handleLogout}
                        className="ml-2 rounded-full p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Logout"
                    >
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </header>
    );
}
