'use client';

import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  date: string;
  summary: string;
  content: React.ReactNode;
}

function PostCard({
  post,
  isOpen,
  onToggle,
}: {
  post: Post;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="card p-6 flex flex-col h-full">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
        <p className="mt-1 text-sm text-gray-500">{new Date(post.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p className="mt-3 text-gray-700">{post.summary}</p>
        {isOpen && (
          <div className="mt-4 rounded-lg bg-gray-50 p-5 prose prose-slate max-w-none leading-relaxed">
            {post.content}
          </div>
        )}
      </div>
      <div className="mt-4">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          className="btn btn-outline px-4 py-2 text-primary-700 border-primary-600 hover:bg-primary-50"
        >
          <span className="inline-flex items-center gap-2">
            {isOpen ? (
              <>
                Collapse
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Read more
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </span>
        </button>
      </div>
    </div>
  );
}

function Section({
  sectionKey,
  title,
  description,
  posts,
  openSet,
  toggle,
}: {
  sectionKey: string;
  title: string;
  description: string;
  posts: Post[];
  openSet: Set<string>;
  toggle: (id: string) => void;
}) {
  return (
    <section className="py-10 sm:py-12">
      <div className="container">
        <h2 className="section-title">{title}</h2>
        <p className="section-description">{description}</p>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const key = `${sectionKey}-${post.id}`;
            const isOpen = openSet.has(key);
            return (
              <PostCard
                key={key}
                post={post}
                isOpen={isOpen}
                onToggle={() => toggle(key)}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function BlogPage() {
  const [openPostIds, setOpenPostIds] = useState<Set<string>>(new Set());

  const toggle = (key: string) => {
    setOpenPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const updatesPosts: Post[] = [
    {
      id: 'u1',
      title: 'Platform v1.2 Release',
      date: '2025-07-01',
      summary: 'We rolled out significant improvements to performance, accessibility, and content structure across the site.',
      content: (
        <div>
          <p>
            Today we released version 1.2 with a focus on speed and accessibility. Pages now load faster, keyboard navigation
            has improved, and we refined color contrast for better readability. We also streamlined content organization to help
            visitors discover programs and resources more easily.
          </p>
          <ul>
            <li>Optimized images and font loading</li>
            <li>Improved keyboard focus states</li>
            <li>Clearer headings and hierarchy</li>
          </ul>
          <p>
            We&apos;ll continue iterating in upcoming releases. Thank you for your continued support!
          </p>
        </div>
      ),
    },
    {
      id: 'u2',
      title: 'New Volunteer Portal Beta',
      date: '2025-06-15',
      summary: 'A beta of the volunteer portal is live for early feedback with task assignments and onboarding materials.',
      content: (
        <div>
          <p>
            The volunteer portal beta introduces task tracking, onboarding checklists, and a unified place for updates.
            We are gathering feedback to shape the next milestones before a full public release.
          </p>
          <p>
            If you would like to be part of the beta, please reach out to our team.
          </p>
        </div>
      ),
    },
  ];

  const commPosts: Post[] = [
    {
      id: 'c1',
      title: 'Community Town Hall — Highlights',
      date: '2025-05-20',
      summary: 'Thank you to everyone who joined our recent town hall. Here are the key takeaways and next steps.',
      content: (
        <div>
          <p>
            We discussed upcoming programs, opportunities to get involved, and answered questions from the community.
            Your feedback helps us prioritize initiatives that matter most.
          </p>
          <p>
            We&apos;ll share dates for the next town hall soon. Stay tuned!
          </p>
        </div>
      ),
    },
    {
      id: 'c2',
      title: 'Important Service Update',
      date: '2025-04-12',
      summary: 'Service hours have been adjusted for the next month due to scheduled maintenance and training.',
      content: (
        <div>
          <p>
            To better support our team and enhance service quality, we&apos;re adjusting certain program hours temporarily.
            Please check the Programs page for the most up-to-date schedule.
          </p>
        </div>
      ),
    },
  ];

  const articlesPosts: Post[] = [
    {
      id: 'a1',
      title: 'Creating Supportive Spaces for Young Adults',
      date: '2025-03-08',
      summary: 'Practical ways to build supportive environments that promote mental well-being and connection.',
      content: (
        <div>
          <p>
            Supportive spaces start with listening, empathy, and consistent routines. Small changes — like dedicated quiet areas,
            clear schedules, and peer circles — can make a big difference.
          </p>
          <p>
            In this article, we outline simple steps you can take at home, school, or in community groups to foster belonging
            and resilience.
          </p>
        </div>
      ),
    },
    {
      id: 'a2',
      title: 'Mindfulness Basics: Getting Started',
      date: '2025-02-14',
      summary: 'An approachable introduction to mindfulness with short daily practices you can try today.',
      content: (
        <div>
          <p>
            Mindfulness is about paying attention to the present moment with curiosity and without judgment. Start small:
            two minutes of breathing, noticing sensations, and returning when your mind wanders.
          </p>
          <ol>
            <li>Begin with a short breathing exercise</li>
            <li>Use gentle reminders to pause during your day</li>
            <li>Reflect briefly on what felt supportive</li>
          </ol>
        </div>
      ),
    },
  ];

  return (
    <>
      <Navbar />
      <main>
        <section className="bg-white border-b">
          <div className="container py-10 sm:py-12">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Blog</h1>
            <p className="mt-4 max-w-2xl text-lg text-gray-600">
              Stories, updates, and resources from our community. Explore announcements, progress updates, and long-form articles — all in one place.
            </p>
          </div>
        </section>

        <Section
          sectionKey="updates"
          title="Updates"
          description="The latest changes and improvements across our platform and programs."
          posts={updatesPosts}
          openSet={openPostIds}
          toggle={toggle}
        />

        <Section
          sectionKey="communications"
          title="Communications & Announcements"
          description="Timely messages for our community, including schedules and event highlights."
          posts={commPosts}
          openSet={openPostIds}
          toggle={toggle}
        />

        <Section
          sectionKey="articles"
          title="Articles"
          description="Thought pieces, guides, and educational content written by our team and partners."
          posts={articlesPosts}
          openSet={openPostIds}
          toggle={toggle}
        />
      </main>
      <Footer />
    </>
  );
}