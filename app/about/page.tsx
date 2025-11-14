'use client';

import { useState } from 'react';
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
  Handshake,
  Sparkles,
  Zap,
  Eye,
  Rocket,
  Wand2,
  ChevronDown,
  ChevronUp
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

// Avenger identity configurations
const avengerIdentities: Record<string, {
  name: string;
  icon: typeof Sparkles;
  color: string;
  gradient: string;
  description: string;
  power: string;
}> = {
  'Scarlet Witch': {
    name: 'Scarlet Witch',
    icon: Wand2,
    color: 'red',
    gradient: 'from-red-500 via-pink-500 to-purple-600',
    description: 'Master of transformation and healing',
    power: 'Reality Manipulation'
  },
  'Nick Fury': {
    name: 'Nick Fury',
    icon: Eye,
    color: 'slate',
    gradient: 'from-slate-600 via-gray-700 to-black',
    description: 'Strategic leader and organizer',
    power: 'Strategic Vision'
  },
  'Black Widow': {
    name: 'Black Widow',
    icon: Zap,
    color: 'red',
    gradient: 'from-red-600 via-orange-500 to-yellow-500',
    description: 'Empathetic guardian and advocate',
    power: 'Empathetic Connection'
  },
  'Logan Roy': {
    name: 'Logan Roy',
    icon: Rocket,
    color: 'orange',
    gradient: 'from-orange-500 via-red-500 to-yellow-500',
    description: 'Creative visionary and storyteller',
    power: 'Creative Mastery'
  },
  'Iron Man': {
    name: 'Iron Man',
    icon: Sparkles,
    color: 'blue',
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
    description: 'Innovative therapist and healer',
    power: 'Technological Healing'
  }
};

