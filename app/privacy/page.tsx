'use client';

import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function PrivacyPolicyPage() {
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
                Privacy Policy
              </h1>
              <p className="text-xl text-gray-600">
                Your privacy is important to us. This policy outlines how we collect, use, and protect your information.
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
                  At RYD Mental Health, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
                </p>
                
                <h2>Information We Collect</h2>
                <p>We may collect personal information that you voluntarily provide to us when you:</p>
                <ul>
                  <li>Contact us through our website</li>
                  <li>Register for our services</li>
                  <li>Sign up for our newsletter</li>
                  <li>Participate in our programs</li>
                  <li>Donate to our organization</li>
                </ul>
                <p>This information may include your name, email address, phone number, and any other information you choose to provide.</p>
                
                <h2>How We Use Your Information</h2>
                <p>We may use the information we collect for various purposes, including:</p>
                <ul>
                  <li>Providing and maintaining our services</li>
                  <li>Responding to your inquiries and requests</li>
                  <li>Sending you newsletters and other communications</li>
                  <li>Improving our website and services</li>
                  <li>Complying with legal obligations</li>
                </ul>
                
                <h2>Protection of Your Information</h2>
                <p>
                  We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                </p>
                
                <h2>Confidentiality in Mental Health Services</h2>
                <p>
                  We take confidentiality extremely seriously, especially regarding mental health information. All personal and clinical information shared during counseling or support sessions is kept strictly confidential in accordance with professional ethical standards and applicable laws.
                </p>
                
                <h2>Third-Party Services</h2>
                <p>
                  We may use third-party service providers to help us operate our website and provide our services. These third parties have access to your personal information only to perform specific tasks on our behalf and are obligated not to disclose or use it for any other purpose.
                </p>
                
                <h2>Your Rights</h2>
                <p>You have the right to:</p>
                <ul>
                  <li>Access the personal information we have about you</li>
                  <li>Request correction of inaccurate information</li>
                  <li>Request deletion of your information</li>
                  <li>Opt out of marketing communications</li>
                </ul>
                
                <h2>Changes to This Privacy Policy</h2>
                <p>
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
                </p>
                
                <h2>Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy, please contact us at:
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