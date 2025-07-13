'use client';

import { motion } from 'framer-motion';
import { 
  Heart, 
  Users, 
  BookOpen, 
  MessageSquare, 
  Brain, 
  GraduationCap, 
  Shield, 
  ArrowRight,
  CheckCircle2,
  Phone
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const services = [
  {
    title: 'Individual Counseling',
    description: 'One-on-one therapy sessions tailored to your unique needs and concerns.',
    icon: Brain,
    features: [
      'Personalized treatment approach',
      'Confidential sessions',
      'Experienced counselors',
      'Flexible scheduling'
    ],
    action: 'Schedule a Session',
    actionLink: 'https://wa.me/256726204045',
    color: 'primary'
  },
  {
    title: 'Group Therapy',
    description: 'Join supportive groups led by professionals to connect and heal together.',
    icon: Users,
    features: [
      'Peer support environment',
      'Shared experiences',
      'Professional facilitation',
      'Community building'
    ],
    action: 'Join a Group',
    actionLink: '/contact',
    color: 'secondary'
  },
  {
    title: 'Crisis Support',
    description: 'Immediate assistance when you need it most, available 24/7.',
    icon: Phone,
    features: [
      'Immediate response',
      'Trained professionals',
      'Confidential support',
      'Follow-up resources'
    ],
    action: 'Get Help Now',
    actionLink: 'https://wa.me/256726204045',
    color: 'red'
  },
  {
    title: 'Educational Resources',
    description: 'Access comprehensive mental health education and self-help materials.',
    icon: GraduationCap,
    features: [
      'Workshops & Seminars',
      'Online Courses',
      'Resource Library',
      'Mental Health Guides'
    ],
    action: 'Browse Resources',
    actionLink: '/resources',
    color: 'purple'
  }
];

const benefits = [
  {
    title: 'Professional Support',
    description: 'Access to licensed mental health professionals and experienced counselors.',
    icon: Shield
  },
  {
    title: 'Confidential Services',
    description: 'Your privacy and confidentiality are our top priorities.',
    icon: Shield
  },
  {
    title: 'Holistic Approach',
    description: 'Addressing mental, emotional, and social aspects of well-being.',
    icon: Heart
  },
  {
    title: 'Flexible Programs',
    description: 'Services available in-person, online, or hybrid formats.',
    icon: Users
  }
];

const ServiceCard = ({ service, index }: { service: typeof services[0], index: number }) => {
  const Icon = service.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
    >
      <div className={`absolute inset-0 bg-gradient-to-br from-${service.color}-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`}></div>
      <div className="relative">
        <div className={`p-4 rounded-xl bg-${service.color}-100 text-${service.color}-600 group-hover:scale-110 transition-transform duration-300 inline-block mb-6`}>
          <Icon className="h-8 w-8" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-4">{service.title}</h3>
        <p className="text-gray-600 mb-6">{service.description}</p>
        <ul className="space-y-3">
          {service.features.map((feature, i) => (
            <li key={i} className="flex items-center text-gray-600">
              <CheckCircle2 className="h-5 w-5 text-primary-500 mr-2" />
              {feature}
            </li>
          ))}
        </ul>
        <Link
          href={service.actionLink}
          className="inline-flex items-center mt-6 text-primary-600 hover:text-primary-700 font-medium group"
          target={service.actionLink.startsWith('http') ? '_blank' : '_self'}
          rel={service.actionLink.startsWith('http') ? 'noopener noreferrer' : ''}
        >
          {service.action}
          <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
};

const BenefitCard = ({ benefit, index }: { benefit: typeof benefits[0], index: number }) => {
  const Icon = benefit.icon;
  
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
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
      <p className="text-gray-600">{benefit.description}</p>
    </motion.div>
  );
};

export default function ServicesPage() {
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
                Our Services
              </h1>
              <p className="text-xl text-gray-600">
                Comprehensive mental health support and resources designed to help you on your journey to well-being.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Main Services */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {services.map((service, index) => (
                <ServiceCard key={service.title} service={service} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
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
                Why Choose Our Services?
              </h2>
              <p className="text-xl text-gray-600">
                We provide comprehensive support with a focus on your unique needs and journey to recovery.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <BenefitCard key={benefit.title} benefit={benefit} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary-600">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Start Your Journey?
              </h2>
              <p className="text-xl text-primary-100 mb-8">
                Take the first step towards better mental health with our supportive community.
              </p>
              <Link
                href="/get-help"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-base font-medium rounded-full text-white hover:bg-white hover:text-primary-600 transition-all duration-300"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
} 