const team = [
  {
    name: 'Namuyanja Annah Veronica',
    role: 'Chief Operations Officer',
    image: '/veronica-namuyanja.jpeg',
    bio: 'Veronica is a medical student passionate about mental health as an entity in health. She is dedicated to incorporating mental health in general health care systems through creating awareness and building a safe space for peers and addressing core issues concerning mental health that are often underlooked by society.',
    avengerIdentity: 'Scarlet Witch'
  },
  {
    name: 'Henry Bwambale',
    role: 'General Secretary',
    image: '/henry-bwambale.jpeg',
    bio: 'Henry is a dedicated medical student with a deep passion for mental health, health systems, and organizational leadership. As General Secretary at RYD Mental Health, he is committed to fostering structure, collaboration, and purpose-driven impact within the organization. Henry believes in the power of organized systems and compassionate leadership to create meaningful change in communities.',
    avengerIdentity: 'Nick Fury'
  },
  {
    name: 'Reem Adio',
    role: 'Client Experience Associate',
    image: '/reem-adio.jpeg',
    bio: 'Reem is a 5th-year medical student with a deep passion for mental health advocacy and holistic well-being. Driven by a desire to bridge the gap between clinical medicine and emotional wellness, Reem actively promotes mental health awareness among students and communities. Through initiatives such as expressive writing, peer support, and education, she aims to empower individuals to prioritize their mental well-being and seek help without stigma. Her interests lie in psychiatry, community mental health, and the integration of mindfulness and self-care into everyday life. Reem believes that true healing begins when both the mind and body are cared for with compassion.',
    avengerIdentity: 'Black Widow'
  },
  {
    name: 'Raymond Kasagga',
    role: 'Creatives Director',
    image: '/raymond-kasagga.jpeg',
    bio: 'Raymond is a 5th-year medical student passionate about mental health awareness and creative storytelling. He uses his voice and creativity to inspire conversations, challenge stigma, and promote healing within communities.',
    avengerIdentity: 'Logan Roy'
  },
  {
    name: 'Paul Ssemwogerere Birungi',
    role: 'Programs Director',
    image: '/paul-birungi.jpeg',
    bio: 'Paul Ssemwogerere Birungi is a psychotherapist and community psychologist dedicated to advancing mental health and emotional well-being. At RYD, he supports individuals and communities through therapy, psychosocial support, and wellness programs that promote healing and resilience. His work combines empathy with evidence-based practice, ensuring inclusive and person-centered care. Paul is also a strong advocate for disability inclusion and the mental health rights of vulnerable groups in Uganda.',
    avengerIdentity: 'Iron Man'
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
    description: 'Receive multiple awards for excellence in mental health services.'
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
  const avenger = avengerIdentities[member.avengerIdentity];
  const AvengerIcon = avenger.icon;
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Determine if bio is long enough to need truncation (more than ~180 characters)
  const BIO_TRUNCATE_LENGTH = 180;
  const needsTruncation = member.bio.length > BIO_TRUNCATE_LENGTH;
  
  // Truncate at word boundary for better readability
  const truncateBio = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
  };
  
  const displayBio = isExpanded || !needsTruncation 
    ? member.bio 
    : truncateBio(member.bio, BIO_TRUNCATE_LENGTH);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-transparent hover:border-gray-200 transition-all duration-300"
    >
      {/* Avenger Badge - Top Right */}
      <div className={`absolute top-4 right-4 z-20 bg-gradient-to-br ${avenger.gradient} p-3 rounded-full shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
        <AvengerIcon className="h-6 w-6 text-white" />
      </div>

      {/* Gradient Overlay on Image */}
      <div className={`absolute inset-0 bg-gradient-to-t ${avenger.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300 z-10`}></div>

      {/* Profile Image */}
      <div className="relative h-72 overflow-hidden">
        <Image
          src={member.image}
          alt={member.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {/* Shine effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
      </div>

      {/* Content */}
      <div className="p-6 relative z-10">
        {/* Avenger Identity Badge */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${avenger.gradient} text-white text-sm font-semibold mb-4 shadow-md`}>
          <AvengerIcon className="h-4 w-4" />
          <span>{avenger.name}</span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
          {member.name}
        </h3>
        <p className="text-primary-600 font-semibold mb-3 text-sm uppercase tracking-wide">
          {member.role}
        </p>
        
        {/* Bio with See More functionality */}
        <div className="mb-3 relative z-10">
          <p className={`text-gray-600 text-sm leading-relaxed ${!isExpanded && needsTruncation ? 'line-clamp-4' : ''}`}>
            {displayBio}
          </p>
          {needsTruncation && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsExpanded(prev => !prev);
              }}
              className={`mt-3 relative z-20 inline-flex items-center gap-1.5 text-sm font-semibold transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md px-2 py-1 -ml-2 hover:bg-gray-50 active:scale-95 ${
                isExpanded 
                  ? `text-gray-600 hover:text-gray-800` 
                  : `text-primary-600 hover:text-primary-700`
              }`}
              aria-label={isExpanded ? 'Show less bio' : 'Show more bio'}
              aria-expanded={isExpanded}
            >
              <span>{isExpanded ? 'See less' : 'See more'}</span>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="inline-flex"
              >
                <ChevronDown className="h-4 w-4" />
              </motion.div>
            </button>
          )}
        </div>

        {/* Power Badge */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
            <span className="font-medium">{avenger.power}</span>
          </div>
        </div>
      </div>

      {/* Decorative corner accent */}
      <div className={`absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr ${avenger.gradient} opacity-5 rounded-tr-full`}></div>
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
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-4xl mx-auto mb-16"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 text-white text-sm font-semibold mb-6 shadow-lg">
                <Shield className="h-4 w-4" />
                <span>RYD Avengers Initiative</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Team
              </h2>
              <p className="text-xl text-gray-600 mb-4">
                Meet the dedicated professionals behind our mission.
              </p>
              <p className="text-gray-500 max-w-2xl mx-auto">
                At RYD, we believe every team member is a hero and brings a unique strength to the mission of restoring minds and empowering communities. To celebrate this, each core leader is matched with an "Avenger Identity" — a symbol of their role, personality, and contribution to the organization.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {team.map((member, index) => (
                <TeamCard key={member.name} member={member} index={index} />
              ))}
            </div>

            {/* Avenger Legend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-16 max-w-4xl mx-auto"
            >
              <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center flex items-center justify-center gap-2">
                  <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                  <span>Avenger Identities</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(avengerIdentities).map(([key, avenger]) => {
                    const Icon = avenger.icon;
                    return (
                      <div
                        key={key}
                        className={`p-4 rounded-xl bg-gradient-to-br ${avenger.gradient} bg-opacity-10 border-2 border-transparent hover:border-gray-300 transition-all`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${avenger.gradient}`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">{avenger.name}</h4>
                            <p className="text-xs text-gray-600">{avenger.description}</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          <span className="font-semibold">Power:</span> {avenger.power}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
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
