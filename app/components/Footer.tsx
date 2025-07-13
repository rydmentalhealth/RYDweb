'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Youtube } from 'lucide-react';

// Custom TikTok icon since it's not available in lucide-react
const TikTokIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 12a4 4 0 1 0 4 4V4c0-1.1.9-2 2-2h2"></path>
    <path d="M12 16a4 4 0 0 1-4 4"></path>
  </svg>
);

const navigation = {
  main: [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'Get Help', href: '/get-help' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Join Our Team', href: '/signup' },
  ],
  support: [
    { name: 'FAQ', href: '/faq' },
    { name: 'Resources', href: '/resources' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Staff Portal', href: '/login' },
  ],
  social: [
    {
      name: 'Twitter',
      href: 'https://x.com/rydmentalhealth?s=21&t=PACYWgb3M-d3_bWgIFAq6g',
      icon: Twitter,
    },
    {
      name: 'TikTok',
      href: 'https://www.tiktok.com/@rydmentalhealthorg?_t=ZM-8vi2hLMY7lN&_r=1',
      icon: TikTokIcon,
    },
    {
      name: 'LinkedIn',
      href: 'https://www.linkedin.com/in/ryd-mental-health-organisation-aa0310361?trk=contact-info',
      icon: Linkedin,
    },
    {
      name: 'YouTube',
      href: 'https://youtube.com/@rydmentalhealthorg?si=0wLcGq47GWePyNM-',
      icon: Youtube,
    },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="RYD Logo"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-gray-400 text-sm">
              Supporting mental health and well-being through community and resources.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {navigation.main.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-primary-400 transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {navigation.support.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-primary-400 transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary-400 mt-1" />
                <span className="text-gray-400">
                Namugongo,<br />
                Wakiso, Uganda<br />
                P.O. Box 187215 Kampala GPO
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary-400" />
                <span className="text-gray-400">+256 709 039595 / +256 776 803262</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary-400" />
                <span className="text-gray-400">info@rydmentalhealth.org</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-6 mb-4 md:mb-0">
              {navigation.social.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-400 hover:text-primary-400 transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </Link>
              ))}
            </div>
            <div>
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} RYD Mental Health. All rights reserved.
              </p>
              <p className="text-gray-400 text-sm">
                Built with ❤️ by{' '}
                <a 
                  href="https://lawmwad.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary-400 transition-colors duration-200"
                >
                  LAWMWAD TECHNOLOGIES
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 