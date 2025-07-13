'use client';

import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function TermsOfServicePage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-white py-20">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Terms of Service
              </h1>
              <p className="text-xl text-gray-600">
                Please read these terms carefully before using our services.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-md">
              <div className="prose prose-lg max-w-none">
                <h2>Introduction</h2>
                <p>
                  These Terms of Service ("Terms") govern your use of the website and services offered by RYD Mental Health ("we," "us," or "our"). By accessing our website or using our services, you agree to be bound by these Terms.
                </p>
                
                <h2>Services Description</h2>
                <p>
                  RYD Mental Health provides mental health support services, resources, and community programs. Our services include individual counseling, group therapy, educational resources, and crisis support. We are not a substitute for emergency medical services.
                </p>
                
                <h2>User Responsibilities</h2>
                <p>As a user of our services, you agree to:</p>
                <ul>
                  <li>Provide accurate and complete information when registering or contacting us</li>
                  <li>Use our services in a respectful and appropriate manner</li>
                  <li>Not engage in any behavior that could harm our organization, other users, or staff</li>
                  <li>Respect the confidentiality and privacy of other participants in our programs</li>
                  <li>Not use our services for any illegal or unauthorized purpose</li>
                </ul>
                
                <h2>Emergency Situations</h2>
                <p>
                  Our services are not designed for emergency situations. If you are experiencing a medical emergency, are in danger, or are having thoughts of harming yourself or others, please call emergency services or go to your nearest emergency room immediately.
                </p>
                
                <h2>Confidentiality and Privacy</h2>
                <p>
                  We respect your privacy and confidentiality. Our services adhere to professional standards and applicable laws regarding confidentiality in mental health care. For more information on how we collect, use, and protect your information, please refer to our Privacy Policy.
                </p>
                
                <h2>Intellectual Property</h2>
                <p>
                  All content on our website, including text, graphics, logos, images, and software, is the property of RYD Mental Health or its content suppliers and is protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works from our content without our express written consent.
                </p>
                
                <h2>Limitation of Liability</h2>
                <p>
                  To the maximum extent permitted by law, RYD Mental Health shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of our services.
                </p>
                
                <h2>Changes to These Terms</h2>
                <p>
                  We may update these Terms from time to time. We will notify you of any changes by posting the new Terms on this page and updating the "Last Updated" date.
                </p>
                
                <h2>Contact Us</h2>
                <p>
                  If you have any questions about these Terms, please contact us at:
                </p>
                <p>
                  <strong>Email:</strong> info@rydmentalhealth.org<br />
                  <strong>Phone:</strong> +256 709 039595
                </p>
                
                <p className="text-sm text-gray-500 mt-8">Last Updated: April 20, 2024</p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
} 