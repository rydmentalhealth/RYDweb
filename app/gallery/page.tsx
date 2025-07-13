'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Search, Filter, Maximize2, Download } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const categories = [
  { id: 'all', name: 'All Images' },
  { id: 'events', name: 'Community Events' },
  { id: 'programs', name: 'Support Programs' },
  { id: 'community', name: 'Community Impact' },
  { id: 'workshops', name: 'Workshops & Training' },
];

const images = [
  {
    id: 1,
    src: '/gallery/G1.jpeg',
    alt: 'Community gathering and support session',
    category: 'community',
    description: 'Community members coming together for a support session, sharing experiences and building connections.',
  },
  {
    id: 2,
    src: '/gallery/G2.jpeg',
    alt: 'Mental health awareness workshop',
    category: 'workshops',
    description: 'Interactive workshop session focusing on mental health awareness and well-being practices.',
  },
  {
    id: 3,
    src: '/gallery/G3.jpeg',
    alt: 'Youth empowerment program',
    category: 'programs',
    description: 'Young participants engaging in our youth empowerment program, developing life skills and confidence.',
  },
  {
    id: 4,
    src: '/gallery/G4.jpeg',
    alt: 'Community outreach event',
    category: 'events',
    description: 'Outreach program bringing mental health support and resources to local communities.',
  },
  {
    id: 5,
    src: '/gallery/G5.jpeg',
    alt: 'Group therapy session',
    category: 'programs',
    description: 'Supportive group therapy session providing a safe space for sharing and healing.',
  },
  {
    id: 6,
    src: '/gallery/G6.jpeg',
    alt: 'Mental health training workshop',
    category: 'workshops',
    description: 'Professional training workshop for mental health awareness and support techniques.',
  },
  {
    id: 7,
    src: '/gallery/G7.jpeg',
    alt: 'Community celebration event',
    category: 'events',
    description: 'Joyful community celebration marking the success of our mental health initiatives.',
  },
  {
    id: 8,
    src: '/gallery/G8.jpeg',
    alt: 'Support group meeting',
    category: 'programs',
    description: 'Regular support group meeting fostering connection and mutual understanding.',
  },
  {
    id: 9,
    src: '/gallery/G9.jpeg',
    alt: 'Youth mental health program',
    category: 'programs',
    description: 'Engaging youth program focused on mental health education and support.',
  },
  {
    id: 10,
    src: '/gallery/G10.jpeg',
    alt: 'Community workshop session',
    category: 'workshops',
    description: 'Interactive workshop session with community members learning about mental well-being.',
  },
  {
    id: 11,
    src: '/gallery/G11.jpeg',
    alt: 'Mental health awareness event',
    category: 'events',
    description: 'Community event raising awareness about mental health and available support services.',
  },
  {
    id: 12,
    src: '/gallery/G12.jpeg',
    alt: 'Support program activities',
    category: 'programs',
    description: 'Participants engaging in therapeutic activities during a support program session.',
  },
  {
    id: 13,
    src: '/gallery/G13.jpeg',
    alt: 'Community mental health workshop',
    category: 'workshops',
    description: 'Comprehensive mental health workshop for community members and leaders.',
  },
  {
    id: 14,
    src: '/gallery/G14.jpeg',
    alt: 'Youth support program',
    category: 'programs',
    description: 'Dedicated youth support program helping young people navigate mental health challenges.',
  },
  {
    id: 15,
    src: '/gallery/G15.jpeg',
    alt: 'Community mental health event',
    category: 'events',
    description: 'Large-scale community event promoting mental health awareness and support.',
  },
  {
    id: 16,
    src: '/gallery/G16.jpeg',
    alt: 'Mental health training session',
    category: 'workshops',
    description: 'Professional training session for mental health support and intervention techniques.',
  },
];

