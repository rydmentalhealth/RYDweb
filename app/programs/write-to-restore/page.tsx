'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Calendar, Clock, MapPin } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const benefits = [
  'Process emotions through guided writing exercises',
  'Connect with others who share similar experiences',
  'Learn therapeutic writing techniques from mental health professionals',
  'Develop healthy coping mechanisms through creative expression',
  'Build resilience and emotional well-being',
  'Create a personal narrative of healing and growth'
];

const timeline = [
  {
    date: 'March 2025',
    title: 'Program Launch',
    description: 'Official launch of the Write to Restore program with our first workshop series.'
  },
  {
    date: 'April 2025',
    title: 'Community Workshops',
    description: 'Expanding to community centers with weekly workshops open to the public.'
  },
  {
    date: 'June 2025',
    title: 'Digital Platform',
    description: 'Launch of our online platform with digital resources and virtual writing circles.'
  },
  {
    date: 'August 2025',
    title: 'Publication Project',
    description: 'First anthology of participant stories published to share journeys of healing.'
  }
];

export default function WriteToRestorePage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-white py-20">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-600 mb-4">
                  Current Program
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Write to Restore
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  A therapeutic writing program that helps individuals process trauma, 
                  express emotions, and find healing through the power of words.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/contact" className="btn btn-primary px-6 py-3">
                    Join the Program
                  </Link>
                  <Link href="#details" className="btn btn-outline px-6 py-3 text-primary-600 border border-primary-600 hover:bg-primary-50">
                    Learn More
                  </Link>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="relative h-[400px] rounded-xl overflow-hidden shadow-2xl">
                  <Image
                    src="/images/write-to-restore-hero.jpg" // Placeholder image path
                    alt="Write to Restore Program"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Program Details */}
        <section id="details" className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-3xl font-bold text-gray-900 mb-4"
              >
                How Write to Restore Works
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-lg text-gray-600"
              >
                Our program combines therapeutic writing techniques with professional support
                to create a safe space for healing and personal growth.
              </motion.p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-white p-8 rounded-xl shadow-md"
              >
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <span className="text-primary-600 text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Guided Workshops</h3>
                <p className="text-gray-600">
                  Weekly writing sessions led by mental health professionals who provide prompts, 
                  guidance, and therapeutic techniques to facilitate healing through writing.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white p-8 rounded-xl shadow-md"
              >
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <span className="text-primary-600 text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Community Sharing</h3>
                <p className="text-gray-600">
                  Optional sharing circles where participants can read their work in a supportive 
                  environment, fostering connection and mutual understanding.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white p-8 rounded-xl shadow-md"
              >
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <span className="text-primary-600 text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Publication Journey</h3>
                <p className="text-gray-600">
                  Opportunities to compile and publish personal stories of healing, helping 
                  participants see their progress and inspire others on similar journeys.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Benefits Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Benefits of Therapeutic Writing
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Research shows that expressive writing can have profound effects on mental health, 
                  helping to process trauma, reduce stress, and improve overall well-being.
                </p>
                
                <ul className="space-y-4">
                  {benefits.map((benefit, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: idx * 0.1 }}
                      className="flex items-start"
                    >
                      <CheckCircle2 className="h-6 w-6 text-primary-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="relative h-[400px] rounded-xl overflow-hidden shadow-lg">
                  <Image
                    src="/images/therapeutic-writing.jpg" // Placeholder image path
                    alt="Therapeutic Writing Benefits"
                    fill
                    className="object-cover"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Program Timeline */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-3xl font-bold text-gray-900 mb-4"
              >
                Program Timeline
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-lg text-gray-600"
              >
                Our journey from program launch to creating a community of healing through writing
              </motion.p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-primary-100"></div>
                
                {/* Timeline Items */}
                <div className="space-y-12 relative">
                  {timeline.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className={`flex items-center ${idx % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                    >
                      <div className={`w-1/2 ${idx % 2 === 0 ? 'pr-12 text-right' : 'pl-12'}`}>
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-600 mb-2">
                          <Calendar className="h-4 w-4 mr-1" />
                          {item.date}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-gray-600">{item.description}</p>
                      </div>
                      
                      <div className="absolute left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-primary-500 border-4 border-white flex items-center justify-center">
                        <span className="text-white font-bold">{idx + 1}</span>
                      </div>
                      
                      <div className="w-1/2"></div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Join Program CTA */}
        <section className="py-16 bg-primary-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Join Our Write to Restore Program
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Ready to start your healing journey through writing? Register for our upcoming workshops 
                  or contact us for more information about the Write to Restore program.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-left">
                  <div className="bg-gray-50 p-4 rounded-lg flex items-start">
                    <Calendar className="h-6 w-6 text-primary-600 mr-3 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900">Next Workshop</h3>
                      <p className="text-gray-600">March 15, 2025</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg flex items-start">
                    <Clock className="h-6 w-6 text-primary-600 mr-3 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900">Duration</h3>
                      <p className="text-gray-600">8-week program</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg flex items-start">
                    <MapPin className="h-6 w-6 text-primary-600 mr-3 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900">Location</h3>
                      <p className="text-gray-600">Namugongo, Wakiso</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/contact" className="btn btn-primary px-8 py-3">
                    Register Now
                  </Link>
                  <Link href="/contact" className="btn btn-outline px-8 py-3 text-primary-600 border border-primary-600 hover:bg-primary-50">
                    Contact for Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
} 