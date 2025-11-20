'use client';

import { motion } from 'framer-motion';

export default function AboutHero() {
    return (
        <section className="relative bg-blue-900 text-white py-32 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl" />
                <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-blue-400 blur-3xl" />
            </div>

            <div className="container mx-auto px-4 relative z-10 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-4xl lg:text-6xl font-bold mb-6"
                >
                    About Travel Quote Bot
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed"
                >
                    Revolutionizing the travel industry with intelligent automation. We help agencies create stunning proposals in seconds, not hours.
                </motion.p>
            </div>
        </section>
    );
}
