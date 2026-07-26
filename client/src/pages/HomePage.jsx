import { useState, useEffect, useRef, useCallback, memo } from 'react';

const FALLBACK_PRODUCTS = [
  {
    _id: 'fallback-1',
    slug: 'starter-stationery-pack',
    name: 'Starter Stationery Pack',
    category: 'School Packs',
    brand: 'Khursheed',
    price: 2499,
    discountPrice: 1999,
    ratings: 4.8,
    image: '/roots.png'
  },
  {
    _id: 'fallback-2',
    slug: 'premium-notebook-set',
    name: 'Premium Notebook Set',
    category: 'Notebooks',
    brand: 'Khursheed',
    price: 850,
    discountPrice: 750,
    ratings: 4.6,
    image: '/roots.png'
  },
  {
    _id: 'fallback-3',
    slug: 'geometry-kit',
    name: 'Geometry Kit',
    category: 'Geometry',
    brand: 'Khursheed',
    price: 1200,
    discountPrice: 999,
    ratings: 4.7,
    image: '/roots.png'
  }
];
import { Link } from 'react-router-dom';
import {
  ArrowRight, BookOpen, PenLine, Palette, Briefcase, Calculator, Ruler,
  FileText, Gift, Backpack, BookMarked, Truck, ShieldCheck, RefreshCcw,
  BadgeCheck, MessageSquare, Ghost, AlertCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import LazyImage from '../components/LazyImage.jsx';
import api from '../services/api.js';

// ─── Static data ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: 'Books',        icon: BookOpen   },
  { name: 'Notebooks',   icon: BookMarked  },
  { name: 'Pens',        icon: PenLine     },
  { name: 'Art Supplies',icon: Palette     },
  { name: 'Office',      icon: Briefcase   },
  { name: 'Bags',        icon: Backpack    },
  { name: 'Calculators', icon: Calculator  },
  { name: 'Geometry',    icon: Ruler       },
  { name: 'Paper',       icon: FileText    },
  { name: 'Gifts',       icon: Gift        },
];

const SCHOOLS = [
  { name: 'Beaconhouse',    slug: 'beaconhouse',  desc: 'Official BSS vendor since 2014'        },
  { name: 'Roots',          slug: 'roots',         desc: 'Complete Roots Millennium supplies'    },
  { name: 'The City School',slug: 'tcs',           desc: 'TCS approved packs & stationery'      },
  { name: 'Silver Oaks',    slug: 'silver-oaks',   desc: 'Premium Silver Oaks collection'       },
];

const FEATURES = [
  { title: 'Genuine stock',         description: 'Sourced directly from authorised distributors — no grey-market surprises.'  },
  { title: 'Same-day dispatch',     description: 'Orders placed before 2 pm leave our Lahore warehouse the same day.'        },
  { title: 'Straightforward returns', description: 'Wrong or damaged item? WhatsApp us a photo and we sort it within 24 hrs.' },
  { title: 'One-stop shelves',      description: 'O-Level past papers to brush pens — the whole list in a single cart.'      },
];

const TESTIMONIALS = [
  {
    name: 'Amina Shahid',
    role: 'Architecture student, NCA',
    initial: 'A',
    review: 'They had my entire semester supply list ready in two days. The journals are exactly what I wanted — thick paper, no bleed-through.',
  },
  {
    name: 'Bilal Hassan',
    role: 'School admin, DHA Lahore',
    initial: 'B',
    review: 'We order bulk stationery every term. Pricing is fair, invoices are proper, and delivery is never late.',
  },
  {
    name: 'Sara Khokhar',
    role: 'Calligraphy hobbyist',
    initial: 'S',
    review: 'Finally a local shop that keeps nibs and ink in stock year-round. Packaging was careful — not a bent box in the lot.',
  },
];

