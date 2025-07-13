'use client';

import { motion } from 'framer-motion';
import { 
  Heart, 
  Users, 
  Briefcase, 
  Mail, 
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Globe,
  Calendar,
  LogIn,
  UserPlus
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const volunteerOpportunities = [
  {
    title: 'Mental Health Support',
    description: 'Help provide support to individuals in need.',
    icon: Heart,
    requirements: [
      'Background in psychology or related field',
      'Compassionate approach',
      'Good communication skills',
      'Commitment to confidentiality'
    ]
  },
  {
    title: 'Community Outreach',
    description: 'Assist with community events and awareness campaigns.',
    icon: Users,
    requirements: [
      'Strong interpersonal skills',
      'Ability to work in teams',
      'Cultural sensitivity',
      'Flexibility with schedule'
    ]
  },
  {
    title: 'Administrative Support',
    description: 'Help with office tasks and organizational management.',
    icon: Briefcase,
    requirements: [
      'Administrative experience',
      'Computer proficiency',
      'Attention to detail',
      'Organizational skills'
    ]
  },
  {
    title: 'Educational Programs',
    description: 'Contribute to our educational resources and workshops.',
    icon: BookOpen,
    requirements: [
      'Knowledge of mental health topics',
      'Teaching or facilitation experience',
      'Content creation skills',
      'Research abilities'
    ]
  }
];

const benefits = [
  {
    title: 'Make a Difference',
    description: 'Directly impact the lives of people in need of mental health support.'
  },
  {
    title: 'Professional Development',
    description: 'Gain valuable experience in the mental health field.'
  },
  {
    title: 'Community Connection',
    description: 'Be part of a compassionate community dedicated to mental health.'
  },
  {
    title: 'Flexible Opportunities',
    description: 'Various roles available with flexible time commitments.'
  }
];

const VolunteerOpportunityCard = ({ opportunity, index }: { opportunity: typeof volunteerOpportunities[0], index: number }) => {
  const Icon = opportunity.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="p-4 rounded-xl bg-primary-100 text-primary-600 inline-block mb-6">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-2xl font-semibold text-gray-900 mb-4">{opportunity.title}</h3>
      <p className="text-gray-600 mb-6">{opportunity.description}</p>
      <h4 className="text-lg font-medium text-gray-900 mb-4">Requirements:</h4>
      <ul className="space-y-3 mb-6">
        {opportunity.requirements.map((requirement, i) => (
          <li key={i} className="flex items-center text-gray-600">
            <CheckCircle2 className="h-5 w-5 text-primary-500 mr-2 flex-shrink-0" />
            <span>{requirement}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

const BenefitCard = ({ benefit, index }: { benefit: typeof benefits[0], index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
      <p className="text-gray-600">{benefit.description}</p>
    </motion.div>
  );
};

export default function VolunteerPage() {
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
                Volunteer With Us
              </h1>
              <p className="text-xl text-gray-600">
                Join our team and make a difference in the lives of those struggling with mental health challenges.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Volunteer Opportunities */}
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
                Volunteer Opportunities
              </h2>
              <p className="text-xl text-gray-600">
                Explore the various ways you can contribute to our mission.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {volunteerOpportunities.map((opportunity, index) => (
                <VolunteerOpportunityCard key={opportunity.title} opportunity={opportunity} index={index} />
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
                Benefits of Volunteering
              </h2>
              <p className="text-xl text-gray-600">
                When you volunteer with us, you not only help others but also gain valuable experiences.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <BenefitCard key={benefit.title} benefit={benefit} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* Get Started Section */}
        <section className="py-20 bg-gradient-to-r from-primary-50 to-secondary-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-4xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Ready to Join Our Team?
              </h2>
              <p className="text-xl text-gray-600 mb-12">
                Whether you're new to our organization or returning volunteer, we have options for you.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                {/* New Volunteers */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="p-4 rounded-xl bg-primary-100 text-primary-600 inline-block mb-6">
                    <UserPlus className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">New Volunteer</h3>
                  <p className="text-gray-600 mb-6">
                    First time joining us? Create your volunteer account and get started with our onboarding process.
                  </p>
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-300"
                  >
                    <UserPlus className="mr-2 h-5 w-5" />
                    Sign Up to Volunteer
                  </Link>
                </motion.div>

                {/* Returning Volunteers */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="p-4 rounded-xl bg-secondary-100 text-secondary-600 inline-block mb-6">
                    <LogIn className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Returning Volunteer</h3>
                  <p className="text-gray-600 mb-6">
                    Already part of our team? Access your volunteer dashboard to view assignments and schedule.
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center w-full px-6 py-3 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors duration-300"
                  >
                    <LogIn className="mr-2 h-5 w-5" />
                    Login to Dashboard
                  </Link>
                </motion.div>
              </div>

              <div className="mt-12 text-center">
                <p className="text-gray-600 mb-4">
                  Have questions about volunteering with us?
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                >
                  Contact our volunteer coordinator
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* How to Apply */}
        <section className="py-20 bg-primary-600 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                How to Apply
              </h2>
              <p className="text-xl text-primary-100 mb-8">
                Ready to make a difference? Send your application and CV to:
              </p>
              <div className="flex justify-center items-center space-x-3 mb-8">
                <Mail className="h-8 w-8" />
                <a href="mailto:recruitment@rydmentalhealth.org" className="text-2xl font-semibold hover:underline">
                  recruitment@rydmentalhealth.org
                </a>
              </div>
              <Link
                href="mailto:recruitment@rydmentalhealth.org"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-base font-medium rounded-full text-white hover:bg-white hover:text-primary-600 transition-all duration-300"
              >
                Apply Now
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