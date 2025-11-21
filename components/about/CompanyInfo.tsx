'use client';

import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Building2 } from 'lucide-react';

export default function CompanyInfo() {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-16 items-start">
                    {/* Mission Statement */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                        <div className="prose prose-lg text-gray-600">
                            <p className="mb-4">
                                At Travel Quote Bot, we believe that travel professionals should spend their time crafting unforgettable experiences, not wrestling with spreadsheets and formatting documents.
                            </p>
                            <p className="mb-4">
                                Our platform leverages advanced AI to streamline the entire quotation process. From selecting destinations to generating white-labeled PDF itineraries, we provide the tools you need to scale your agency and impress your clients.
                            </p>
                            <p>
                                Born from the needs of modern tour operators, we are dedicated to driving innovation in the travel technology space.
                            </p>
                        </div>
                    </motion.div>

                    {/* Company Details Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-gray-50 rounded-2xl p-8 border border-gray-100 shadow-sm"
                    >
                        <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                            <Building2 className="w-6 h-6 text-blue-600" />
                            Company Information
                        </h3>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-600 shrink-0">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">DYF TURIZM TIC LTD STI</p>
                                    <p className="text-gray-600 mt-1 leading-relaxed">
                                        Mehmet Akif Ersoy Mah<br />
                                        Hanımeli Sok No 5/B<br />
                                        Uskudar - Istanbul<br />
                                        Turkey
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-600 shrink-0">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">Phone</p>
                                    <a href="tel:+902165575252" className="text-blue-600 hover:underline block mt-1">
                                        0 216 557 52 52
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-600 shrink-0">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">Email</p>
                                    <a href="mailto:info@travelquotebot.com" className="text-blue-600 hover:underline block mt-1">
                                        info@travelquotebot.com
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
