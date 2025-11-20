'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin } from 'lucide-react';

interface DestinationCardProps {
    title: string;
    description: string;
    image: string;
    toursCount: number;
    slug: string;
    index: number;
}

export default function DestinationCard({ title, description, image, toursCount, slug, index }: DestinationCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group relative overflow-hidden rounded-2xl shadow-lg cursor-pointer"
        >
            <Link href={`/signup?destination=${slug}`}>
                <div className="aspect-[4/5] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />

                    <div className="absolute top-4 right-4 z-20 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30">
                        <span className="text-xs font-semibold text-white">{toursCount} Itineraries</span>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <div className="flex items-center gap-2 text-blue-300 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                            <MapPin className="w-4 h-4" />
                            <span className="text-xs font-bold tracking-wider uppercase">Explore</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
                        <p className="text-gray-300 text-sm line-clamp-2 mb-4 opacity-90">
                            {description}
                        </p>
                        <div className="flex items-center gap-2 text-white font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
                            View Sample Itineraries <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
