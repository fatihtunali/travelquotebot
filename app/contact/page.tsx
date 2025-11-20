import Link from 'next/link';
import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';

export default function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />

      {/* Main Content */}
      <main className="container mx-auto px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Contact Us</h1>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
            <p className="text-gray-600 mb-8">
              Have questions about Travel Quote Bot? We'd love to hear from you. Contact us using the information below.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Company Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="text-blue-600 text-xl mt-1">🏢</div>
                    <div>
                      <p className="font-semibold text-gray-900">DYF TURIZM TIC LTD STI</p>
                      <p className="text-gray-600 text-sm mt-1">
                        Mehmet Akif Ersoy Mah<br />
                        Hanımeli Sok No 5/B<br />
                        Uskudar - Istanbul<br />
                        Turkey
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="text-blue-600 text-xl mt-1">📞</div>
                    <div>
                      <p className="font-semibold text-gray-900">Phone</p>
                      <a href="tel:+902165575252" className="text-blue-600 hover:underline">
                        0 216 557 52 52
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="text-blue-600 text-xl mt-1">📧</div>
                    <div>
                      <p className="font-semibold text-gray-900">Email</p>
                      <a href="mailto:info@travelquoteai.com" className="text-blue-600 hover:underline">
                        info@travelquoteai.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Hours</h3>
                <div className="space-y-2 text-gray-600">
                  <div className="flex justify-between">
                    <span>Monday - Friday:</span>
                    <span className="font-semibold">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday:</span>
                    <span className="font-semibold">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday:</span>
                    <span className="font-semibold">Closed</span>
                  </div>
                  <p className="text-sm mt-4 text-gray-500">
                    * All times are in Turkey Time (TRT, UTC+3)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Support Section */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Support</h2>
            <p className="text-gray-600 mb-6">
              For technical support, please email us with details about your issue. Our support team typically responds within 24 hours during business days.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-2xl mb-2">💬</div>
                <h4 className="font-semibold text-gray-900 mb-1">General Inquiries</h4>
                <p className="text-sm text-gray-600">Questions about our platform</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-2xl mb-2">🛠️</div>
                <h4 className="font-semibold text-gray-900 mb-1">Technical Support</h4>
                <p className="text-sm text-gray-600">Help with platform issues</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-2xl mb-2">💼</div>
                <h4 className="font-semibold text-gray-900 mb-1">Sales & Partnership</h4>
                <p className="text-sm text-gray-600">Business inquiries</p>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center">
            <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
