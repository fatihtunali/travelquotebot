'use client';

import Link from 'next/link';
import Logo from '@/components/Logo';
import { motion } from 'framer-motion';

export default function Navbar() {
    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100"
        >
            <div className="container mx-auto px-4 py-3">
                <div className="flex justify-between items-center">
                    <Link href="/" className="hover:opacity-80 transition-opacity">
                        <Logo size="sm" variant="gradient" />
                    </Link>

                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors">
                            Sign In
                        </Link>
                        <Link href="/signup">
                            <button className="px-4 py-2 bg-teal-600 text-white rounded-full text-sm font-medium hover:bg-teal-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                                Get Started
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
}