const TRUST_ITEMS = [
  { icon: Truck,       label: 'Free Delivery',    sub: 'On orders over Rs. 1,500' },
  { icon: ShieldCheck, label: 'Cash on Delivery', sub: 'Pay when you receive'     },
  { icon: RefreshCcw,  label: '7-Day Returns',    sub: 'Easy exchange policy'     },
  { icon: BadgeCheck,  label: 'Genuine Products', sub: '100% authentic brands'    },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Hero carousel slides ────────────────────────────────────────────────────
const HERO_SLIDES = [
  {
    src: '/roots.png',
    alt: 'A curated selection of premium stationery',
    tagline: 'Starting from',
    price: 'Rs. 85',
  },
  {
    src: '/hero-slide-2.jpg',
    alt: 'Back-to-school essentials for every student',
    tagline: 'Book packs from',
    price: 'Rs. 2,499',
  },
  {
    src: '/hero-slide-3.jpg',
    alt: 'Premium art supplies and craft materials',
    tagline: 'Art collection from',
    price: 'Rs. 350',
  },
  {
    src: '/hero-slide-4.jpg',
    alt: 'Office supplies for professionals',
    tagline: 'Office essentials from',
    price: 'Rs. 120',
  },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

const SkeletonCard = memo(() => (
  <div className="animate-pulse rounded-2xl bg-slate-100 h-72" aria-hidden="true" />
));
SkeletonCard.displayName = 'SkeletonCard';

const EmptyState = memo(({ label = 'Nothing here yet — check back soon' }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
    <Ghost size={44} className="mb-4 text-slate-200" aria-hidden="true" />
    <p className="text-sm text-slate-400 mb-3">{label}</p>
    <Link
      to="/shop"
      className="text-sm font-semibold text-[#D4A017] underline-offset-2 hover:underline"
    >
      Browse all products
    </Link>
  </div>
));
EmptyState.displayName = 'EmptyState';

const ErrorState = memo(({ message, onRetry }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-20 text-center gap-4">
    <AlertCircle size={36} className="text-red-400" aria-hidden="true" />
    <p className="text-sm text-slate-500">{message}</p>
    <button
      onClick={onRetry}
      className="rounded-full border border-[#D4A017] px-5 py-2 text-sm font-semibold text-[#D4A017] transition-colors duration-150 hover:bg-[#D4A017] hover:text-[#1A2744]"
    >
      Try again
    </button>
  </div>
));
ErrorState.displayName = 'ErrorState';

const NewsletterForm = memo(() => {
  const [email, setEmail]               = useState('');
  const [error, setError]               = useState('');
  const [status, setStatus]             = useState('idle');
  const inputRef                        = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!EMAIL_RE.test(email)) {
      setError('Enter a valid email address.');
      inputRef.current?.focus();
      return;
    }
    setStatus('submitting');
    await new Promise((r) => setTimeout(r, 900));
    setStatus('success');
    setEmail('');
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
          <BadgeCheck size={24} />
        </div>
        <p className="font-semibold text-[#1A2744]">You're in.</p>
        <p className="text-sm text-slate-500">We'll send restock alerts — no spam, ever.</p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-1 text-xs text-slate-400 underline underline-offset-2 hover:text-slate-600"
        >
          Use a different address
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="mb-3">
        <label htmlFor="newsletter-email" className="sr-only">Email address</label>
        <input
          ref={inputRef}
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
          placeholder="you@email.com"
          autoComplete="email"
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? 'newsletter-error' : undefined}
          className={`w-full rounded-2xl border bg-[#FAF8F3] px-5 py-3 text-sm outline-none transition-colors duration-150 focus:ring-2 focus:ring-[#D4A017] ${
            error ? 'border-red-400' : 'border-slate-200'
          }`}
        />
        {error && (
          <p id="newsletter-error" role="alert" className="mt-1.5 text-xs text-red-500">
            {error}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#D4A017] px-6 py-3 text-sm font-bold text-[#1A2744] transition-colors duration-150 hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === 'submitting' ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#1A2744] border-t-transparent" />
            Subscribing…
          </>
        ) : (
          'Subscribe'
        )}
      </button>
    </form>
  );
});
NewsletterForm.displayName = 'NewsletterForm';

