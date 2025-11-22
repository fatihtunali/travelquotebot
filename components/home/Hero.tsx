'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Play } from 'lucide-react';

export default function Hero() {
    const [videoOpen, setVideoOpen] = useState(false);

    return (
        <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
            {/* Animated Blobs */}
            <motion.div
                className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full filter blur-3xl opacity-30"
                animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
                transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
            />
            <motion.div
                className="absolute top-1/2 right-0 w-80 h-80 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full filter blur-3xl opacity-30"
                animate={{ x: [0, -100, 0], y: [0, -50, 0] }}
                transition={{ duration: 12, repeat: Infinity, repeatType: 'reverse' }}
            />
            <motion.div
                className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full filter blur-3xl opacity-20"
                animate={{ x: [0, 50, 0], y: [0, 50, 0] }}
                transition={{ duration: 15, repeat: Infinity, repeatType: 'reverse' }}
            />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 bg-teal-100/10 backdrop-blur-sm text-blue-100 px-3 py-1 rounded-full text-xs font-semibold mb-6 border border-teal-200/20">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                            </span>
                            Now supporting Winter 2025-26
                        </div>

                        <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6">
                            Create Perfect <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                                Travel Itineraries
                            </span>
                            <br /> in Seconds
                        </h1>

                        <p className="text-lg text-blue-100 mb-8 leading-relaxed max-w-lg">
                            AI-powered pricing and proposal generation for modern tour operators.
                            Combine Turkey, Greece, and Egypt into seamless, white-labeled PDF proposals.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-10">
                            <Link href="/signup">
                                <button className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-blue-900 rounded-full font-bold hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg hover:shadow-orange-500/30 flex items-center justify-center gap-2 group">
                                    Start Free Trial
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                            <button
                                onClick={() => setVideoOpen(true)}
                                className="w-full sm:w-auto px-8 py-3.5 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-full font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                            >
                                <Play className="w-4 h-4 fill-current" />
                                Watch Demo
                            </button>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-blue-200 font-medium">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <span>No credit card required</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <span>14-day free trial</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Visual */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                            <img
                                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                alt="Dashboard Preview"
                                className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity duration-500"
                            />

                            {/* Floating Elements */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -right-4 top-10 bg-white p-4 rounded-xl shadow-xl border border-gray-100 max-w-[200px] hidden md:block"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                        <CheckCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Quote Generated</p>
                                        <p className="text-sm font-bold text-gray-900">€1,250.00</p>
                                    </div>
                                </div>
                                <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full w-full bg-green-500 rounded-full" />
                                </div>
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, 10, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                className="absolute -left-4 bottom-20 bg-white p-4 rounded-xl shadow-xl border border-gray-100 hidden md:block"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
                                        <img src="https://flagcdn.com/w40/tr.png" alt="Turkey" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm -ml-6">
                                        <img src="https://flagcdn.com/w40/gr.png" alt="Greece" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm -ml-6">
                                        <img src="https://flagcdn.com/w40/eg.png" alt="Egypt" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="ml-2">
                                        <p className="text-xs font-semibold text-gray-900">Multi-Country</p>
                                        <p className="text-[10px] text-gray-500">Seamless Integration</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Video Modal */}
            {videoOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setVideoOpen(false)}
                >
                    <div className="w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative">
                        <button
                            onClick={() => setVideoOpen(false)}
                            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                        >
                            Close
                        </button>
                        <iframe
                            className="w-full h-full"
                            src="https://www.youtube.com/embed/wDUW9kzqh78?autoplay=1"
                            title="Travel Quote Bot Demo"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                </div>
            )}
        </section>
    );
}
