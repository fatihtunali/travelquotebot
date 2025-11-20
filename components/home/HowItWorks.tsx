'use client';

import { motion } from 'framer-motion';

const steps = [
    {
        number: '01',
        title: 'Select Destinations',
        description: 'Choose from our curated database of hotels and tours in Turkey, Greece, and Egypt.'
    },
    {
        number: '02',
        title: 'Customize Itinerary',
        description: 'Drag and drop days, adjust pricing margins, and add your special touches.'
    },
    {
        number: '03',
        title: 'Export & Send',
        description: 'Download a stunning PDF or share a live link with your client to close the deal.'
    }
];

export default function HowItWorks() {
    return (
        <section className="py-20 bg-white relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-50/30 to-transparent" />
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                        From Request to Quote in Minutes
                    </h2>
                    <p className="text-lg text-gray-600">
                        Stop spending hours on spreadsheets. Streamline your workflow with AI.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 relative">
                    {/* Connector Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gray-200 -z-10" />

                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.2 }}
                            className="relative pt-8 text-center"
                        >
                            <div className="w-24 h-24 mx-auto bg-white rounded-full shadow-lg flex items-center justify-center mb-6 border-4 border-gray-50 relative z-10">
                                <span className="text-3xl font-bold text-blue-600">{step.number}</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                            <p className="text-gray-600 max-w-xs mx-auto">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
