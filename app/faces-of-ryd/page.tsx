'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Heart, Users, Sparkles, Calendar, User } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface Profile {
  id: string;
  name: string;
  title: string;
  photo: string;
  story: string;
  highlight: string;
  date: string;
}

const profiles: Profile[] = [
  {
    id: 'evelyne',
    name: 'Evelyne Kokurorwaho',
    title: 'Volunteer',
    photo: '/evelyne-amr-run-2025.jpg',
    date: 'November 2025',
    highlight: 'A Beacon of Passion and Purpose',
    story: `At RYD Mental Health, we believe true impact begins with people who show up and Evelyne Kokurorwaho is one of them.

Evelyne recently represented RYD at the 2025 AMR Awareness Run at KIU Western Campus, where she passionately engaged participants in conversations about mental wellness, journaling, and self-care. Her energy and empathy reflected the very heart of our mission — to make mental health approachable, relatable, and accessible to all.

As a volunteer, Evelyne continues to inspire others through her dedication and leadership. Her story reminds us that you don't need a title to make a difference — just a willing heart and the courage to take action.

💚 Thank you, Evelyne, for being an example of what it means to restore, yield, and develop.`
  }
];

const BlogPost = ({ profile }: { profile: Profile }) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden mb-12"
    >
      {/* Featured Image */}
      <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden">
        <Image
          src={profile.photo}
          alt={profile.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-white" />
              <span className="text-sm font-medium text-white/90 uppercase tracking-wide">{profile.title}</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-3">
              Volunteer Spotlight: {profile.name}
            </h2>
            <p className="text-xl md:text-2xl text-white/90 font-medium mb-4">
              {profile.highlight}
            </p>
            <div className="flex items-center gap-4 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{profile.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{profile.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-6 md:px-8 py-8 md:py-12">
        <div className="prose prose-lg md:prose-xl max-w-none">
          {profile.story.split('\n\n').map((paragraph, index) => {
            // Check if paragraph contains emoji or special formatting
            const isThankYou = paragraph.includes('💚');
            
            return (
              <p
                key={index}
                className={`mb-6 leading-relaxed ${
                  isThankYou
                    ? 'text-lg md:text-xl font-medium text-primary-700 italic'
                    : 'text-gray-700'
                }`}
              >
                {paragraph}
              </p>
            );
          })}
        </div>

        {/* Author Box */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-start gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={profile.photo}
                alt={profile.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-1">{profile.name}</h4>
              <p className="text-sm text-primary-600 font-medium mb-2">{profile.title}</p>
              <p className="text-sm text-gray-600">
                {profile.highlight}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default function FacesOfRYDPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 via-purple-50 to-white py-16 md:py-20">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-4000"></div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <Sparkles className="h-8 w-8 text-primary-600" />
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
                  🧠 Faces of RYD
                </h1>
                <Sparkles className="h-8 w-8 text-primary-600" />
              </div>
              <p className="text-xl md:text-2xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
                Every face tells a story. At RYD, our strength lies in the people who bring passion, empathy, and purpose to mental health advocacy. Meet the hearts behind the movement.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Blog Posts Section */}
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              {profiles.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">More stories coming soon...</p>
                </div>
              ) : (
                <div>
                  {profiles.map((profile) => (
                    <BlogPost key={profile.id} profile={profile} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-20 bg-gradient-to-r from-primary-600 to-purple-600">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Heart className="h-12 w-12 text-white mx-auto mb-6" />
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Join the Movement
                </h2>
                <p className="text-xl text-white/90 mb-8">
                  Be part of the RYD family. Whether you're a volunteer, partner, or advocate, your story matters. Together, we restore, yield, and develop.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/volunteer"
                    className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary-600 font-medium rounded-full hover:bg-gray-100 transition-all duration-300 shadow-lg"
                  >
                    Become a Volunteer
                  </a>
                  <a
                    href="/contact"
                    className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-medium rounded-full hover:bg-white/10 transition-all duration-300"
                  >
                    Get in Touch
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
