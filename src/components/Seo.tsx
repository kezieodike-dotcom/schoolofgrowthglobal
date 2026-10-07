import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://schoolofgrowthglobal.vercel.app';

const PAGE_META: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'School of Growth Global | Leadership, Strategy & Transformation',
    description: 'School of Growth Global equips individuals, professionals, organizations and institutions to grow, lead, create value and produce measurable impact.',
  },
  '/about': { title: 'About School of Growth Global', description: 'Learn about School of Growth Global, our mission, values, faculty and commitment to transformational leadership.' },
  '/courses': { title: 'Courses & Programs | School of Growth Global', description: 'Explore practical courses and growth pathways for individuals, professionals, leaders, organizations and institutions.' },
  '/mentorship': { title: 'Mentorship & Consulting | School of Growth Global', description: 'Connect with vetted mentors and consultants for practical guidance, strategy and measurable growth.' },
  '/mentors': { title: 'Mentors & Consultants | School of Growth Global', description: 'Discover mentors and consultants who can support your personal, professional and organizational growth.' },
  '/enlist': { title: 'Enlist as a Mentor or Consultant | School of Growth Global', description: 'Apply to join the School of Growth Global mentor and consultant network.' },
  '/partnerships': { title: 'Sponsorship & Partnership | School of Growth Global', description: 'Partner with School of Growth Global and the Global Growth Conference to develop people, strengthen leadership capacity and create measurable impact.' },
  '/blog': { title: 'Research & Insights | School of Growth Global', description: 'Read practical research, leadership insights, business spotlights and growth frameworks from School of Growth Global.' },
  '/contact': { title: 'Contact School of Growth Global', description: 'Contact School of Growth Global about enrolment, mentorship, corporate training, partnerships and support.' },
  '/privacy': { title: 'Privacy Policy | School of Growth Global', description: 'Read how School of Growth Global collects, uses and protects personal information.' },
  '/thank-you': { title: 'Thank You | School of Growth Global', description: 'Your message has been received by School of Growth Global.' },
};

function getMeta(pathname: string) {
  const exact = PAGE_META[pathname];
  if (exact) return exact;
  if (pathname.startsWith('/blog/')) return { title: 'Insight | School of Growth Global', description: 'Practical insights and frameworks from School of Growth Global.' };
  if (pathname.startsWith('/courses/')) return { title: 'Course Details | School of Growth Global', description: 'Explore a School of Growth Global learning pathway.' };
  return { title: 'School of Growth Global', description: 'Leadership, strategy, transformation and practical growth for people and organizations.' };
}

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
  let node = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!node) {
    node = document.createElement('meta');
    node.setAttribute(attribute, key);
    document.head.appendChild(node);
  }
  node.content = content;
}

export function Seo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = getMeta(pathname);
    const canonical = `${SITE_URL}${pathname === '/' ? '/' : pathname}`;
    document.title = meta.title;
    setMeta('name', 'description', meta.description);
    setMeta('property', 'og:title', meta.title);
    setMeta('property', 'og:description', meta.description);
    setMeta('property', 'og:url', canonical);
    setMeta('name', 'twitter:title', meta.title);
    setMeta('name', 'twitter:description', meta.description);
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = canonical;
  }, [pathname]);

  return null;
}
