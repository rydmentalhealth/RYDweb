'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ChevronDown, ChevronUp, Brain, Feather, Heart, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Post {
  id: string;
  title: string;
  date: string;
  summary: string;
  content: React.ReactNode;
  coverImageUrl?: string;
  icon?: React.ComponentType<{ className?: string }>;
  authorName?: string;
  authorAvatarUrl?: string;
  authorBio?: string;
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
  const IconComponent = post.icon;
  return (
    <div className="card p-6 flex flex-col h-full">
      {post.coverImageUrl ? (
        <div className="relative -m-6 mb-4 h-40 overflow-hidden rounded-t-xl">
          <Image src={post.coverImageUrl} alt="" fill className="object-cover" />
        </div>
      ) : IconComponent ? (
        <div className="mb-4 -mt-2">
          <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-primary-100 to-primary-200 text-primary-700 flex items-center justify-center">
            <IconComponent className="h-6 w-6" />
          </div>
        </div>
      ) : null}
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
        <p className="mt-1 text-sm text-gray-500">{new Date(post.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p className="mt-3 text-gray-700">{post.summary}</p>
        {isOpen && (
          <div className="mt-4 rounded-lg bg-gray-50 p-5 prose prose-slate max-w-none leading-relaxed">
            {post.content}
          </div>
        )}
        {post.authorName && (
          <div className="mt-6 flex items-center gap-3 rounded-md bg-primary-50 p-3">
            <div className="h-10 w-10 flex items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-primary-100">
              {post.authorAvatarUrl ? (
                <Image src={post.authorAvatarUrl} alt={post.authorName} width={40} height={40} className="h-10 w-10 object-cover" />
              ) : (
                <User className="h-5 w-5 text-primary-600" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-primary-800">About the writer: {post.authorName}</p>
              {post.authorBio ? <p className="text-xs text-primary-700/80">{post.authorBio}</p> : null}
            </div>
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
        {posts.length === 0 ? (
          <div className="mt-8 text-sm text-muted-foreground">No posts found.</div>
        ) : (
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
        )}
      </div>
    </section>
  );
}

export default function BlogPage() {
  const [openPostIds, setOpenPostIds] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'all' | 'updates' | 'communications' | 'articles' | 'poems'>('all');

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
      id: 'u-1',
      title: 'RYD Partners with the AMR Club for the 2025 AMR Awareness Run',
      date: '2025-11-08',
      summary: 'RYD Mental Health proudly partnered with the AMR Club of Kampala International University–Western Campus for the annual AMR Awareness Run, promoting holistic health and mental wellness.',
      content: (
        <div className="space-y-6">
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Event Date:</strong> Saturday, 8th November 2025</p>
            <p><strong>Venue:</strong> Kampala International University – Western Campus, Ishaka</p>
          </div>
          
          <p>
            On 8th November 2025, RYD Mental Health proudly partnered with the Antimicrobial Resistance (AMR) Club of Kampala International University–Western Campus for the annual AMR Awareness Run—a powerful event aimed at promoting health awareness, fitness, and community engagement among students and staff.
          </p>
          
          <p>
            The event, which began at 7:00 a.m. at the KIU basketball court, brought together hundreds of participants under the theme of promoting responsible health practices and use of antibiotics and resilience within the university community.
          </p>
          
          <p>
            It featured a variety of activities including aerobics, a quiz session, health talks, entertainment, and the official AMR Run flagged off by university and community leaders.
          </p>
          
          <div className="my-6">
            <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden">
              <Image src="/amr-run-2025-1.jpg" alt="AMR Run 2025 event at KIU Western Campus" fill className="object-cover" />
            </div>
          </div>
          
          <p>
            RYD&apos;s participation focused on the mental wellness component of holistic health. Our team set up a wellness camp that offered participants the opportunity to:
          </p>
          
          <ul className="list-disc pl-6 space-y-2">
            <li>Learn about journaling as a therapeutic tool for stress management and emotional regulation.</li>
            <li>Register for free mental health consultations and therapy sessions.</li>
            <li>Purchase Write to Restore journals, whose proceeds support mental health outreach in underserved schools.</li>
            <li>Onboard new volunteers passionate about mental health advocacy and community work.</li>
          </ul>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            <div className="relative w-full h-64 rounded-lg overflow-hidden">
              <Image src="/amr-run-2025-2.jpg" alt="RYD team at AMR Run 2025 wellness camp" fill className="object-cover" />
            </div>
            <div className="relative w-full h-64 rounded-lg overflow-hidden">
              <Image src="/amr-run-2025-3.jpg" alt="Participants engaging with RYD wellness activities" fill className="object-cover" />
            </div>
          </div>
          
          <p>
            Our team was ably represented by Anita Asasira, Henry Bwambale (General Secretary), Raymond Kasaga (Creatives Director), Reem Adio, Ssebalamu Elvis, Evelyne Kokurorwaho, and Nyathak, who engaged participants throughout the event and led interactive sessions on journaling and self-care.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            <div className="relative w-full h-64 rounded-lg overflow-hidden">
              <Image src="/amr-run-2025-4.jpg" alt="RYD team members engaging with event participants" fill className="object-cover" />
            </div>
            <div className="relative w-full h-64 rounded-lg overflow-hidden">
              <Image src="/amr-run-2025-5.jpg" alt="AMR Run 2025 event activities and participants" fill className="object-cover" />
            </div>
          </div>
          
          <p>
            The partnership not only strengthened the bond between RYD and AMR Club but also emphasized the importance of integrating mental health awareness into broader public health initiatives.
          </p>
          
          <p>
            Through this collaboration, we continue to remind communities that true wellness is both physical and mental.
          </p>
          
          <div className="my-6">
            <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden">
              <Image src="/amr-run-2025-6.jpg" alt="AMR Run 2025 event highlights and community engagement" fill className="object-cover" />
            </div>
          </div>
          
          <p>
            As we look ahead, RYD remains committed to building more partnerships that inspire young people to prioritize their health, seek support, and embrace sustainable mental wellness practices.
          </p>
          
          <p className="text-lg font-medium text-primary-700 italic">
            Together, let&apos;s write to restore hope, strength, and resilience.
          </p>
        </div>
      ),
      coverImageUrl: '/amr-run-2025-1.jpg',
      icon: Heart,
    },
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
  const articlesPosts: Post[] = [
    {
      id: 'a1',
      title: 'THE NEGATIVE IMPACT OF SOCIAL MEDIA ON MENTAL HEALTH BY NAMUYANJA ANNAH VERONICA',
      date: '2025-08-08',
      summary: `While social media is part of the modern day life and has it’s positive impact, it poses a threat to mental health especially if you are not well grounded.
 Social media creates an ideal life through images on instagram,content on tiktok and through the unsolicited advise that tons of people have to give. This ideal life that is painted creates issues of fomo( fear of missing out), comparison which breeds lack of being content,social media addiction, body negativity, cyberbullying to mention but a few.
 Let us unpack them one by one.`,
      content: (
        <article className="space-y-6">
          <div className="space-y-2">
            <p>● Fear of missing out and comparison</p>
            <p>
              Exposure to content on social media inform of concerts, brunch, relationships, achievements can lead to anxiety from the fear of missing out on such a life and events. Often times, this leads to comparison due to feeling inadequate and feeling like one's life is incomplete and is missing something forgetting that sometimes this content does not show the behind the scenes and may sometimes be exaggerated or incomplete considering most people share the perfect and happy snippets of their lives.
            </p>
          </div>
          <div className="space-y-2">
            <p>● Social media addiction</p>
            <p>
              Many of us spend countless hours on social media platforms scrolling away like our life depends on it not realizing that this is an addiction slowly growing and eating away at us. Many of us might find ourselves with an obsession to check every notification and anxious when we are not online. This can breed anxiety, sleep disturbances,lack of focus and reduced productivity which may in turn contribute to a dysregulated nervous system.
            </p>
          </div>
          <div className="space-y-2">
            <p>● Body negativity</p>
            <p>
              This is mainly for the female population. It is not uncommon for the plus size women to be body shammed on social media platforms through negative comments and abusive words forgetting that we do not chose the bodies we are given. Also with tonnes of images of what an ideal body should look like for a women, this can cause depression, low self esteem and negative self talk.
            </p>
          </div>
          <div className="space-y-2">
            <p>● Cyberbullying</p>
            <p>
              Negative comments that aim to put people down when they post something can affect ones emotional health leading to depression and anxiety. This is all because most people in the comment section lack empathy, kindness but have alot of bitterness, anger, and negativity to give.
            </p>
          </div>
          <div className="space-y-2">
            <p>While this negative impact stands, we can use social media better to mitigate these negative effects through;</p>
            <ul className="list-disc pl-6">
              <li>● Showing kindness through our comments or saying nothing at all if you do not have anything positive or kind to say.</li>
              <li>● Curating your feed. Following accounts that uplift and inspire you and unfollowing any accounts that have triggering content.</li>
              <li>● Social media detoxes every once in a while. Taking time off social media every now and then to reset and to make time for yourself.</li>
              <li>● Setting time limits using in built app timers.</li>
            </ul>
            <p>Written by NAMUYANJA ANNAH VERONICA.</p>
          </div>
        </article>
      ),
      coverImageUrl: '/placeholder.png',
      icon: Brain,
      authorName: 'NAMUYANJA ANNAH VERONICA',
      authorAvatarUrl: '/placeholder.png',
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
          <p>
            When you feel overwhelmed, this simple reset helps you come back to center, steady your breath, and soften your inner voice.
          </p>
          <ol>
            <li>Begin with a short breathing exercise</li>
            <li>Use gentle reminders to pause during your day</li>
            <li>Reflect briefly on what felt supportive</li>
          </ol>
          <p>
            Tip: Pair your practice with something you already do (like making tea or locking your phone) so it sticks with ease.
          </p>
        </div>
      ),
      coverImageUrl: '/placeholder.png',
      icon: Brain,
    },
  ];

  // Poems
  const poemsPosts: Post[] = [
    {
      id: 'p1',
      title: 'Still in the Spotlight',
      date: '2025-08-12',
      summary: 'A tender, honest reflection on speaking up while navigating social anxiety.',
      content: (
        <article>
          <p className="text-sm text-gray-500">by Fatma Khamis Muhammad, volunteer at RYD</p>
          <div className="mt-4 space-y-3 leading-relaxed">
            <p>I wonder if they notice.<br />
            Oh, I&apos;m pretty sure they do — as I struggle to contain my quivers when it&apos;s suddenly my cue.</p>

            <p>My mind goes blank,<br />
            I freeze.</p>

            <p>A dozen tabs swing open, each one vying for space,<br />
            Each thought desperate to plead its case,<br />
            In the courtroom of my face.</p>

            <p>&quot;Am I slouching?&quot;<br />
            &quot;You&apos;re blabbering.&quot;<br />
            &quot;Your voice? Way too high pitched.&quot;<br />
            &quot;They don&apos;t get what you&apos;re saying so you might as well just ditch.&quot;</p>

            <p>And just when I feel the slip —<br />
            that ache of doubt, that sinking grip —<br />
            zoned out; I try zoning in.</p>

            <p>• I draw a trembling breath and narrow my scope within.<br />
            You&apos;re here.<br />
            Don&apos;t let your mind reel.<br />
            You&apos;ve got this.<br />
            Just brace yourself and be still!</p>

            <p className="text-sm italic text-gray-500">(For anyone who has/ is struggling with social axiety)</p>
          </div>
        </article>
      ),
    },
  ];

  const normalizedQuery = query.trim().toLowerCase();
  const matchesQuery = (post: Post) => {
    if (!normalizedQuery) return true;
    return (
      post.title.toLowerCase().includes(normalizedQuery) ||
      post.summary.toLowerCase().includes(normalizedQuery)
    );
  };

  const filteredUpdates = useMemo(() => updatesPosts.filter(matchesQuery), [normalizedQuery]);
  const filteredComm = useMemo(() => commPosts.filter(matchesQuery), [normalizedQuery]);
  const filteredArticles = useMemo(() => articlesPosts.filter(matchesQuery), [normalizedQuery]);
  const filteredPoems = useMemo(() => poemsPosts.filter(matchesQuery), [normalizedQuery]);

  return (
    <>
      <Navbar />
      <main>
        <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-white border-b">
          <div className="container py-10 sm:py-12">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Blog</h1>
            <p className="mt-4 max-w-2xl text-lg text-gray-600">
              Stories, updates, and resources from our community. Explore announcements, progress updates, and long-form articles — all in one place.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <Input
                  placeholder="Search posts by keyword..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search posts"
                />
              </div>
              <div>
                <Select value={category} onValueChange={(v) => setCategory(v as any)}>
                  <SelectTrigger aria-label="Filter by category">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    <SelectItem value="updates">Updates</SelectItem>
                    <SelectItem value="communications">Communications & Announcements</SelectItem>
                    <SelectItem value="articles">Articles</SelectItem>
                    <SelectItem value="poems">Poems</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {category === 'all' || category === 'updates' ? (
          <Section
            sectionKey="updates"
            title="Updates"
            description="The latest changes and improvements across our platform and programs."
            posts={filteredUpdates}
            openSet={openPostIds}
            toggle={toggle}
          />
        ) : null}

        {category === 'all' || category === 'communications' ? (
          <Section
            sectionKey="communications"
            title="Communications & Announcements"
            description="Timely messages for our community, including schedules and event highlights."
            posts={filteredComm}
            openSet={openPostIds}
            toggle={toggle}
          />
        ) : null}

        {category === 'all' || category === 'articles' ? (
          <Section
            sectionKey="articles"
            title="Articles"
            description="Thought pieces, guides, and educational content written by our team and partners."
            posts={filteredArticles}
            openSet={openPostIds}
            toggle={toggle}
          />
        ) : null}

        {category === 'all' || category === 'poems' ? (
          <Section
            sectionKey="poems"
            title="Poems"
            description="Original poetry and creative writing from our community."
            posts={filteredPoems}
            openSet={openPostIds}
            toggle={toggle}
          />
        ) : null}
      </main>
      <Footer />
    </>
  );
}