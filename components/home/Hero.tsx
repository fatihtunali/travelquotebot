'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Play, Sparkles, Leaf, Zap } from 'lucide-react';

export default function Hero() {
    const [videoOpen, setVideoOpen] = useState(false);

    return (
        <section className="relative bg-gradient-to-br from-gray-900 via-teal-900 to-cyan-900 text-white pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
            {/* Animated Blobs */}
            <motion.div
                className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full filter blur-3xl opacity-20"
                animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
                transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
            />
            <motion.div
                className="absolute top-1/2 right-0 w-80 h-80 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full filter blur-3xl opacity-20"
                animate={{ x: [0, -100, 0], y: [0, -50, 0] }}
                transition={{ duration: 12, repeat: Infinity, repeatType: 'reverse' }}
            />
            <motion.div
                className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full filter blur-3xl opacity-15"
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
                        <div className="inline-flex items-center gap-2 bg-teal-500/20 backdrop-blur-sm text-teal-200 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 border border-teal-400/30">
                            <Sparkles className="w-4 h-4" />
                            AI-Powered Travel Quoting Platform
                        </div>

                        <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6">
                            Generate Travel <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
                                Quotes & Itineraries
                            </span>
                            <br /> in Seconds
                        </h1>

                        <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-lg">
                            Stop spending hours on manual quotes. Our AI creates professional itineraries
                            with real-time pricing, carbon footprint calculations, and beautiful proposals
                            your clients will love.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-10">
                            <Link href="/signup">
                                <button className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-full font-bold hover:from-teal-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-teal-500/30 flex items-center justify-center gap-2 group">
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

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 font-medium">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-teal-400" />
                                <span>No credit card required</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-teal-400" />
                                <span>50 free AI quotes</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-teal-400" />
                                <span>Setup in 5 minutes</span>
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

                            {/* AI Quote Card */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -right-4 top-10 bg-white p-4 rounded-xl shadow-xl border border-gray-100 max-w-[220px] hidden md:block"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-600">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">AI Quote Generated</p>
                                        <p className="text-sm font-bold text-gray-900">€2,450.00</p>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-600 mb-2">8 days • Istanbul → Cappadocia</div>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: '100%' }}
                                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                    />
                                </div>
                            </motion.div>

                            {/* Carbon Footprint Card */}
                            <motion.div
                                animate={{ y: [0, 10, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                className="absolute -left-4 bottom-20 bg-white p-4 rounded-xl shadow-xl border border-gray-100 hidden md:block"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <Leaf className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-900">Carbon Footprint</p>
                                        <p className="text-sm text-green-600 font-bold">261 kg CO₂</p>
                                        <p className="text-[10px] text-gray-500">Offset: €6.53</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Real-time Pricing Card */}
                            <motion.div
                                animate={{ scale: [1, 1.02, 1] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                                className="absolute right-4 bottom-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg hidden md:block"
                            >
                                <div className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-teal-600" />
                                    <span className="text-xs font-semibold text-gray-900">Real-time pricing</span>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>

                {/* Trusted By Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-16 pt-12 border-t border-white/10"
                >
                    <p className="text-center text-sm text-gray-400 mb-6">Trusted by tour operators across Turkey, Greece & Egypt</p>
                    <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
                        <div className="flex items-center gap-2">
                            <img src="https://flagcdn.com/w40/tr.png" alt="Turkey" className="w-6 h-4 object-cover rounded" />
                            <span className="text-sm text-gray-300">Turkey</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <img src="https://flagcdn.com/w40/gr.png" alt="Greece" className="w-6 h-4 object-cover rounded" />
                            <span className="text-sm text-gray-300">Greece</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <img src="https://flagcdn.com/w40/eg.png" alt="Egypt" className="w-6 h-4 object-cover rounded" />
                            <span className="text-sm text-gray-300">Egypt</span>
                        </div>
                    </div>
                </motion.div>
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
                            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10"
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