// ─── Hero Carousel Component ─────────────────────────────────────────────────
const HeroCarousel = memo(() => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);
  const containerRef = useRef(null);

  const goTo = useCallback((index) => {
    setCurrent(index);
  }, []);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  // Auto-play
  useEffect(() => {
    if (isPaused) return;
    timerRef.current = window.setInterval(next, 7000);
    return () => window.clearInterval(timerRef.current);
  }, [isPaused, next]);

  // Pause when carousel is offscreen to reduce CPU
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e.isIntersecting) setIsPaused(true);
        else setIsPaused(false);
      },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [next, prev]);

  const slide = HERO_SLIDES[current];

  return (
    <div
      className="relative z-10 w-full max-w-lg shrink-0 md:ml-auto"
      ref={containerRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Promotional banners"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-800">
        {/* Slides */}
        <div
          className="flex h-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${current * 100}%)`, willChange: 'transform' }}
        >
          {HERO_SLIDES.map((s, i) => (
            <div key={i} className="min-w-full h-full relative">
              <LazyImage
                src={s.src}
                alt={s.alt}
                className="h-full w-full object-cover"
                width="900"
                height="675"
                priority={i === 0}
              />
              {/* Price bubble per slide */}
              <div className="absolute bottom-4 left-4 rounded-xl bg-white px-4 py-3 shadow-lg">
                <p className="text-[10px] text-slate-500">{s.tagline}</p>
                <p className="text-lg font-bold text-[#1A2744]">{s.price}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Arrow buttons */}
        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#1A2744] shadow-md backdrop-blur-sm transition hover:bg-white hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
          aria-label="Previous slide"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#1A2744] shadow-md backdrop-blur-sm transition hover:bg-white hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
          aria-label="Next slide"
        >
          <ChevronRight size={18} />
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-4 right-4 flex gap-1.5">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-6 bg-[#D4A017]'
                  : 'w-2 bg-white/60 hover:bg-white'
              }`}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === current ? 'true' : 'false'}
            />
          ))}
        </div>
      </div>
    </div>
  );
});
HeroCarousel.displayName = 'HeroCarousel';

const ShopBySchoolSection = memo(() => (
  <section aria-label="Shop by School" className="mx-auto max-w-7xl px-4 py-16 md:px-6">
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div>
        <span className="inline-block rounded-full bg-[#D4A017]/10 px-3 py-1 text-xs font-semibold text-[#D4A017]">
          Official Vendor
        </span>
        <h2 className="mt-2 text-3xl font-semibold text-[#1A2744]">Shop by School</h2>
        <p className="mt-1 text-sm text-slate-500">
          Authorised supplier for leading schools across Pakistan.
        </p>
      </div>
      <Link
        to="/school-packs"
        className="group flex items-center gap-1 text-sm font-semibold text-[#D4A017] transition-colors duration-150 hover:opacity-80"
      >
        All school packs
        <span className="transition-transform duration-150 group-hover:translate-x-1" aria-hidden="true">
          <ArrowRight size={14} />
        </span>
      </Link>
    </div>
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {SCHOOLS.map((school) => (
        <Link
          key={school.slug}
          to={`/school-packs?school=${school.slug}`}
          className="group flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-8 text-center transition-colors duration-150 hover:border-[#D4A017] hover:shadow-lg focus-visible:ring-2 focus-visible:ring-[#D4A017] focus-visible:ring-offset-2"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-slate-100 bg-[#FAF8F3] shadow-sm transition-transform duration-150 group-hover:scale-105">
            <LazyImage
              src={`/logos/${school.slug}.png`}
              alt={school.name}
              width="80"
              height="80"
              className="h-full w-full rounded-full object-contain p-3"
              placeholderSrc="/roots.png"
            />
          </div>
          <h3 className="mt-4 font-semibold text-[#1A2744]">{school.name}</h3>
          <p className="mt-1 text-xs text-slate-500">{school.desc}</p>
        </Link>
      ))}
    </div>
  </section>
));
ShopBySchoolSection.displayName = 'ShopBySchoolSection';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState(FALLBACK_PRODUCTS);
  const [newArrivals,      setNewArrivals]      = useState(FALLBACK_PRODUCTS);
  const [loadingFeatured,  setLoadingFeatured]  = useState(false);
  const [loadingArrivals,  setLoadingArrivals]  = useState(false);
  const [fetchError,       setFetchError]       = useState(null);

  const fetchProducts = useCallback(async (signal) => {
    setLoadingFeatured(true);
    setLoadingArrivals(true);
    setFetchError(null);

    try {
      const { data } = await api.get('/products', {
        params: { limit: 8, sort: 'best_rated' },
        signal,
      });

      if (data?.success) {
        const items = Array.isArray(data.data) ? data.data : [];
        setFeaturedProducts(items.slice(0, 4));
        setNewArrivals(items.slice(0, 6));
      }
    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        setFeaturedProducts(FALLBACK_PRODUCTS);
        setNewArrivals(FALLBACK_PRODUCTS);
        setFetchError('Could not load products. Showing a quick preview instead.');
        console.error('HomePage fetch error:', err);
      }
    } finally {
      setLoadingFeatured(false);
      setLoadingArrivals(false);
    }
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => {
      fetchProducts(ctrl.signal);
    }, 150);

    return () => {
      window.clearTimeout(timer);
      ctrl.abort();
    };
  }, [fetchProducts]);

  const handleRetry = useCallback(() => {
    const ctrl = new AbortController();
    fetchProducts(ctrl.signal);
  }, [fetchProducts]);

  const renderGrid = useCallback(
    ({ loading, error, products, cols }) => {
      const gridClass = `grid gap-5 sm:grid-cols-2 ${
        cols === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
      }`;
      const skeletonCount = cols === 4 ? 4 : 6;

      if (error) return <div className={gridClass}><ErrorState message={fetchError} onRetry={handleRetry} /></div>;
      if (loading) return <div className={gridClass}>{[...Array(skeletonCount)].map((_, i) => <SkeletonCard key={i} />)}</div>;
      if (!products.length) return <div className={gridClass}><EmptyState /></div>;

      return (
        <div className={gridClass}>
          {products.map((p) => <ProductCard key={p._id || p.id} product={p} />)}
        </div>
      );
    },
    [fetchError, handleRetry]
  );

  return (
    <main>
      {/* ── Skip link ──────────────────────────────────────────────────────── */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-[#D4A017] focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-[#1A2744]"
      >
        Skip to content
      </a>

      {/* ── Trust bar ──────────────────────────────────────────────────────── */}
      <div className="bg-[#1A2744] py-3">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-4 list-none">
            {TRUST_ITEMS.map(({ icon: Icon, label, sub }) => (
              <li key={label} className="flex items-center gap-3 text-white">
                <Icon size={22} className="shrink-0 text-[#D4A017]" aria-hidden="true" />
                <div>
                  <p className="text-xs font-bold">{label}</p>
                  <p className="text-[10px] text-slate-300">{sub}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section
        id="main-content"
        aria-label="Hero"
        className="relative overflow-hidden bg-[#1A2744]"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #D4A017 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
          aria-hidden="true"
        />

        <div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-4 py-16 md:flex-row md:items-center md:gap-16 md:px-6 md:py-24">
          {/* Copy — unchanged */}
          <div className="relative z-10 max-w-xl space-y-6">
            <span className="inline-block rounded-full bg-[#D4A017]/20 px-4 py-1.5 text-sm font-semibold text-[#D4A017]">
              Premium School Supplies & Stationery
            </span>
            <h1 className="text-[2.75rem] font-semibold leading-[1.08] text-white md:text-[3.75rem]">
              Paper, pens &amp; everything between the lines
            </h1>
            <p className="text-base leading-relaxed text-white/70 md:text-lg">
              Textbooks, notebooks, art materials, and office essentials — picked for
              students, teachers, and anyone who still enjoys a good pen.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-[#D4A017] px-6 py-3 text-sm font-bold text-[#1A2744] shadow-lg shadow-[#D4A017]/25 transition-colors duration-150 hover:opacity-90 active:scale-[0.98]"
              >
                Shop Now <ArrowRight size={15} aria-hidden="true" />
              </Link>
              <Link
                to="/shop?bookpacks=true"
                className="rounded-full border border-white/30 px-6 py-3 text-sm font-bold text-white transition-colors duration-150 hover:border-[#D4A017] hover:text-[#D4A017] active:scale-[0.98]"
              >
                School book packs
              </Link>
            </div>

            <div className="flex gap-0 border-t border-white/10 pt-6 text-sm">
              {[
                { label: 'Products', value: '2,400+' },
                { label: 'Brands',   value: '85+'    },
                { label: 'Since',    value: '1998'   },
              ].map(({ label, value }, i) => (
                <div
                  key={label}
                  className={`flex-1 ${i < 2 ? 'border-r border-white/10 pr-6 mr-6' : ''}`}
                >
                  <p className="text-white/45 text-xs">{label}</p>
                  <p className="text-2xl font-semibold text-[#D4A017]">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Image — now a carousel */}
          <HeroCarousel />
        </div>
      </section>

      <ShopBySchoolSection />

      {/* ── Categories ─────────────────────────────────────────────────────── */}
      <section
        aria-label="Product categories"
        className="border-y border-slate-100 bg-[#FAF8F3] py-16 md:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-10 max-w-lg">
            <span className="inline-block rounded-full bg-[#D4A017]/10 px-3 py-1 text-xs font-semibold text-[#D4A017]">
              Departments
            </span>
            <h2 className="mt-2 text-3xl font-semibold text-[#1A2744] md:text-4xl">
              Find what you need
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Organised the way you'd walk our aisles — not buried under generic filters.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {CATEGORIES.map(({ name, icon: Icon }) => (
              <Link
                key={name}
                to={`/shop?category=${encodeURIComponent(name)}`}
                className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-colors duration-150 hover:border-[#D4A017] hover:shadow-md active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#D4A017] focus-visible:ring-offset-2"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FAF8F3] text-[#1A2744] transition-colors duration-150 group-hover:bg-[#D4A017]/10">
                  <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                </div>
                <p className="text-sm font-semibold text-[#1A2744]">{name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── New Arrivals ───────────────────────────────────────────────────── */}
      <section aria-label="New arrivals" className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="inline-block rounded-full bg-[#D4A017]/10 px-3 py-1 text-xs font-semibold text-[#D4A017]">
                Just In
              </span>
              <h2 className="mt-2 text-3xl font-semibold text-[#1A2744]">New Arrivals</h2>
            </div>
            <Link
              to="/shop"
              className="group flex items-center gap-1 text-sm font-semibold text-[#D4A017] transition-colors duration-150 hover:opacity-80"
            >
              View all
              <span className="transition-transform duration-150 group-hover:translate-x-1" aria-hidden="true">
                <ArrowRight size={14} />
              </span>
            </Link>
          </div>
          {renderGrid({
            loading: loadingArrivals,
            error: fetchError,
            products: newArrivals,
            cols: 3,
          })}
        </div>
      </section>

      {/* ── Staff Picks ────────────────────────────────────────────────────── */}
      <section aria-label="Staff picks" className="border-y border-slate-100 bg-[#FAF8F3] py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="inline-block rounded-full bg-[#D4A017]/10 px-3 py-1 text-xs font-semibold text-[#D4A017]">
                This week
              </span>
              <h2 className="mt-2 text-3xl font-semibold text-[#1A2744]">Staff Picks</h2>
            </div>
            <Link
              to="/shop"
              className="group flex items-center gap-1 text-sm font-semibold text-[#D4A017] transition-colors duration-150 hover:opacity-80"
            >
              See full catalogue
              <span className="transition-transform duration-150 group-hover:translate-x-1" aria-hidden="true">
                <ArrowRight size={14} />
              </span>
            </Link>
          </div>
          {renderGrid({
            loading: loadingFeatured,
            error: fetchError,
            products: featuredProducts,
            cols: 4,
          })}
        </div>
      </section>

      {/* ── Delivery banner ────────────────────────────────────────────────── */}
      <section aria-label="Delivery offer" className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="flex flex-col gap-6 rounded-2xl bg-[#1A2744] px-8 py-10 md:flex-row md:items-center md:justify-between md:px-12">
          <div>
            <p className="text-sm font-medium text-[#D4A017]">Delivery across Pakistan</p>
            <h3 className="mt-1 text-2xl font-semibold text-white">
              Free delivery on orders above Rs.&nbsp;1,500
            </h3>
            <p className="mt-2 text-sm text-white/60">Cash on delivery available in major cities.</p>
          </div>
          <Link
            to="/shop"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#D4A017] px-6 py-3 text-sm font-bold text-[#1A2744] transition-colors duration-150 hover:opacity-90 active:scale-[0.98]"
          >
            Start an order <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* ── Why us ─────────────────────────────────────────────────────────── */}
      <section aria-label="Why choose us" className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-12 max-w-md">
            <span className="inline-block rounded-full bg-[#D4A017]/10 px-3 py-1 text-xs font-semibold text-[#D4A017]">
              Why people come back
            </span>
            <h2 className="mt-2 text-3xl font-semibold text-[#1A2744] md:text-4xl">
              Built on shelves, not slides
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ title, description }) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200 bg-[#FAF8F3] p-6 transition-colors duration-150 hover:border-[#D4A017]/40"
              >
                <div className="mb-4 h-0.5 w-8 rounded-full bg-[#D4A017]" aria-hidden="true" />
                <h3 className="font-semibold text-[#1A2744]">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials + Newsletter ──────────────────────────────────────── */}
      <section
        aria-label="Customer reviews and newsletter"
        className="border-t border-slate-100 bg-[#FAF8F3] py-16 md:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-5">

            {/* Testimonials */}
            <div className="lg:col-span-3">
              <span className="inline-block rounded-full bg-[#D4A017]/10 px-3 py-1 text-xs font-semibold text-[#D4A017]">
                From customers
              </span>
              <h2 className="mt-2 text-3xl font-semibold text-[#1A2744]">
                Word on the street
              </h2>
              <ul className="mt-8 space-y-4 list-none" aria-label="Customer reviews">
                {TESTIMONIALS.map(({ name, role, initial, review }) => (
                  <li
                    key={name}
                    className="relative rounded-2xl border border-slate-200 bg-white p-6"
                  >
                    <MessageSquare
                      size={22}
                      className="absolute right-5 top-5 text-[#D4A017]/20"
                      aria-hidden="true"
                    />
                    <p className="text-sm leading-relaxed text-slate-600">{review}</p>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1A2744] text-xs font-bold text-[#D4A017]">
                        {initial}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#1A2744]">{name}</p>
                        <p className="text-xs text-slate-400">{role}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div className="flex flex-col justify-center rounded-2xl border border-slate-200 bg-white p-8 lg:col-span-2">
              <h3 className="text-2xl font-semibold text-[#1A2744]">Restock alerts</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                New arrivals and back-in-stock notices — roughly twice a month, no spam.
              </p>
              <div className="mt-6">
                <NewsletterForm />
              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;