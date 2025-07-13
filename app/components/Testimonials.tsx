'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import Image from 'next/image';
import 'swiper/css';
import 'swiper/css/pagination';

const testimonials = [
  {
    id: 1,
    name: 'Trevor Twinomugisha',
    role: 'Community Member',
    content: 'RYD has been a lifeline for me. The support and resources provided have helped me navigate my mental health journey with confidence.',
    rating: 5,
    image: '/Trevor_Twinomugisha.jpeg',
  },
  {
    id: 2,
    name: 'Marian Mable',
    role: 'Volunteer',
    content: 'Being part of RYD\'s community has been incredibly rewarding. The organization\'s commitment to mental health support is truly inspiring.',
    rating: 5,
    image: '/Marian_Mable.jpeg',
  },
  {
    id: 3,
    name: 'Elvis Ssebalamu',
    role: 'Program Participant',
    content: 'The self-assessment tools and resources provided by RYD have been invaluable in my recovery process. I\'m grateful for this supportive community.',
    rating: 5,
    image: '/Elvis_Ssebalamu.jpeg',
  },
  {
    id: 4,
    name: 'Mugisa Charles',
    role: 'Support Group Member',
    content: 'The community support and professional guidance at RYD have transformed my life. I\'ve found strength and hope through their programs.',
    rating: 5,
    image: '/Mugisa_Charles.jpeg',
  },
  {
    id: 5,
    name: 'Innocent Musinguzi',
    role: 'Mental Health Advocate',
    content: 'As a mental health advocate, I\'ve seen many organizations, but RYD stands out for their holistic approach and genuine care for individuals.',
    rating: 5,
    image: '/Innocent_Musinguzi.jpeg',
  },
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="section-title">What Our Community Says</h2>
          <p className="section-description">
            Read testimonials from individuals who have found support and healing through RYD
          </p>
        </motion.div>

        <div className="relative">
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={30}
            slidesPerView={1}
            pagination={{ clickable: true }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            speed={1000}
            loop={true}
            breakpoints={{
              640: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
            className="pb-12"
          >
            {testimonials.map((testimonial) => (
              <SwiperSlide key={testimonial.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="card p-8 h-full bg-white hover:shadow-2xl transition-all duration-500 rounded-2xl border border-gray-100 relative overflow-hidden group"
                >
                  {/* Healing background pattern */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-purple-50 opacity-50"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-100 rounded-full translate-y-16 -translate-x-16 opacity-20"></div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-center mb-6">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4 ring-4 ring-primary-100 group-hover:ring-primary-200 transition-all duration-500">
                        <Image
                          src={testimonial.image}
                          alt={testimonial.name}
                          fill
                          className="object-cover transform group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg">{testimonial.name}</h4>
                        <p className="text-sm text-primary-600 font-medium">{testimonial.role}</p>
                      </div>
                    </div>

                    <div className="flex mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Heart
                          key={i}
                          className="h-5 w-5 text-primary-400 fill-current transform group-hover:scale-110 transition-transform duration-300"
                        />
                      ))}
                    </div>

                    <div className="relative">
                      <div className="absolute -top-4 -left-4 text-6xl text-primary-100 opacity-20">"</div>
                      <p className="text-gray-600 italic leading-relaxed text-lg relative z-10">
                        {testimonial.content}
                      </p>
                      <div className="absolute -bottom-4 -right-4 text-6xl text-primary-100 opacity-20 rotate-180">"</div>
                    </div>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default Testimonials; 