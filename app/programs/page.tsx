'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calendar, Heart, Users, Brain } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const programs = [
  {
    id: 'write-to-restore',
    title: 'Write to Restore',
    description: 'A therapeutic writing program that helps individuals process trauma and heal through expressive writing.',
    image: '/images/write-to-restore.jpg', // Placeholder image path
    status: 'Current',
    highlights: [
      'Guided journaling workshops',
      'Group sharing sessions',
      'Professional psychological support',
      'Publication opportunities for healing stories'
    ],
    link: '/programs/write-to-restore'
  },
  {
    id: 'community-outreach',
    title: 'Community Outreach Program',
    description: 'Bringing mental health awareness, education, and support directly to local communities.',
    image: '/images/community-outreach.jpg', // Placeholder image path
    status: 'Ongoing',
    highlights: [
      'Mental health workshops',
      'Community support groups',
      'Resource distribution',
      'Volunteer opportunities'
    ],
    link: '/programs/community-outreach'
  }
];

const ProgramCard = ({ program }: { program: typeof programs[0] }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      <div className="relative h-64">
        <div className="absolute top-4 right-4 z-10 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
          {program.status}
        </div>
        <div className="relative h-full w-full">
          <Image
            src={program.image}
            alt={program.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-semibold text-gray-900 mb-3">{program.title}</h3>
        <p className="text-gray-600 mb-4">{program.description}</p>
        
        <h4 className="font-medium text-gray-800 mb-2">Program Highlights:</h4>
        <ul className="mb-6 space-y-1">
          {program.highlights.map((highlight, idx) => (
            <li key={idx} className="flex items-start text-gray-600">
              <span className="inline-block rounded-full bg-primary-100 p-1 mr-2">
                <Heart className="h-4 w-4 text-primary-600" />
              </span>
              {highlight}
            </li>
          ))}
        </ul>
        
        <Link
          href={program.link}
          className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
        >
          Learn more
          <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
};

export default function ProgramsPage() {
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Our Programs
              </h1>
              <p className="text-xl text-gray-600">
                Discover how RYD Mental Health is making a difference through our specialized programs.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Programs Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {programs.map((program) => (
                <ProgramCard key={program.id} program={program} />
              ))}
            </div>
          </div>
        </section>

        {/* Join Our Programs CTA */}
        <section className="py-16 bg-primary-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Get Involved With Our Programs</h2>
                  <p className="text-lg text-gray-600 mb-6">
                    Whether you're seeking help or looking to contribute, our programs are open to everyone who wants to make a difference in mental health.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link href="/contact" className="btn btn-primary px-6 py-3">
                      Contact Us
                    </Link>
                    <Link href="/volunteer" className="btn btn-outline px-6 py-3 text-primary-600 border border-primary-600 hover:bg-primary-50">
                      Volunteer
                    </Link>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary-100 p-4 rounded-lg text-center">
                    <Users className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">20+</p>
                    <p className="text-gray-600">Volunteers</p>
                  </div>
                  <div className="bg-primary-100 p-4 rounded-lg text-center">
                    <Brain className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">1000+</p>
                    <p className="text-gray-600">People Helped</p>
                  </div>
                  <div className="bg-primary-100 p-4 rounded-lg text-center">
                    <Calendar className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">2024</p>
                    <p className="text-gray-600">Founded</p>
                  </div>
                  <div className="bg-primary-100 p-4 rounded-lg text-center">
                    <Heart className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">95%</p>
                    <p className="text-gray-600">Success Rate</p>
                  </div>
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