'use client';

import { motion } from 'framer-motion';
import { FileText, Users, Globe, Award } from 'lucide-react';

const stats = [
    {
        label: 'Itineraries Generated',
        value: '10,000+',
        icon: FileText,
        color: 'text-blue-500',
    },
    {
        label: 'Active Agencies',
        value: '500+',
        icon: Users,
        color: 'text-green-500',
    },
    {
        label: 'Countries Supported',
        value: '50+',
        icon: Globe,
        color: 'text-purple-500',
    },
    {
        label: 'Client Satisfaction',
        value: '99%',
        icon: Award,
        color: 'text-yellow-500',
    },
];

export default function StatsSection() {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="p-6 rounded-2xl bg-gray-50 border border-gray-100 text-center hover:shadow-lg transition-shadow"
                        >
                            <div className={`w-12 h-12 mx-auto mb-4 rounded-full bg-white shadow-sm flex items-center justify-center ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                            <p className="text-gray-600 font-medium">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="mt-20 max-w-4xl mx-auto text-center"
                >
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Empowering Travel Professionals</h2>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        Travel Quote Bot is built by travel experts, for travel experts. We understand the complexities of creating multi-destination itineraries and have designed a solution that simplifies the process without compromising on quality. Join hundreds of agencies who have already modernized their workflow.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
