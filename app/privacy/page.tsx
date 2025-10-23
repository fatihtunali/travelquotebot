import Link from 'next/link';
import Logo from '@/components/Logo';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-8 py-4">
          <Link href="/">
            <Logo size="md" variant="gradient" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-600 leading-relaxed">
                DYF TURIZM TIC LTD STI ("we," "our," or "us") operates Travel Quote AI, an AI-powered tour operator platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">2.1 Personal Information</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We collect information that you provide directly to us, including:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1 ml-4">
                    <li>Name, email address, and contact information</li>
                    <li>Organization/company details</li>
                    <li>Account credentials</li>
                    <li>Payment information (processed securely through third-party providers)</li>
                    <li>Communications with our support team</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">2.2 Usage Information</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We automatically collect certain information about your device and how you interact with our platform:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1 ml-4">
                    <li>Log data (IP address, browser type, pages visited)</li>
                    <li>Device information</li>
                    <li>Usage patterns and preferences</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-600 leading-relaxed mb-2">We use the collected information for:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                <li>Providing and maintaining our services</li>
                <li>Processing your transactions</li>
                <li>Sending you technical notices and support messages</li>
                <li>Responding to your inquiries and providing customer support</li>
                <li>Improving and optimizing our platform</li>
                <li>Detecting and preventing fraud or abuse</li>
                <li>Complying with legal obligations</li>
              </ul>
            </section>

            {/* Data Sharing */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
              <p className="text-gray-600 leading-relaxed mb-2">
                We do not sell your personal information. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                <li>With service providers who assist in operating our platform</li>
                <li>To comply with legal obligations or respond to lawful requests</li>
                <li>To protect our rights, privacy, safety, or property</li>
                <li>In connection with a merger, acquisition, or sale of assets</li>
                <li>With your explicit consent</li>
              </ul>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
              <p className="text-gray-600 leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Retention</h2>
              <p className="text-gray-600 leading-relaxed">
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Rights</h2>
              <p className="text-gray-600 leading-relaxed mb-2">
                Depending on your location, you may have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                <li>Access to your personal information</li>
                <li>Correction of inaccurate data</li>
                <li>Deletion of your data</li>
                <li>Objection to processing</li>
                <li>Data portability</li>
                <li>Withdrawal of consent</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-2">
                To exercise these rights, please contact us at info@travelquoteai.com
              </p>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies and Tracking Technologies</h2>
              <p className="text-gray-600 leading-relaxed">
                We use cookies and similar tracking technologies to track activity on our platform and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
            </section>

            {/* International Transfers */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. International Data Transfers</h2>
              <p className="text-gray-600 leading-relaxed">
                Your information may be transferred to and maintained on servers located outside of your country. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Children's Privacy</h2>
              <p className="text-gray-600 leading-relaxed">
                Our platform is not intended for individuals under the age of 18. We do not knowingly collect personal information from children.
              </p>
            </section>

            {/* Changes to Policy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to This Privacy Policy</h2>
              <p className="text-gray-600 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
              <p className="text-gray-600 leading-relaxed mb-2">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-gray-900 font-semibold">DYF TURIZM TIC LTD STI</p>
                <p className="text-gray-600 text-sm mt-1">Mehmet Akif Ersoy Mah, Hanımeli Sok No 5/B</p>
                <p className="text-gray-600 text-sm">Uskudar - Istanbul, Turkey</p>
                <p className="text-gray-600 text-sm mt-2">Email: <a href="mailto:info@travelquoteai.com" className="text-blue-600 hover:underline">info@travelquoteai.com</a></p>
                <p className="text-gray-600 text-sm">Phone: <a href="tel:+902165575252" className="text-blue-600 hover:underline">0 216 557 52 52</a></p>
              </div>
            </section>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-8">
            <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-8 py-6">
          <div className="text-center text-gray-600 text-sm">
            <p>© {new Date().getFullYear()} All rights reserved by DYF TURIZM TIC LTD STI</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
