"use client";
import React from "react";
import {
  Shield,
  Lock,
  Users,
  Eye,
  Heart,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-green-50 via-white to-emerald-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary-main rounded-2xl flex items-center justify-center">
              <Shield className="text-white" size={32} />
            </div>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>

          <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
            Your family's privacy and security are our top priorities. Learn how
            we protect and handle your personal information.
          </p>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-center space-x-8">
              <div className="flex items-center text-primary-main">
                <Lock size={20} className="mr-2" />
                <span className="font-medium">COPPA Compliant</span>
              </div>
              <div className="flex items-center text-primary-main">
                <Shield size={20} className="mr-2" />
                <span className="font-medium">SSL Encrypted</span>
              </div>
              <div className="flex items-center text-primary-main">
                <Eye size={20} className="mr-2" />
                <span className="font-medium">Transparent</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            <strong>Last Updated:</strong> January 15, 2025
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Table of Contents */}
          <div className="bg-gray-50 rounded-2xl p-8 mb-12 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Users size={24} className="text-primary-main mr-3" />
              Table of Contents
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <a
                  href="#overview"
                  className="block text-primary-main hover:text-green-700 transition-colors font-medium"
                >
                  1. Overview
                </a>
                <a
                  href="#information-we-collect"
                  className="block text-primary-main hover:text-green-700 transition-colors font-medium"
                >
                  2. Information We Collect
                </a>
                <a
                  href="#how-we-use-information"
                  className="block text-primary-main hover:text-green-700 transition-colors font-medium"
                >
                  3. How We Use Information
                </a>
                <a
                  href="#children-privacy"
                  className="block text-primary-main hover:text-green-700 transition-colors font-medium"
                >
                  4. Children's Privacy
                </a>
                <a
                  href="#data-sharing"
                  className="block text-primary-main hover:text-green-700 transition-colors font-medium"
                >
                  5. Data Sharing
                </a>
              </div>
              <div className="space-y-3">
                <a
                  href="#security"
                  className="block text-primary-main hover:text-green-700 transition-colors font-medium"
                >
                  6. Security Measures
                </a>
                <a
                  href="#your-rights"
                  className="block text-primary-main hover:text-green-700 transition-colors font-medium"
                >
                  7. Your Rights
                </a>
                <a
                  href="#cookies"
                  className="block text-primary-main hover:text-green-700 transition-colors font-medium"
                >
                  8. Cookies & Tracking
                </a>
                <a
                  href="#updates"
                  className="block text-primary-main hover:text-green-700 transition-colors font-medium"
                >
                  9. Policy Updates
                </a>
                <a
                  href="#contact"
                  className="block text-primary-main hover:text-green-700 transition-colors font-medium"
                >
                  10. Contact Us
                </a>
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <div className="prose prose-lg max-w-none">
            {/* Section 1: Overview */}
            <div id="overview" className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-10 h-10 bg-primary-main rounded-lg flex items-center justify-center mr-4">
                  <span className="text-white font-bold">1</span>
                </div>
                Overview
              </h2>

              <div className="bg-gradient-to-r from-primary-main/5 to-primary-secondary/5 rounded-xl p-6 border border-primary-main/10 mb-6">
                <div className="flex items-start">
                  <Heart className="text-primary-main mr-4 mt-1" size={24} />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Our Commitment to Your Family
                    </h3>
                    <p className="text-gray-700">
                      ENTETEYE is committed to protecting the privacy and safety
                      of families using our character-building and life skills
                      platform. This policy explains how we collect, use, and
                      protect your personal information, with special attention
                      to the protection of children's data.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed mb-4">
                This Privacy Policy applies to all users of the ENTETEYE
                platform, including parents, guardians, and children aged 10-18.
                We comply with the Children's Online Privacy Protection Act
                (COPPA) and other applicable privacy laws to ensure the highest
                level of protection for your family's data.
              </p>
            </div>

            {/* Section 2: Information We Collect */}
            <div id="information-we-collect" className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-white font-bold">2</span>
                </div>
                Information We Collect
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Users size={20} className="text-blue-500 mr-2" />
                    Parent/Guardian Information
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center">
                      <CheckCircle size={16} className="text-blue-500 mr-2" />
                      Name and email address
                    </li>
                    <li className="flex items-center">
                      <CheckCircle size={16} className="text-blue-500 mr-2" />
                      Account credentials
                    </li>
                    <li className="flex items-center">
                      <CheckCircle size={16} className="text-blue-500 mr-2" />
                      Payment information
                    </li>
                    <li className="flex items-center">
                      <CheckCircle size={16} className="text-blue-500 mr-2" />
                      Family preferences and values
                    </li>
                  </ul>
                </div>

                <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Heart size={20} className="text-primary-main mr-2" />
                    Child Information
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center">
                      <CheckCircle
                        size={16}
                        className="text-primary-main mr-2"
                      />
                      First name and age
                    </li>
                    <li className="flex items-center">
                      <CheckCircle
                        size={16}
                        className="text-primary-main mr-2"
                      />
                      Learning progress and achievements
                    </li>
                    <li className="flex items-center">
                      <CheckCircle
                        size={16}
                        className="text-primary-main mr-2"
                      />
                      Course interactions and responses
                    </li>
                    <li className="flex items-center">
                      <CheckCircle
                        size={16}
                        className="text-primary-main mr-2"
                      />
                      Avatar and customization preferences
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-white font-bold text-sm">!</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Important Note
                    </h4>
                    <p className="text-gray-700">
                      We only collect information that is necessary for
                      providing our educational services. We never collect
                      sensitive personal information from children without
                      explicit parental consent.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: How We Use Information */}
            <div id="how-we-use-information" className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-white font-bold">3</span>
                </div>
                How We Use Information
              </h2>

              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    We use your information to:
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <ul className="space-y-3">
                      <li className="flex items-center text-gray-700">
                        <CheckCircle
                          size={16}
                          className="text-primary-main mr-3"
                        />
                        Provide personalized learning experiences
                      </li>
                      <li className="flex items-center text-gray-700">
                        <CheckCircle
                          size={16}
                          className="text-primary-main mr-3"
                        />
                        Track learning progress and achievements
                      </li>
                      <li className="flex items-center text-gray-700">
                        <CheckCircle
                          size={16}
                          className="text-primary-main mr-3"
                        />
                        Generate AI-powered course recommendations
                      </li>
                    </ul>
                    <ul className="space-y-3">
                      <li className="flex items-center text-gray-700">
                        <CheckCircle
                          size={16}
                          className="text-primary-main mr-3"
                        />
                        Communicate important updates to parents
                      </li>
                      <li className="flex items-center text-gray-700">
                        <CheckCircle
                          size={16}
                          className="text-primary-main mr-3"
                        />
                        Improve our platform and services
                      </li>
                      <li className="flex items-center text-gray-700">
                        <CheckCircle
                          size={16}
                          className="text-primary-main mr-3"
                        />
                        Ensure platform safety and security
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Children's Privacy */}
            <div id="children-privacy" className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-white font-bold">4</span>
                </div>
                Children's Privacy (COPPA Compliance)
              </h2>

              <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6 border border-red-100 mb-6">
                <div className="flex items-start">
                  <Shield className="text-red-500 mr-4 mt-1" size={24} />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Special Protections for Children Under 13
                    </h3>
                    <p className="text-gray-700 mb-4">
                      We take extra care to protect children under 13 in
                      compliance with COPPA regulations:
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center text-gray-700">
                        <CheckCircle size={16} className="text-red-500 mr-2" />
                        Parental consent required before collecting any personal
                        information
                      </li>
                      <li className="flex items-center text-gray-700">
                        <CheckCircle size={16} className="text-red-500 mr-2" />
                        Limited data collection - only what's necessary for the
                        service
                      </li>
                      <li className="flex items-center text-gray-700">
                        <CheckCircle size={16} className="text-red-500 mr-2" />
                        No behavioral advertising or tracking
                      </li>
                      <li className="flex items-center text-gray-700">
                        <CheckCircle size={16} className="text-red-500 mr-2" />
                        Parents can review, delete, or refuse further collection
                        at any time
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: Data Sharing */}
            <div id="data-sharing" className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-white font-bold">5</span>
                </div>
                Data Sharing and Third Parties
              </h2>

              <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  We DO NOT sell, rent, or share your personal information with
                  third parties for marketing purposes.
                </h3>

                <p className="text-gray-700 mb-4">
                  We may share limited information only in these circumstances:
                </p>

                <ul className="space-y-3">
                  <li className="flex items-start text-gray-700">
                    <CheckCircle
                      size={16}
                      className="text-indigo-500 mr-3 mt-1"
                    />
                    <div>
                      <strong>Service Providers:</strong> Trusted partners who
                      help us operate our platform (hosting, analytics, customer
                      support) under strict privacy agreements
                    </div>
                  </li>
                  <li className="flex items-start text-gray-700">
                    <CheckCircle
                      size={16}
                      className="text-indigo-500 mr-3 mt-1"
                    />
                    <div>
                      <strong>Legal Requirements:</strong> When required by law
                      or to protect our users' safety
                    </div>
                  </li>
                  <li className="flex items-start text-gray-700">
                    <CheckCircle
                      size={16}
                      className="text-indigo-500 mr-3 mt-1"
                    />
                    <div>
                      <strong>Business Transfers:</strong> In the event of a
                      merger or acquisition, with continued privacy protections
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Section 6: Security */}
            <div id="security" className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-white font-bold">6</span>
                </div>
                Security Measures
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-teal-50 rounded-xl p-6 border border-teal-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Lock size={20} className="text-teal-500 mr-2" />
                    Technical Safeguards
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• SSL/TLS encryption for data transmission</li>
                    <li>• Encrypted data storage</li>
                    <li>• Regular security audits and updates</li>
                    <li>• Secure authentication systems</li>
                    <li>• Firewall and intrusion detection</li>
                  </ul>
                </div>

                <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Shield size={20} className="text-primary-main mr-2" />
                    Operational Safeguards
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Limited access to personal data</li>
                    <li>• Employee privacy training</li>
                    <li>• Regular privacy impact assessments</li>
                    <li>• Incident response procedures</li>
                    <li>• Data retention policies</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 7: Your Rights */}
            <div id="your-rights" className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-white font-bold">7</span>
                </div>
                Your Rights and Choices
              </h2>

              <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  As a parent/guardian, you have the right to:
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <ul className="space-y-3">
                    <li className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="text-orange-500 mr-3" />
                      Access your family's personal information
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="text-orange-500 mr-3" />
                      Correct inaccurate information
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="text-orange-500 mr-3" />
                      Request deletion of personal data
                    </li>
                  </ul>
                  <ul className="space-y-3">
                    <li className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="text-orange-500 mr-3" />
                      Control communication preferences
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="text-orange-500 mr-3" />
                      Withdraw consent at any time
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle size={16} className="text-orange-500 mr-3" />
                      Export your data
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div id="contact" className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-10 h-10 bg-primary-main rounded-lg flex items-center justify-center mr-4">
                  <span className="text-white font-bold">10</span>
                </div>
                Contact Us
              </h2>

              <div className="bg-gradient-to-r from-primary-main/5 to-primary-secondary/5 rounded-2xl p-8 border border-primary-main/10">
                <p className="text-gray-700 mb-6">
                  If you have questions about this Privacy Policy or how we
                  handle your personal information, please don't hesitate to
                  contact us:
                </p>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary-main rounded-lg flex items-center justify-center mr-4">
                      <Mail className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Email</p>
                      <p className="text-gray-600">privacy@enteteye.com</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary-main rounded-lg flex items-center justify-center mr-4">
                      <Phone className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Phone</p>
                      <p className="text-gray-600">1-800-ENTETEYE</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary-main rounded-lg flex items-center justify-center mr-4">
                      <MapPin className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Address</p>
                      <p className="text-gray-600">
                        123 Learning Lane
                        <br />
                        Education City, EC 12345
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicyPage;
