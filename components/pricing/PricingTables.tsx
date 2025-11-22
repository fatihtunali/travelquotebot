'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

const tiers = [
    {
        name: 'Starter',
        id: 'starter',
        price: 0,
        currency: '€',
        credits: 50,
        description: 'Perfect for trying out the platform and small agencies.',
        features: [
            '50 AI quotes per month',
            'Basic pricing management',
            'White-label platform',
            'Email support',
        ],
        notIncluded: [
            'Advanced pricing tools',
            'Custom branding',
            'Analytics dashboard',
            'API access',
        ],
        cta: 'Start Free',
        popular: false,
    },
    {
        name: 'Professional',
        id: 'professional',
        price: 99,
        currency: '€',
        credits: 200,
        description: 'For growing agencies that need more power and insights.',
        features: [
            '200 AI quotes per month',
            'Advanced pricing tools',
            'Custom branding',
            'Priority support',
            'Analytics dashboard',
        ],
        notIncluded: [
            'API access',
            'Dedicated support',
        ],
        cta: 'Start Free Trial',
        popular: true,
    },
    {
        name: 'Enterprise',
        id: 'enterprise',
        price: 299,
        currency: '€',
        credits: 1000,
        description: 'For large tour operators requiring maximum scale.',
        features: [
            '1000 AI quotes per month',
            'Unlimited pricing rules',
            'API access',
            'Dedicated support',
            'Custom integrations',
        ],
        notIncluded: [],
        cta: 'Contact Sales',
        popular: false,
    },
];

export default function PricingTables() {
    const [annual, setAnnual] = useState(false);

    return (
        <section className="py-20 bg-gray-50" id="pricing">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-lg text-gray-600 mb-8">
                        Choose the plan that fits your business. No hidden fees. Cancel anytime.
                    </p>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center gap-4">
                        <span className={`text-sm font-medium ${!annual ? 'text-gray-900' : 'text-gray-500'}`}>Monthly</span>
                        <button
                            onClick={() => setAnnual(!annual)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${annual ? 'bg-teal-600' : 'bg-gray-200'}`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${annual ? 'translate-x-6' : 'translate-x-1'}`}
                            />
                        </button>
                        <span className={`text-sm font-medium ${annual ? 'text-gray-900' : 'text-gray-500'}`}>
                            Yearly <span className="text-green-600 font-bold">(Save 20%)</span>
                        </span>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {tiers.map((tier, index) => (
                        <motion.div
                            key={tier.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={`relative rounded-2xl p-8 bg-white border ${tier.popular ? 'border-teal-500 shadow-xl scale-105 z-10' : 'border-gray-200 shadow-sm hover:border-teal-200 hover:shadow-md transition-all'}`}
                        >
                            {tier.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-teal-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                                <p className="text-gray-500 text-sm mb-6">{tier.description}</p>
                                <div className="flex items-baseline gap-1">
                                    {tier.price === 0 ? (
                                        <span className="text-4xl font-bold text-gray-900">Free</span>
                                    ) : typeof tier.price === 'number' ? (
                                        <>
                                            <span className="text-4xl font-bold text-gray-900">
                                                €{annual ? Math.floor(tier.price * 0.8) : tier.price}
                                            </span>
                                            <span className="text-gray-500">/mo</span>
                                        </>
                                    ) : (
                                        <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                                    )}
                                </div>
                                {annual && typeof tier.price === 'number' && tier.price > 0 && (
                                    <p className="text-xs text-green-600 mt-1 font-medium">
                                        Billed €{Math.floor(tier.price * 0.8) * 12} yearly
                                    </p>
                                )}
                            </div>

                            <ul className="space-y-4 mb-8">
                                {tier.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 text-sm text-gray-700">
                                        <Check className="w-5 h-5 text-green-500 shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                                {tier.notIncluded.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 text-sm text-gray-400">
                                        <X className="w-5 h-5 text-gray-300 shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href={tier.id === 'enterprise' ? '/contact' : `/signup?plan=${tier.id}&billing=${annual ? 'yearly' : 'monthly'}`}
                                className={`block w-full py-3 px-6 rounded-xl text-center font-bold transition-all ${tier.popular
                                        ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-lg hover:shadow-blue-500/30'
                                        : 'bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-200'
                                    }`}
                            >
                                {tier.cta}
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
