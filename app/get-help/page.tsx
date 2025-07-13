'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, 
  MessageSquare, 
  Clock, 
  Shield, 
  Heart, 
  Users, 
  ArrowRight,
  Mail,
  MapPin,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const supportOptions = [
  {
    title: 'Crisis Support',
    description: 'Immediate assistance for those in crisis. Our trained professionals are here to help.',
    icon: Phone,
    color: 'red',
    action: 'WhatsApp Now',
    href: 'https://wa.me/256726204045',
    details: 'Available 24/7 • Free & Confidential'
  },
  {
    title: 'Online Chat Support',
    description: 'Connect with a counselor through our secure WhatsApp platform.',
    icon: MessageSquare,
    color: 'blue',
    action: 'Start Chat',
    href: 'https://wa.me/256726204045',
    details: 'Mon-Fri 9am-6pm • Immediate Response'
  },
  {
    title: 'Call Support',
    description: 'Speak directly with our team for guidance and support.',
    icon: Clock,
    color: 'orange',
    action: 'Call Now',
    href: 'tel:+256709039595',
    details: 'Mon-Fri 9am-5pm • Professional Support'
  }
];

const supportPrograms = [
  {
    title: 'Individual Counseling',
    description: 'One-on-one sessions with licensed mental health professionals.',
    icon: Shield,
    color: 'primary',
    features: [
      'Personalized treatment plans',
      'Flexible scheduling',
      'Online or in-person sessions',
      'Professional guidance'
    ],
    action: 'Schedule a Session',
    href: 'https://wa.me/256726204045'
  },
  {
    title: 'Group Therapy',
    description: 'Connect with others in a supportive, guided environment.',
    icon: Users,
    color: 'secondary',
    features: [
      'Peer support groups',
      'Skill-building workshops',
      'Topic-specific sessions',
      'Professional facilitation'
    ],
    action: 'Join a Group',
    href: '/contact'
  },
  {
    title: 'Community Support',
    description: 'Join our community for ongoing support and connection.',
    icon: Heart,
    color: 'purple',
    features: [
      'Regular meetups',
      'Shared experiences',
      'Resource sharing',
      'Long-term support'
    ],
    action: 'Get Involved',
    href: '/contact'
  }
];

const ProgramCard = ({ program, index }: { program: typeof supportPrograms[0], index: number }) => {
  const Icon = program.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className={`p-4 rounded-xl bg-${program.color}-100 text-${program.color}-600 inline-block mb-6`}>
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-2xl font-semibold text-gray-900 mb-4">{program.title}</h3>
      <p className="text-gray-600 mb-6">{program.description}</p>
      <ul className="space-y-3">
        {program.features.map((feature, i) => (
          <li key={i} className="flex items-center text-gray-600">
            <ChevronRight className="h-5 w-5 text-primary-500 mr-2" />
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href={program.href}
        className="inline-flex items-center mt-6 text-primary-600 hover:text-primary-700 font-medium group"
        target={program.href.startsWith('http') ? '_blank' : '_self'}
        rel={program.href.startsWith('http') ? 'noopener noreferrer' : ''}
      >
        {program.action}
        <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
      </Link>
    </motion.div>
  );
};

const SupportOptionCard = ({ option, index }: { option: typeof supportOptions[0], index: number }) => {
  const Icon = option.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
    >
      <div className={`p-4 rounded-xl bg-${option.color}-100 text-${option.color}-600 inline-block mb-6`}>
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-2xl font-semibold text-gray-900 mb-4">{option.title}</h3>
      <p className="text-gray-600 mb-4">{option.description}</p>
      <p className="text-sm text-gray-500 mb-6">{option.details}</p>
      <Link
        href={option.href}
        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-primary-600 hover:bg-primary-700 transition-all duration-300"
      >
        {option.action}
        <ArrowRight className="ml-2 h-5 w-5" />
      </Link>
    </motion.div>
  );
};

export default function GetHelpPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    preferredContact: 'email'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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
                Get Help Today
              </h1>
              <p className="text-xl text-gray-600">
                You don't have to face your challenges alone. We're here to support you on your journey to better mental health.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Immediate Support Options */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Immediate Support Available
              </h2>
              <p className="text-xl text-gray-600">
                Choose the support option that best fits your needs. We're here to help, 24/7.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {supportOptions.map((option, index) => (
                <SupportOptionCard key={option.title} option={option} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* Support Programs */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Support Programs
              </h2>
              <p className="text-xl text-gray-600">
                Comprehensive programs designed to support your mental health journey.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {supportPrograms.map((program, index) => (
                <ProgramCard key={program.title} program={program} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Get in Touch
                </h2>
                <p className="text-xl text-gray-600">
                  Fill out the form below and we'll connect you with the right support for your needs.
                </p>
              </motion.div>

              <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="preferredContact" className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Contact Method
                  </label>
                  <select
                    id="preferredContact"
                    name="preferredContact"
                    value={formData.preferredContact}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="either">Either</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    How can we help?
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary-600 text-white py-3 px-6 rounded-full font-medium hover:bg-primary-700 transition-colors duration-200"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
} 