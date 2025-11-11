'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, Heart, Users, Award, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface Profile {
  id: string;
  name: string;
  title: string;
  photo: string;
  story: string;
  highlight: string;
}

const profiles: Profile[] = [
  {
    id: 'evelyne',
    name: 'Evelyne Kokurorwaho',
    title: 'Volunteer',
    photo: '/evelyne-kokurorwaho.jpg',
    story: `At RYD Mental Health, we believe true impact begins with people who show up and Evelyne Kokurorwaho is one of them.

Evelyne recently represented RYD at the 2025 AMR Awareness Run at KIU Western Campus, where she passionately engaged participants in conversations about mental wellness, journaling, and self-care. Her energy and empathy reflected the very heart of our mission — to make mental health approachable, relatable, and accessible to all.

As a volunteer, Evelyne continues to inspire others through her dedication and leadership. Her story reminds us that you don't need a title to make a difference — just a willing heart and the courage to take action.

💚 Thank you, Evelyne, for being an example of what it means to restore, yield, and develop.`,
    highlight: 'A Beacon of Passion and Purpose'
  }
];

const ProfileCard = ({ profile, onOpen }: { profile: Profile; onOpen: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
      onClick={onOpen}
    >
      <div className="relative h-80 overflow-hidden">
        <Image
          src={profile.photo}
          alt={profile.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="text-white text-sm font-medium">{profile.highlight}</p>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-primary-600" />
          <span className="text-sm font-medium text-primary-600 uppercase tracking-wide">{profile.title}</span>
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-3">{profile.name}</h3>
        <p className="text-gray-600 line-clamp-3">{profile.story.split('\n\n')[0]}</p>
        <button className="mt-4 text-primary-600 font-medium hover:text-primary-700 transition-colors">
          Read full story →
        </button>
      </div>
    </motion.div>
  );
};

const ProfileModal = ({ profile, isOpen, onClose }: { profile: Profile | null; isOpen: boolean; onClose: () => void }) => {
  if (!profile) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-2xl font-bold text-gray-900">Volunteer Spotlight</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close modal"
                >
                  <X className="h-6 w-6 text-gray-600" />
                </button>
              </div>
              
              <div className="p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="md:col-span-1">
                    <div className="relative h-64 md:h-full rounded-xl overflow-hidden">
                      <Image
                        src={profile.photo}
                        alt={profile.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-5 w-5 text-primary-600" />
                      <span className="text-sm font-medium text-primary-600 uppercase tracking-wide">{profile.title}</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">{profile.name}</h3>
                    <p className="text-xl text-primary-600 font-medium mb-4">{profile.highlight}</p>
                  </div>
                </div>
                
                <div className="prose prose-lg max-w-none">
                  {profile.story.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-gray-700 mb-4 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default function FacesOfRYDPage() {
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (profile: Profile) => {
    setSelectedProfile(profile);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProfile(null), 300);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 via-purple-50 to-white py-20">
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

        {/* Profiles Grid Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {profiles.length === 0 ? (
              <div className="text-center py-20">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">More faces coming soon...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {profiles.map((profile) => (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    onOpen={() => openModal(profile)}
                  />
                ))}
              </div>
            )}
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
      <ProfileModal
        profile={selectedProfile}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
}
