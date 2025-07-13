'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, MessageSquare, Phone, Heart, Shield } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const faqs = [
  {
    question: "What services does RYD Mental Health offer?",
    answer: "We offer a range of mental health services including individual counseling, group therapy, crisis support, community support programs, and educational resources. Our services are designed to be accessible and supportive for individuals experiencing various mental health challenges."
  },
  {
    question: "How can I access counseling services?",
    answer: "You can access our counseling services by contacting us through our website, email at info@rydmentalhealth.org, or by calling +256 709 039595. We'll connect you with a mental health professional who can help determine the best approach for your needs."
  },
  {
    question: "Are your services confidential?",
    answer: "Yes, all our services are strictly confidential. We adhere to professional ethical standards and applicable laws regarding privacy in mental health care. Your personal information and anything discussed during sessions remains private and secure."
  },
  {
    question: "What should I do in a mental health crisis?",
    answer: "If you're experiencing a mental health crisis and need immediate support, please contact our crisis support line via WhatsApp at +256 726 204 045. For emergencies that require immediate medical attention, please call emergency services or go to your nearest emergency room."
  },
  {
    question: "How can I join a support group?",
    answer: "To join one of our support groups, please visit our Contact page and fill out the inquiry form, or email us at info@rydmentalhealth.org with the subject 'Support Group Inquiry.' Our team will provide information about available groups and how to participate."
  },
  {
    question: "Do you offer virtual/online services?",
    answer: "Yes, we offer virtual counseling and support services through secure platforms. This allows you to access mental health support from the comfort of your home or any private space where you feel comfortable."
  },
  {
    question: "How can I volunteer with RYD Mental Health?",
    answer: "We welcome volunteers who are passionate about mental health. To apply, please visit our Volunteer page or send your CV and application to recruitment@rydmentalhealth.org. We offer various volunteer opportunities based on your skills and interests."
  },
  {
    question: "Do I need a referral to access your services?",
    answer: "No, you do not need a referral to access our services. You can contact us directly through our website, email, or phone to inquire about our services and schedule an appointment."
  }
];

const categories = [
  {
    title: "Crisis Support",
    description: "Immediate assistance for urgent mental health needs",
    icon: Phone,
  },
  {
    title: "Counseling Services",
    description: "Professional mental health support",
    icon: MessageSquare,
  },
  {
    title: "Community Support",
    description: "Group-based support and resources",
    icon: Heart,
  },
  {
    title: "Privacy & Safety",
    description: "Information about confidentiality and security",
    icon: Shield,
  }
];

const FAQ = ({ question, answer, index }: { question: string, answer: string, index: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="border border-gray-200 rounded-lg overflow-hidden mb-4"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full p-4 text-left bg-white hover:bg-gray-50"
      >
        <h3 className="text-lg font-medium text-gray-900">{question}</h3>
        <ChevronDown
          className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 p-4 bg-gray-50' : 'max-h-0'
        }`}
      >
        <p className="text-gray-600">{answer}</p>
      </div>
    </motion.div>
  );
};

const CategoryCard = ({ category, index }: { category: typeof categories[0], index: number }) => {
  const Icon = category.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
    >
      <div className="p-3 rounded-lg bg-primary-100 text-primary-600 inline-block mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.title}</h3>
      <p className="text-gray-600">{category.description}</p>
    </motion.div>
  );
};

export default function FAQPage() {
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
                Frequently Asked Questions
              </h1>
              <p className="text-xl text-gray-600">
                Find answers to common questions about our services and mental health support.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <CategoryCard key={category.title} category={category} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <FAQ key={index} question={faq.question} answer={faq.answer} index={index} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Banner */}
        <section className="py-12 bg-primary-600 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Still Have Questions?
              </h2>
              <p className="text-lg text-primary-100 mb-6">
                Contact us directly and our team will be happy to help you.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <a
                  href="mailto:info@rydmentalhealth.org"
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-base font-medium rounded-full text-white hover:bg-white hover:text-primary-600 transition-all duration-300"
                >
                  Email Us
                </a>
                <a
                  href="tel:+256709039595"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-base font-medium rounded-full text-primary-600 hover:bg-primary-100 hover:text-primary-700 transition-all duration-300"
                >
                  Call Us
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
} 