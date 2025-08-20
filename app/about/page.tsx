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
    title: 'Faith-Inspired Compassion',
    description: 'We serve with the love of God, seeing every individual as created in His image. Our faith drives us to offer care, comfort, and empathy without judgment.',
    icon: Heart,
    color: 'red'
  },
  {
    title: 'Dignity for All',
    description: 'We uphold the inherent worth of every person regardless of status, ability, background, or experience. Every life is valuable and deserving of respect and mental wellness.',
    icon: Award,
    color: 'yellow'
  },
  {
    title: 'Inclusion and Accessibility',
    description: 'We are committed to creating safe, inclusive spaces where refugees, youth, and persons with disabilities feel seen, heard, and supported without barriers.',
    icon: Users,
    color: 'blue'
  },
  {
    title: 'Holistic Healing',
    description: 'We believe true healing addresses the mind, body, and spirit. Our approach integrates psychological care, spiritual support, and community strength.',
    icon: Lightbulb,
    color: 'green'
  },
  {
    title: 'Integrity and Accountability',
    description: 'We hold ourselves to high ethical standards in all we do — acting with honesty, transparency, and responsibility in service and leadership.',
    icon: Shield,
    color: 'purple'
  },
  {
    title: 'Empowerment through Service',
    description: 'We walk alongside individuals and communities to build resilience, self-worth, and purpose, empowering them to become agents of change in their own lives.',
    icon: ArrowRight,
    color: 'indigo'
  },
  {
    title: 'Advocacy and Justice',
    description: 'We raise our voice for those who are often unheard, challenging stigma, discrimination, and injustice in mental health and disability care.',
    icon: Target,
    color: 'pink'
  },
  {
    title: 'Community and Partnership',
    description: 'We grow stronger together, partnering with families, faith communities, health professionals, and local leaders to expand care and impact.',
    icon: Handshake,
    color: 'teal'
  }
];

const team = [
  {
    name: 'Shalom Omondo',
    role: 'Co-Founder & Executive Director',
    image: '/MariamNakatudde2.jpeg',
    bio: 'A passionate mental health advocate with over 5 years of experience working with mental health organizations. Her dedication to transforming lives through accessible mental healthcare and community support has helped countless individuals on their healing journey.'
  },
  {
    name: 'Augustus Twinemugabe',
    role: 'Co-Founder & Marketing Director',
    image: '/AugustusTwinemugabe.jpeg',
    bio: 'Leading the organization\'s creative direction and outreach strategies. He also guides community programs and support initiatives with passion and expertise, working to create safe, inclusive spaces for healing.'
  }
];

const milestones = [
  {
    year: '2023',
    title: 'Foundation',
    description: 'RYD was established with a vision to transform mental health support.'
  },
  {
    year: '2024',
    title: 'Community Growth',
    description: 'Expanded to serve over 1,000 individuals through our programs.'
  },
  {
    year: '2025',
    title: 'Digital Innovation',
    description: 'Launched our online support platform and virtual counseling services.'
  },
  {
    year: '2026',
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
                A faith-driven mental health mission serving refugees, youth, and persons with disabilities through compassionate, culturally-sensitive, and spiritually-grounded care.
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
                  About Us
                </h2>
                <p className="text-xl text-gray-600 mb-6">
                  RYD (Refugees, Youth, and Persons with Disabilities) is a faith-based mental health organization dedicated to restoring hope, dignity, and healing in the lives of vulnerable communities. Guided by compassion and rooted in faith, we serve refugees, youth, and persons with disabilities, recognizing their unique challenges and strengths.
                </p>
                <p className="text-xl text-gray-600 mb-6">
                  We believe that mental wellness is a God-given right, not a privilege. Our mission is to bridge the gap in mental health care by offering holistic, culturally-sensitive, and spiritually-grounded support through therapy (online and in-person), community outreach, education, and advocacy.
                </p>
                <p className="text-xl text-gray-600 mb-6">
                  We walk alongside individuals and families, helping them overcome trauma, displacement, stigma, and exclusion. Through partnerships, prayer, and professional care, we empower people to reclaim their voices, rebuild their lives, and rise with resilience.
                </p>
                <p className="text-xl text-gray-600 mb-6">
                  Whether in crisis or on a journey of growth, RYD is a safe place to be heard, to heal, and to hope.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Heart className="h-6 w-6 text-primary-600 mt-1" />
                    <p className="text-gray-600">Therapy (Online and In-person)</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Users className="h-6 w-6 text-primary-600 mt-1" />
                    <p className="text-gray-600">Community outreach and support</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Lightbulb className="h-6 w-6 text-primary-600 mt-1" />
                    <p className="text-gray-600">Education and advocacy</p>
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
                Core Values of RYD
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
