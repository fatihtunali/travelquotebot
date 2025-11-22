import Link from 'next/link';
import Logo from '@/components/Logo';
import { Linkedin, Twitter, Instagram, Mail, Phone } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white py-16 border-t border-teal-900/50">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-4 gap-8 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <div className="mb-6">
                            <Logo size="md" variant="light" />
                        </div>
                        <p className="text-gray-400 max-w-sm mb-6">
                            AI-powered travel quoting platform for modern tour operators.
                            Create professional itineraries with real-time pricing in seconds.
                        </p>
                        <div className="flex gap-3 mb-6">
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-teal-600 transition-colors"
                            >
                                <Linkedin className="w-4 h-4" />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-cyan-500 transition-colors"
                            >
                                <Twitter className="w-4 h-4" />
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors"
                            >
                                <Instagram className="w-4 h-4" />
                            </a>
                        </div>
                        <div className="space-y-2 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-teal-500" />
                                <a href="mailto:info@travelquotebot.com" className="hover:text-teal-400 transition-colors">
                                    info@travelquotebot.com
                                </a>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-teal-500" />
                                <a href="tel:+905325858786" className="hover:text-teal-400 transition-colors">
                                    +90 532 585 87 86
                                </a>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-teal-400">Product</h4>
                        <ul className="space-y-3 text-gray-400">
                            <li><Link href="/features" className="hover:text-teal-400 transition-colors">Features</Link></li>
                            <li><Link href="/pricing" className="hover:text-teal-400 transition-colors">Pricing</Link></li>
                            <li><Link href="/destinations" className="hover:text-teal-400 transition-colors">Destinations</Link></li>
                            <li><Link href="/showcase" className="hover:text-teal-400 transition-colors">Showcase</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-teal-400">Company</h4>
                        <ul className="space-y-3 text-gray-400">
                            <li><Link href="/about" className="hover:text-teal-400 transition-colors">About Us</Link></li>
                            <li><Link href="/contact" className="hover:text-teal-400 transition-colors">Contact</Link></li>
                            <li><Link href="/privacy" className="hover:text-teal-400 transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-teal-400 transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500">
                        © {new Date().getFullYear()} DYF TURIZM TIC LTD STI. All rights reserved<Link href="/admin" className="text-gray-700 hover:text-gray-500">.</Link>
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
                        All Systems Operational
                    </div>
                </div>
            </div>
        </footer>
    );
}
