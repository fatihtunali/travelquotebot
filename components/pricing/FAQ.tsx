'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
    {
        question: 'Is there a free trial?',
        answer: 'Yes! All plans come with a 14-day free trial. No credit card is required to start. You can test all features before committing.',
    },
    {
        question: 'Can I change plans later?',
        answer: 'Absolutely. You can upgrade or downgrade your plan at any time from your dashboard. Changes take effect immediately.',
    },
    {
        question: 'What happens if I cancel?',
        answer: 'If you cancel, your account will remain active until the end of your current billing period. After that, your data will be preserved for 30 days in case you decide to return.',
    },
    {
        question: 'Do you offer discounts for non-profits?',
        answer: 'Yes, we offer special pricing for registered non-profit organizations and educational institutions. Please contact our sales team for details.',
    },
    {
        question: 'Is my data secure?',
        answer: 'Security is our top priority. We use bank-grade encryption for all data transmission and storage. We perform regular security audits and backups.',
    },
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                    <p className="text-gray-600">
                        Have a question? We're here to help.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="border border-gray-200 rounded-xl overflow-hidden hover:border-blue-200 transition-colors"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-gray-50 transition-colors"
                            >
                                <span className="font-semibold text-gray-900">{faq.question}</span>
                                <ChevronDown
                                    className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''
                                        }`}
                                />
                            </button>
                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="p-6 pt-0 text-gray-600 leading-relaxed border-t border-gray-100">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
