'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  Heart, 
  Users, 
  Target, 
  Lightbulb, 
  Shield, 
  ArrowRight,
  Star,
  Award,
  Handshake
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const values = [
  {
    title: 'Compassion',
    description: 'We approach every individual with empathy, understanding, and genuine care.',
    icon: Heart,
    color: 'red'
  },
  {
    title: 'Community',
    description: 'Building supportive networks and fostering connections for collective healing.',
    icon: Users,
    color: 'blue'
  },
  {
    title: 'Excellence',
    description: 'Delivering high-quality, evidence-based mental health support and services.',
    icon: Star,
    color: 'yellow'
  },
  {
    title: 'Integrity',
    description: 'Operating with transparency, honesty, and ethical principles.',
    icon: Shield,
    color: 'green'
  }
];

const team = [
  {
    name: 'Shalom Omondo',
    role: 'Founder & Executive Director',
    image: '/MariamNakatudde2.jpeg',
    bio: 'A passionate mental health advocate with over 5 years of experience working with mental health organizations. Her dedication to transforming lives through accessible mental healthcare and community support has helped countless individuals on their healing journey.'
  },
  {
    name: 'Augustus Twinemugabe',
    role: 'Founder & Marketing Director',
    image: '/AugustusTwinemugabe.jpeg',
    bio: 'Leading the organization\'s creative direction and outreach strategies. He also guides community programs and support initiatives with passion and expertise, working to create safe, inclusive spaces for healing.'
  }
];

const milestones = [
  {
    year: '2015',
    title: 'Foundation',
    description: 'RYD was established with a vision to transform mental health support.'
  },
  {
    year: '2018',
    title: 'Community Growth',
    description: 'Expanded to serve over 1,000 individuals through our programs.'
  },
  {
    year: '2020',
    title: 'Digital Innovation',
    description: 'Launched our online support platform and virtual counseling services.'
  },
  {
    year: '2023',
    title: 'National Recognition',
    description: 'Received multiple awards for excellence in mental health services.'
  }
];

const ValueCard = ({ value, index }: { value: typeof values[0], index: number }) => {
  const Icon = value.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className={`p-4 rounded-xl bg-${value.color}-100 text-${value.color}-600 inline-block mb-6`}>
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-2xl font-semibold text-gray-900 mb-4">{value.title}</h3>
      <p className="text-gray-600">{value.description}</p>
    </motion.div>
  );
};

const TeamCard = ({ member, index }: { member: typeof team[0], index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden"
    >
      <div className="relative h-64">
        <Image
          src={member.image}
          alt={member.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
        <p className="text-primary-600 font-medium mb-3">{member.role}</p>
        <p className="text-gray-600">{member.bio}</p>
      </div>
    </motion.div>
  );
};

const MilestoneCard = ({ milestone, index }: { milestone: typeof milestones[0], index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative pl-8 pb-8 last:pb-0"
    >
      <div className="absolute left-0 top-0 w-4 h-4 bg-primary-600 rounded-full"></div>
      <div className="absolute left-[7px] top-4 bottom-0 w-0.5 bg-gray-200 last:hidden"></div>
      <div className="bg-white p-6 rounded-xl shadow-md">
        <span className="text-primary-600 font-semibold">{milestone.year}</span>
        <h3 className="text-xl font-semibold text-gray-900 mt-2 mb-2">{milestone.title}</h3>
        <p className="text-gray-600">{milestone.description}</p>
      </div>
    </motion.div>
  );
};

export default function AboutPage() {
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
                Our Story
              </h1>
              <p className="text-xl text-gray-600">
                Dedicated to transforming lives through comprehensive mental health support and community engagement.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Our Mission
                </h2>
                <p className="text-xl text-gray-600 mb-6">
                  At RYD, we're committed to restoring dignity and hope through accessible, compassionate mental health support. We believe that everyone deserves access to quality mental health care and a supportive community.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Target className="h-6 w-6 text-primary-600 mt-1" />
                    <p className="text-gray-600">Providing comprehensive mental health support services</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Lightbulb className="h-6 w-6 text-primary-600 mt-1" />
                    <p className="text-gray-600">Fostering innovation in mental health care delivery</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Handshake className="h-6 w-6 text-primary-600 mt-1" />
                    <p className="text-gray-600">Building strong, supportive communities</p>
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl"
              >
                <Image
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                  alt="Team collaboration"
                  fill
                  className="object-cover"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section */}
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
                Our Values
              </h2>
              <p className="text-xl text-gray-600">
                The principles that guide our work and shape our impact on the community.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <ValueCard key={value.title} value={value} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
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
                Our Team
              </h2>
              <p className="text-xl text-gray-600">
                Meet the dedicated professionals behind our mission.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <TeamCard key={member.name} member={member} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
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
                Our Journey
              </h2>
              <p className="text-xl text-gray-600">
                Key milestones in our mission to transform mental health support.
              </p>
            </motion.div>

            <div className="max-w-3xl mx-auto">
              {milestones.map((milestone, index) => (
                <MilestoneCard key={milestone.year} milestone={milestone} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary-600">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Join Our Mission
              </h2>
              <p className="text-xl text-primary-100 mb-8">
                Be part of our journey to transform mental health support and create lasting positive change.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/volunteer"
                  className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-base font-medium rounded-full text-white hover:bg-white hover:text-primary-600 transition-all duration-300"
                >
                  Volunteer
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
                <a
                  href="/donate"
                  className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-base font-medium rounded-full text-white hover:bg-white hover:text-primary-600 transition-all duration-300"
                >
                  Donate
                  <ArrowRight className="ml-2 h-5 w-5" />
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