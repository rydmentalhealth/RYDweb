'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  Heart, 
  Gift, 
  Users, 
  Target, 
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Building2,
  GraduationCap
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const donationOptions = [
  {
    title: 'One-Time Donation',
    description: 'Make a single contribution to support our mission.',
    icon: Gift,
    color: 'primary',
    features: [
      'Flexible amount',
      'Secure payment',
      'Tax-deductible',
      'Instant confirmation'
    ]
  },
  {
    title: 'Monthly Support',
    description: 'Become a monthly donor and provide consistent support.',
    icon: Heart,
    color: 'red',
    features: [
      'Recurring donations',
      'Easy to manage',
      'Cancel anytime',
      'Monthly impact report'
    ]
  },
  {
    title: 'Corporate Partnership',
    description: 'Partner with us to make a larger impact.',
    icon: Building2,
    color: 'blue',
    features: [
      'Custom programs',
      'Employee matching',
      'Brand alignment',
      'Impact reporting'
    ]
  }
];

const impactStories = [
  {
    title: 'Mental Health Support',
    description: 'Providing counseling and therapy to those in need.',
    icon: Heart,
    impact: '500+ individuals supported',
    color: 'red'
  },
  {
    title: 'Community Programs',
    description: 'Building supportive networks and connections.',
    icon: Users,
    impact: '20+ community groups',
    color: 'blue'
  },
  {
    title: 'Educational Resources',
    description: 'Sharing knowledge and tools for mental well-being.',
    icon: GraduationCap,
    impact: '1000+ resources shared',
    color: 'purple'
  }
];

const DonationOptionCard = ({ option, index }: { option: typeof donationOptions[0], index: number }) => {
  const Icon = option.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className={`p-4 rounded-xl bg-${option.color}-100 text-${option.color}-600 inline-block mb-6`}>
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-2xl font-semibold text-gray-900 mb-4">{option.title}</h3>
      <p className="text-gray-600 mb-6">{option.description}</p>
      <ul className="space-y-3 mb-6">
        {option.features.map((feature, i) => (
          <li key={i} className="flex items-center text-gray-600">
            <CheckCircle2 className="h-5 w-5 text-primary-500 mr-2" />
            {feature}
          </li>
        ))}
      </ul>
      <button
        onClick={() => document.getElementById('donation-form')?.scrollIntoView({ behavior: 'smooth' })}
        className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200"
      >
        Donate Now
        <ArrowRight className="inline-block ml-2 h-5 w-5" />
      </button>
    </motion.div>
  );
};

const ImpactCard = ({ story, index }: { story: typeof impactStories[0], index: number }) => {
  const Icon = story.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
    >
      <div className={`p-3 rounded-lg bg-${story.color}-100 text-${story.color}-600 inline-block mb-4`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{story.title}</h3>
      <p className="text-gray-600 mb-4">{story.description}</p>
      <p className="text-primary-600 font-medium">{story.impact}</p>
    </motion.div>
  );
};

export default function DonatePage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    amount: '',
    frequency: 'one-time',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    message: ''
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
                Support Our Mission
              </h1>
              <p className="text-xl text-gray-600">
                Your donation helps us provide essential mental health support and resources to those in need.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Donation Options */}
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
                Choose Your Impact
              </h2>
              <p className="text-xl text-gray-600">
                Select the donation option that best fits your giving preferences.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {donationOptions.map((option, index) => (
                <DonationOptionCard key={option.title} option={option} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* Impact Stories */}
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
                Your Impact
              </h2>
              <p className="text-xl text-gray-600">
                See how your support helps transform lives and communities.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {impactStories.map((story, index) => (
                <ImpactCard key={story.title} story={story} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* Donation Form */}
        <section id="donation-form" className="py-20">
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
                  Make Your Donation
                </h2>
                <p className="text-xl text-gray-600">
                  Fill out the form below to complete your donation securely.
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                      Amount
                    </label>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-2">
                      Frequency
                    </label>
                    <select
                      id="frequency"
                      name="frequency"
                      value={formData.frequency}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="one-time">One-Time</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                    <CreditCard className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      id="expiryDate"
                      name="expiryDate"
                      placeholder="MM/YY"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200"
                >
                  Complete Donation
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