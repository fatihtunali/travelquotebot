'use client';

import { motion } from 'framer-motion';
import { Zap, Globe, FileText, Palette, Shield, TrendingUp } from 'lucide-react';

const features = [
    {
        icon: Zap,
        title: 'Real-Time Pricing',
        description: 'Get instant rates for hotels, tours, and transfers. No more waiting for suppliers to email you back.',
        color: 'bg-blue-100 text-blue-600'
    },
    {
        icon: FileText,
        title: 'Beautiful Proposals',
        description: 'Generate professional, branded PDF itineraries in seconds. Impress your clients with every quote.',
        color: 'bg-purple-100 text-purple-600'
    },
    {
        icon: Globe,
        title: 'Multi-Country Support',
        description: 'Seamlessly combine Turkey, Greece, and Egypt in a single itinerary. We handle the logistics logic.',
        color: 'bg-green-100 text-green-600'
    },
    {
        icon: Palette,
        title: 'White Label',
        description: 'Your brand, your domain, your colors. The platform looks and feels like your own proprietary software.',
        color: 'bg-pink-100 text-pink-600'
    },
    {
        icon: Shield,
        title: 'Enterprise Security',
        description: 'Bank-grade security for your data. Role-based access control for your team members.',
        color: 'bg-orange-100 text-orange-600'
    },
    {
        icon: TrendingUp,
        title: 'Smart Analytics',
        description: 'Track conversion rates, popular destinations, and team performance with built-in dashboards.',
        color: 'bg-cyan-100 text-cyan-600'
    }
];

export default function Features() {
    return (
        <section className="py-20 bg-gradient-to-b from-white to-blue-50/30 relative overflow-hidden">
            {/* Decorative Pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                        Everything You Need to Scale
                    </h2>
                    <p className="text-lg text-gray-600">
                        Built specifically for modern tour operators who want to close more deals in less time.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="p-8 rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all group bg-white"
                        >
                            <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
