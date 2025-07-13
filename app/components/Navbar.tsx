'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ChevronDown, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Services', href: '/services' },
  { name: 'Programs', href: '/programs' },
  { name: 'Resources', href: '/resources' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="RYD Logo"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/programs/write-to-restore"
              className="btn btn-outline px-4 py-2 text-primary-600 border border-primary-600 hover:bg-primary-50"
            >
              Write to Restore
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-secondary-600 bg-secondary-50 hover:bg-secondary-100 rounded-lg transition-colors"
            >
              <Users className="h-4 w-4 mr-2" />
              Staff Login
            </Link>
            <Link
              href="/donate"
              className="btn btn-primary px-4 py-2"
            >
              Partner with Us
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-primary-600 focus:outline-none"
            >
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-b border-gray-200">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/programs/write-to-restore"
                className="block px-3 py-2 text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Write to Restore
              </Link>
              <Link
                href="/login"
                className="flex items-center px-3 py-2 text-secondary-600 bg-secondary-50 hover:bg-secondary-100 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                <Users className="h-4 w-4 mr-2" />
                Staff Login
              </Link>
              <Link
                href="/donate"
                className="block px-3 py-2 text-white bg-primary-600 hover:bg-primary-700 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Partner with Us
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar; 