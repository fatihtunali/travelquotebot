import Link from 'next/link';
import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />

      {/* Main Content */}
      <main className="container mx-auto px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                By accessing and using Travel Quote AI ("the Platform"), operated by DYF TURIZM TIC LTD STI ("Company," "we," "our," or "us"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform.
              </p>
            </section>

            {/* Account Registration */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Account Registration and Eligibility</h2>
              <div className="space-y-3 text-gray-600 leading-relaxed">
                <p>To use the Platform, you must:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Be at least 18 years old or the age of majority in your jurisdiction</li>
                  <li>Provide accurate, current, and complete information during registration</li>
                  <li>Maintain and update your account information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Accept responsibility for all activities under your account</li>
                </ul>
                <p className="mt-3">
                  You may not use the Platform if you have been previously banned or if your account has been terminated.
                </p>
              </div>
            </section>

            {/* Subscription and Payment */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Subscription and Payment</h2>
              <div className="space-y-3 text-gray-600 leading-relaxed">
                <h3 className="text-lg font-semibold text-gray-900">3.1 Free Trial</h3>
                <p>
                  New accounts receive a 14-day free trial period. No credit card is required during the trial. The trial automatically ends after 14 days unless you subscribe to a paid plan.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mt-4">3.2 Paid Subscriptions</h3>
                <p>
                  Subscription fees are billed monthly in advance. By subscribing, you authorize us to charge your payment method on a recurring basis. All fees are non-refundable except as required by law or as expressly stated in these terms.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mt-4">3.3 Plan Changes</h3>
                <p>
                  You may upgrade, downgrade, or cancel your subscription at any time. Changes take effect at the start of the next billing cycle.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mt-4">3.4 Credits</h3>
                <p>
                  AI quote generation credits are allocated monthly based on your subscription plan. Unused credits do not roll over to the next month. Additional credits may be purchased separately.
                </p>
              </div>
            </section>

            {/* Use of Platform */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Acceptable Use</h2>
              <div className="space-y-3 text-gray-600 leading-relaxed">
                <p>You agree not to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Upload malicious code, viruses, or harmful content</li>
                  <li>Attempt to gain unauthorized access to the Platform or other accounts</li>
                  <li>Interfere with or disrupt the Platform's functionality</li>
                  <li>Use the Platform for fraudulent or illegal activities</li>
                  <li>Share your account credentials with unauthorized users</li>
                  <li>Scrape, copy, or reverse engineer the Platform</li>
                  <li>Use automated systems (bots) without our written permission</li>
                </ul>
              </div>
            </section>

            {/* White Label Services */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. White Label Platform</h2>
              <p className="text-gray-600 leading-relaxed">
                The Platform provides white-label capabilities allowing you to customize branding. You are responsible for all content displayed on your white-label site. You must not use branding that infringes on third-party rights or creates confusion about ownership or endorsement.
              </p>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Intellectual Property</h2>
              <div className="space-y-3 text-gray-600 leading-relaxed">
                <h3 className="text-lg font-semibold text-gray-900">6.1 Our Property</h3>
                <p>
                  The Platform, including all software, designs, text, graphics, and other content, is owned by DYF TURIZM TIC LTD STI and protected by intellectual property laws. You receive a limited, non-exclusive, non-transferable license to use the Platform.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mt-4">6.2 Your Content</h3>
                <p>
                  You retain ownership of content you upload. By uploading content, you grant us a license to use, store, and display that content as necessary to provide the Platform services.
                </p>
              </div>
            </section>

            {/* Data and Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data and Privacy</h2>
              <p className="text-gray-600 leading-relaxed">
                Your use of the Platform is also governed by our Privacy Policy. We collect, use, and protect your data as described in the Privacy Policy. By using the Platform, you consent to such collection and use.
              </p>
            </section>

            {/* Service Availability */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Service Availability and Modifications</h2>
              <div className="space-y-3 text-gray-600 leading-relaxed">
                <p>
                  We strive to provide reliable service but do not guarantee uninterrupted or error-free operation. We reserve the right to:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Modify, suspend, or discontinue any aspect of the Platform</li>
                  <li>Perform scheduled or emergency maintenance</li>
                  <li>Update features and pricing with reasonable notice</li>
                  <li>Limit access to certain features or content</li>
                </ul>
              </div>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Termination</h2>
              <div className="space-y-3 text-gray-600 leading-relaxed">
                <h3 className="text-lg font-semibold text-gray-900">9.1 By You</h3>
                <p>
                  You may cancel your account at any time through your account settings. Cancellation takes effect at the end of your current billing period.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mt-4">9.2 By Us</h3>
                <p>
                  We may suspend or terminate your account if you violate these Terms, engage in fraudulent activity, or for any other reason at our discretion. We will provide notice when reasonably possible.
                </p>
              </div>
            </section>

            {/* Disclaimers */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Disclaimers</h2>
              <div className="space-y-2 text-gray-600 leading-relaxed">
                <p className="uppercase font-semibold">
                  THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
                </p>
                <p>
                  We disclaim all warranties, including but not limited to merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the Platform will meet your requirements or that operation will be uninterrupted or error-free.
                </p>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Limitation of Liability</h2>
              <div className="space-y-2 text-gray-600 leading-relaxed">
                <p className="uppercase font-semibold">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, DYF TURIZM TIC LTD STI SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES.
                </p>
                <p>
                  Our total liability for any claims arising from or related to the Platform shall not exceed the amount you paid us in the 12 months preceding the claim.
                </p>
              </div>
            </section>

            {/* Indemnification */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Indemnification</h2>
              <p className="text-gray-600 leading-relaxed">
                You agree to indemnify and hold harmless DYF TURIZM TIC LTD STI, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the Platform or violation of these Terms.
              </p>
            </section>

            {/* Dispute Resolution */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Dispute Resolution and Governing Law</h2>
              <div className="space-y-3 text-gray-600 leading-relaxed">
                <p>
                  These Terms are governed by the laws of the Republic of Turkey. Any disputes arising from these Terms or use of the Platform shall be subject to the exclusive jurisdiction of the courts in Istanbul, Turkey.
                </p>
                <p>
                  Before filing any legal claim, you agree to first contact us to attempt to resolve the dispute informally.
                </p>
              </div>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Changes to Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify you of material changes by email or through the Platform. Continued use of the Platform after changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            {/* Miscellaneous */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Miscellaneous</h2>
              <div className="space-y-3 text-gray-600 leading-relaxed">
                <p>
                  <strong>Severability:</strong> If any provision of these Terms is found unenforceable, the remaining provisions will remain in full effect.
                </p>
                <p>
                  <strong>Entire Agreement:</strong> These Terms, together with our Privacy Policy, constitute the entire agreement between you and DYF TURIZM TIC LTD STI.
                </p>
                <p>
                  <strong>No Waiver:</strong> Our failure to enforce any right or provision shall not constitute a waiver of that right or provision.
                </p>
                <p>
                  <strong>Assignment:</strong> You may not assign or transfer these Terms. We may assign our rights and obligations without restriction.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Contact Information</h2>
              <p className="text-gray-600 leading-relaxed mb-2">
                If you have questions about these Terms of Service, please contact us:
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

      <Footer />
    </div>
  );
}