const GalleryImage = ({ image, onClick }: { image: typeof images[0], onClick: () => void }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.3 }}
    className="relative group cursor-pointer overflow-hidden rounded-xl"
    onClick={onClick}
  >
    <div className="aspect-square relative">
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className="object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <p className="text-white text-xs sm:text-sm font-medium mb-1 sm:mb-2 line-clamp-2">{image.description}</p>
          <div className="flex items-center space-x-2">
            <span className="text-white/80 text-[10px] sm:text-xs bg-white/10 px-2 py-0.5 sm:py-1 rounded-full">
              {categories.find(cat => cat.id === image.category)?.name}
            </span>
          </div>
        </div>
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
          <div className="bg-white/10 backdrop-blur-sm p-1.5 sm:p-2 rounded-full">
            <Maximize2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

const Lightbox = ({ image, onClose, onNext, onPrevious }: {
  image: typeof images[0],
  onClose: () => void,
  onNext: () => void,
  onPrevious: () => void,
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
    onClick={onClose}
  >
    <button
      className="absolute top-2 sm:top-4 right-2 sm:right-4 text-white hover:text-gray-300 transition-colors bg-white/10 backdrop-blur-sm p-1.5 sm:p-2 rounded-full"
      onClick={onClose}
    >
      <X className="h-5 w-5 sm:h-6 sm:w-6" />
    </button>
    
    <button
      className="absolute left-2 sm:left-4 text-white hover:text-gray-300 transition-colors bg-white/10 backdrop-blur-sm p-1.5 sm:p-2 rounded-full"
      onClick={(e) => {
        e.stopPropagation();
        onPrevious();
      }}
    >
      <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
    </button>
    
    <button
      className="absolute right-2 sm:right-4 text-white hover:text-gray-300 transition-colors bg-white/10 backdrop-blur-sm p-1.5 sm:p-2 rounded-full"
      onClick={(e) => {
        e.stopPropagation();
        onNext();
      }}
    >
      <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
    </button>

    <div className="relative w-full max-w-5xl aspect-square">
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes="100vw"
        className="object-contain"
        priority
      />
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-6 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex-1 mr-2">
            <h3 className="text-white text-sm sm:text-xl font-semibold mb-1 sm:mb-2 line-clamp-2">{image.description}</h3>
            <span className="text-white/80 text-xs sm:text-sm bg-white/10 px-2 py-0.5 sm:py-1 rounded-full">
              {categories.find(cat => cat.id === image.category)?.name}
            </span>
          </div>
          <button className="bg-white/10 backdrop-blur-sm p-1.5 sm:p-2 rounded-full hover:bg-white/20 transition-colors flex-shrink-0">
            <Download className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  </motion.div>
);

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<typeof images[0] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredImages, setFilteredImages] = useState(images);

  useEffect(() => {
    let filtered = images;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(img => img.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(img => 
        img.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredImages(filtered);
  }, [selectedCategory, searchQuery]);

  const handleNext = () => {
    if (!selectedImage) return;
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
    const nextIndex = (currentIndex + 1) % filteredImages.length;
    setSelectedImage(filteredImages[nextIndex]);
  };

  const handlePrevious = () => {
    if (!selectedImage) return;
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
    const previousIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    setSelectedImage(filteredImages[previousIndex]);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-white py-12 sm:py-20">
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
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                Our Gallery
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8">
                Explore moments of hope, healing, and transformation through our collection of images.
              </p>
              
              {/* Search and Filter */}
              <div className="flex flex-col gap-4">
                <div className="relative w-full max-w-md mx-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search images..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
                <div className="flex flex-wrap justify-center gap-2 px-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="py-8 sm:py-20">
          <div className="container mx-auto px-2 sm:px-6 lg:px-8">
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6"
            >
              <AnimatePresence>
                {filteredImages.map((image) => (
                  <GalleryImage
                    key={image.id}
                    image={image}
                    onClick={() => setSelectedImage(image)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>

        {/* Lightbox */}
        <AnimatePresence>
          {selectedImage && (
            <Lightbox
              image={selectedImage}
              onClose={() => setSelectedImage(null)}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}
        </AnimatePresence>
      </div>
      <Footer />
    </>
  );
} 