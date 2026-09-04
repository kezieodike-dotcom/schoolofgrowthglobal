import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookMarked,
  CheckCircle2,
  Download,
  FileText,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { BOOKS } from '../data/mockData';
import { PageHero } from '../components/PageHero';
import { calculateBookRevenueSplit } from '../lib/bookRevenue';
import { formatNaira } from '../lib/pricing';
import { useContentCollection } from '../lib/useContent';
import type { BookItem } from '../types';

const ALL = 'All';

export const BooksView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(ALL);
  const content = useContentCollection('book', BOOKS);

  const categories = useMemo(
    () => [ALL, ...Array.from(new Set(content.items.map((book) => book.category))).sort()],
    [content.items]
  );

  const books = useMemo(() => {
    const term = query.trim().toLowerCase();
    return content.items.filter((book) => {
      const matchesCategory = category === ALL || book.category === category;
      const matchesQuery =
        !term ||
        [book.title, book.subtitle, book.authorName, book.category]
          .join(' ')
          .toLowerCase()
          .includes(term);
      return matchesCategory && matchesQuery;
    });
  }, [category, content.items, query]);

  const featured = books.find((book) => book.featured) ?? books[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <PageHero
        eyebrow="Books & Digital Materials"
        icon={<BookMarked className="w-4 h-4" />}
        title={
          <>
            Buy practical books from{' '}
            <span className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 bg-clip-text text-transparent">
              mentors and faculty
            </span>
          </>
        }
        subtitle="A marketplace for guides, workbooks and digital materials published by School of Growth Global and approved mentors."
        imageSrc="/scenes/hero-team.jpg"
      />

      {featured && (
        <section className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-[260px_1fr_260px] gap-6 items-center">
            <img
              src={featured.coverImage || '/scenes/hero-team.jpg'}
              alt={featured.title}
              className="h-64 w-full object-cover rounded-lg border border-slate-200"
            />
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-amber-700">
                Featured material
              </p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-serif font-bold text-slate-950">
                {featured.title}
              </h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-2xl">
                {featured.subtitle || featured.description}
              </p>
              <p className="mt-4 text-xs text-slate-500">
                By <strong className="text-slate-800">{featured.authorName}</strong>
              </p>
            </div>
            <BookPurchasePanel book={featured} compact />
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-7">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-amber-700">
              {books.length} published books
            </p>
            <h2 className="mt-1 text-2xl font-serif font-bold">Marketplace catalogue</h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <label className="relative block">
              <span className="sr-only">Search books</span>
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search books"
                className="w-full sm:w-64 rounded-lg bg-white border border-slate-200 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-amber-500"
              />
            </label>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="rounded-lg bg-white border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>

        {!content.loading && books.length === 0 && (
          <div className="rounded-lg bg-white border border-slate-200 p-8 text-center">
            <BookMarked className="w-8 h-8 mx-auto text-slate-300" />
            <h3 className="mt-3 text-lg font-serif font-bold">No books match this search</h3>
            <p className="mt-1 text-sm text-slate-500">Try another category or keyword.</p>
          </div>
        )}
      </section>
    </div>
  );
};

const BookCard: React.FC<{ book: BookItem }> = ({ book }) => (
  <article className="group bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm flex flex-col">
    <img
      src={book.coverImage || '/scenes/hero-team.jpg'}
      alt={book.title}
      className="h-56 w-full object-cover"
    />
    <div className="p-5 flex-1 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-amber-700">
            {book.category}
          </p>
          <h3 className="mt-1 text-xl font-serif font-bold text-slate-950">{book.title}</h3>
        </div>
        <span className="shrink-0 rounded-full bg-slate-50 border border-slate-200 px-2 py-1 text-[10px] font-bold text-slate-600">
          {book.format}
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-600 leading-relaxed">{book.subtitle || book.description}</p>
      <p className="mt-3 text-xs text-slate-500">
        By <strong className="text-slate-800">{book.authorName}</strong>
      </p>
      <ul className="mt-4 space-y-2 text-xs text-slate-600">
        {book.highlights.slice(0, 3).map((highlight) => (
          <li key={highlight} className="flex gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-px" />
            {highlight}
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-5">
        <BookPurchasePanel book={book} />
      </div>
    </div>
  </article>
);

const BookPurchasePanel: React.FC<{ book: BookItem; compact?: boolean }> = ({ book, compact }) => {
  const split = calculateBookRevenueSplit(book.priceKobo);

  return (
    <div className={compact ? 'rounded-lg bg-slate-950 text-white p-5' : 'space-y-3'}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className={`text-[10px] font-mono uppercase tracking-wider ${compact ? 'text-slate-400' : 'text-slate-500'}`}>
            Price
          </p>
          <p className={`text-2xl font-serif font-bold ${compact ? 'text-amber-300' : 'text-slate-950'}`}>
            {formatNaira(book.priceKobo)}
          </p>
        </div>
        {book.pages > 0 && (
          <p className={`text-xs ${compact ? 'text-slate-400' : 'text-slate-500'}`}>
            {book.pages} pages
          </p>
        )}
      </div>

      <p className={`text-[11px] leading-relaxed ${compact ? 'text-slate-300' : 'text-slate-500'}`}>
        Revenue split: School of Growth keeps {formatNaira(split.companyShareKobo)}.{' '}
        {book.ownerName} receives {formatNaira(split.ownerShareKobo)}.
      </p>

      <div className="grid grid-cols-1 gap-2">
        <Link
          to={`/checkout/book/${book.id}`}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-400 transition-colors"
        >
          <Download className="w-4 h-4" />
          Buy book
        </Link>
        {book.sampleUrl && (
          <a
            href={book.sampleUrl}
            target="_blank"
            rel="noreferrer"
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-colors ${
              compact
                ? 'bg-white/10 text-white hover:bg-white/15'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Preview
          </a>
        )}
      </div>

      <p className={`flex items-center gap-1.5 text-[10px] ${compact ? 'text-slate-400' : 'text-slate-500'}`}>
        <ShieldCheck className="w-3.5 h-3.5" />
        Secure checkout by Paystack
      </p>
    </div>
  );
};
