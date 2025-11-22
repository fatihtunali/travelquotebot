'use client';

import { motion } from 'framer-motion';
import { Sparkles, Leaf, MessageCircle, Zap, Palette, TrendingUp, Globe, FileText, Shield } from 'lucide-react';

const features = [
    {
        icon: Sparkles,
        title: 'AI-Powered Quotes',
        description: 'Generate complete itineraries with pricing in seconds. Our AI understands destinations, seasonality, and creates personalized travel experiences.',
        color: 'bg-purple-100 text-purple-600',
        badge: 'NEW'
    },
    {
        icon: Leaf,
        title: 'Carbon Footprint Calculator',
        description: 'Show clients the environmental impact of their trip with certified CO2 calculations. Built on ICAO/IATA standards.',
        color: 'bg-green-100 text-green-600',
        badge: 'NEW'
    },
    {
        icon: MessageCircle,
        title: 'WhatsApp Integration',
        description: 'Share quotes and itineraries instantly via WhatsApp. Connect with clients on their preferred channel.',
        color: 'bg-emerald-100 text-emerald-600',
        badge: 'NEW'
    },
    {
        icon: Zap,
        title: 'Real-Time Pricing',
        description: 'Get instant rates for hotels, tours, and transfers from your pricing database. No more manual calculations.',
        color: 'bg-teal-100 text-teal-600',
        badge: null
    },
    {
        icon: FileText,
        title: 'Beautiful Proposals',
        description: 'Generate professional, branded itineraries that impress clients. Day-by-day breakdown with all services included.',
        color: 'bg-cyan-100 text-cyan-600',
        badge: null
    },
    {
        icon: Globe,
        title: 'Multi-Country Support',
        description: 'Seamlessly combine Turkey, Greece, and Egypt in a single itinerary. Handle complex multi-destination trips easily.',
        color: 'bg-blue-100 text-blue-600',
        badge: null
    },
    {
        icon: Palette,
        title: 'White Label Platform',
        description: 'Your brand, your domain, your colors. The platform looks like your own proprietary software.',
        color: 'bg-pink-100 text-pink-600',
        badge: null
    },
    {
        icon: TrendingUp,
        title: 'Analytics Dashboard',
        description: 'Track conversion rates, revenue, popular destinations, and team performance with real-time dashboards.',
        color: 'bg-orange-100 text-orange-600',
        badge: null
    },
    {
        icon: Shield,
        title: 'Secure & Reliable',
        description: 'Bank-grade security with role-based access control. Your data is encrypted and backed up daily.',
        color: 'bg-gray-100 text-gray-600',
        badge: null
    }
];

export default function Features() {
    return (
        <section className="py-20 bg-gradient-to-b from-white to-teal-50/30 relative overflow-hidden" id="features">
            {/* Decorative Pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#14b8a6 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
                    >
                        <Sparkles className="w-4 h-4" />
                        Powerful Features
                    </motion.div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                        Everything You Need to <span className="text-teal-600">Scale</span>
                    </h2>
                    <p className="text-lg text-gray-600">
                        Built specifically for modern tour operators who want to close more deals in less time.
                        Save hours on every quote while delivering exceptional client experiences.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                            className="p-6 rounded-2xl border border-gray-100 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-500/5 transition-all group bg-white relative"
                        >
                            {feature.badge && (
                                <span className="absolute top-4 right-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    {feature.badge}
                                </span>
                            )}
                            <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Stats Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 p-8 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl text-white"
                >
                    <div className="text-center">
                        <div className="text-3xl lg:text-4xl font-bold mb-1">90%</div>
                        <div className="text-teal-100 text-sm">Time Saved</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl lg:text-4xl font-bold mb-1">300%</div>
                        <div className="text-teal-100 text-sm">More Quotes</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl lg:text-4xl font-bold mb-1">50+</div>
                        <div className="text-teal-100 text-sm">Tour Operators</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl lg:text-4xl font-bold mb-1">10K+</div>
                        <div className="text-teal-100 text-sm">Quotes Generated</div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
