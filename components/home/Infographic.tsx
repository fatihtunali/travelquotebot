'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Infographic() {
    return (
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                        See the Complete Picture
                    </h2>
                    <p className="text-lg text-gray-600">
                        Download or share this infographic to understand how Travel Quote Bot transforms your workflow
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                        <div className="relative w-full">
                            <Image
                                src="/images/infographic.png"
                                alt="Travel Quote Bot - How It Works Infographic"
                                width={1754}
                                height={2480}
                                className="w-full h-auto rounded-lg"
                                priority={false}
                            />
                        </div>

                        <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/images/infographic.png"
                                download="TravelQuoteBot-HowItWorks.png"
                                className="inline-flex items-center justify-center px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download PNG
                            </a>
                            <button
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: 'Travel Quote Bot - How It Works',
                                            text: 'Check out how Travel Quote Bot transforms travel quote creation with AI',
                                            url: window.location.origin + '/images/infographic.png'
                                        });
                                    } else {
                                        navigator.clipboard.writeText(window.location.origin + '/images/infographic.png');
                                        alert('Link copied to clipboard!');
                                    }
                                }}
                                className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                                Share
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
