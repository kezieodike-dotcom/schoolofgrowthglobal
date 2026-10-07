import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BLOG_POSTS } from '../data/mockData';
import { PageHero } from '../components/PageHero';
import { useContentCollection } from '../lib/useContent';
import { SocialShare } from '../components/SocialShare';
import type { BlogPost } from '../types';
import { Newspaper, Clock, ArrowLeft, ArrowRight, Tag } from 'lucide-react';

const CATEGORIES = ['All', 'Leadership', 'Strategy', 'Finance', 'Technology', 'Wealth Creation', 'Personal Growth', 'Business Spotlight'];

// ── Article reader ────────────────────────────────────────────────────────
const Article: React.FC<{ slug: string; posts: BlogPost[] }> = ({ slug, posts }) => {
  const post = posts.find((p) => p.slug === slug);
  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 text-center px-4">
        <h1 className="text-2xl font-serif font-bold text-slate-900">Article not found</h1>
        <Link to="/blog" className="text-amber-600 hover:text-amber-700 text-sm flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Knowledge Centre
        </Link>
      </div>
    );
  }

  const related = posts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <Link to="/blog" className="motion-pressable inline-flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-amber-600 mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Knowledge Centre
        </Link>

        <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-amber-50 text-amber-600 border border-amber-300">
          {post.category}
        </span>
        {post.sponsored && (
          <span className="ml-2 text-[10px] font-mono px-2.5 py-1 rounded bg-slate-900 text-amber-300">
            FEATURED BUSINESS
          </span>
        )}
        <h1 className="mt-4 text-3xl sm:text-4xl font-serif font-bold text-slate-900 leading-tight">{post.title}</h1>

        <div className="flex items-center gap-3 mt-5 text-xs text-slate-500 font-mono">
          <span className="text-slate-700">{post.author}</span>
          <span>•</span>
          <span>{post.date}</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {post.readTime}</span>
        </div>
        <SocialShare title={post.title} className="mt-5" />

        <div className={`mt-8 grid gap-3 ${post.gallery && post.gallery.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {(post.gallery ?? [post.image]).map((image, index) => (
            <img
              key={image}
              src={image}
              alt={`${post.title} product ${index + 1}`}
              className={`w-full object-cover rounded-2xl border border-slate-200 ${index === 0 && post.gallery && post.gallery.length > 2 ? 'col-span-2 h-80' : 'h-56'}`}
            />
          ))}
        </div>

        <div className="prose mt-8 space-y-5 text-slate-600 text-sm leading-relaxed">
          <p className="text-base text-slate-700">{post.excerpt}</p>
          {post.sponsored ? (
            <p>
              Explore the Mimi Collections product range through the business's TikTok profile using the link below.
            </p>
          ) : (
            <>
              <p>
                At School of Growth Global, our faculty translate decades of frontline executive experience into practical
                frameworks you can apply immediately. This briefing distills the core principles our leaders use when the
                stakes are highest.
              </p>
              <p>
                The most effective leaders treat this not as a one-off decision but as a repeatable system - one that
                compounds clarity, protects the downside, and keeps the organization aligned as conditions change. Below,
                we outline the mental models, sequencing, and guardrails that separate durable outcomes from reactive ones.
              </p>
              <blockquote className="border-l-2 border-amber-500 pl-4 italic text-slate-600">
                "Strategy is not a document. It is the discipline of choosing what not to do, then executing the rest with
                conviction." - {post.author}
              </blockquote>
              <p>
                Members of the institution can explore the full framework, worksheets, and a guided Growth AI walkthrough
                inside the Student Portal.
              </p>
            </>
          )}
        </div>

        {post.externalUrl && (
          <div className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-amber-700">Featured business</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">Discover more from {post.author}</p>
            </div>
            <a
              href={post.externalUrl}
              target="_blank"
              rel="noreferrer"
              className="motion-pressable inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-xs font-bold text-white hover:bg-slate-800"
            >
              Visit Mimi Collections <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        <div className="scroll-card mt-10 p-6 rounded-2xl bg-white shadow-sm border border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-600">Want the applied version, with tools and mentorship?</p>
          <Link to="/courses" className="motion-pressable px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs whitespace-nowrap">
            Explore Programs
          </Link>
        </div>

        {/* Related */}
        <h3 className="mt-14 mb-6 text-xl font-serif font-bold text-slate-900">Related Insights</h3>
        <div className="scroll-card-grid grid grid-cols-1 sm:grid-cols-3 gap-5">
          {related.map((r) => (
            <Link key={r.id} to={`/blog/${r.slug}`} className="scroll-card motion-pressable group">
              <img src={r.image} alt={r.title} className="scroll-card-image w-full h-28 object-cover rounded-xl border border-slate-200 opacity-80" />
              <span className="mt-2 block text-[10px] font-mono text-amber-600">{r.category}</span>
              <h4 className="text-sm font-serif font-bold text-slate-900 group-hover:text-amber-700 transition-colors leading-snug">
                {r.title}
              </h4>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Blog listing ──────────────────────────────────────────────────────────
export const BlogView: React.FC = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState('All');
  const insightContent = useContentCollection('insight', BLOG_POSTS);

  if (slug) return <Article slug={slug} posts={insightContent.items} />;

  const posts = insightContent.items.filter((p) => category === 'All' || p.category === category);
  const featured = insightContent.items.find((p) => p.featured) ?? insightContent.items[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <PageHero
        eyebrow="Knowledge Centre"
        icon={<Newspaper className="w-4 h-4" />}
        title={<>Insights on Leadership, Growth & Strategy</>}
        subtitle="Practical briefings and frameworks from our global faculty across leadership, business, finance, technology, and personal growth."
        imageSrc="/scenes/leadership-meeting.jpg"
      />

      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Featured post */}
        <Link
          to={`/blog/${featured.slug}`}
          className="scroll-card motion-pressable group grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-14 p-6 rounded-3xl bg-white shadow-sm border border-slate-200 hover:border-amber-400 transition-all"
        >
          <img src={featured.image} alt={featured.title} className="scroll-card-image w-full h-64 object-cover rounded-2xl border border-slate-200 opacity-90" />
          <div className="space-y-3">
            <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-bold">FEATURED</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
              {featured.title}
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">{featured.excerpt}</p>
            <div className="flex items-center gap-3 text-xs text-slate-500 font-mono pt-2">
              <span className="text-slate-700">{featured.author}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {featured.readTime}</span>
            </div>
          </div>
        </Link>

        {/* Category filter */}
        <div className="flex flex-wrap items-center gap-2 mb-10">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`motion-pressable px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                category === c
                  ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                  : 'text-slate-500 border-slate-200 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="scroll-card-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="scroll-card reference-card motion-pressable group flex flex-col overflow-hidden transition-all"
            >
              <div className="reference-card-media">
                <img src={post.image} alt={post.title} className="scroll-card-image h-full w-full object-cover opacity-90 transition-transform duration-500" />
              </div>
              <div className="reference-card-body flex flex-1 flex-col">
                <span className="reference-card-pill mb-3">
                  <Tag className="mr-1 h-3 w-3" /> {post.category}
                </span>
                <h4 className="reference-card-title mb-2 transition-colors group-hover:text-blue-700">
                  {post.title}
                </h4>
                <p className="reference-card-copy mb-5 line-clamp-3 flex-1">{post.excerpt}</p>
                <div className="reference-card-meta flex items-center justify-between border-t border-slate-100 pt-4 font-mono">
                  <span>{post.date}</span>
                  <span className="flex items-center gap-1 font-bold text-blue-600">
                    Read <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
