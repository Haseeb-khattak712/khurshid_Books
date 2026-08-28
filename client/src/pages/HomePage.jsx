import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BookOpen, PenLine, Palette, Briefcase, Calculator, Ruler,
  FileText, Gift, Backpack, BookMarked, Truck, ShieldCheck, RefreshCcw,
  BadgeCheck, MessageSquare, Ghost, AlertCircle, ChevronLeft, ChevronRight, Star
} from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import LazyImage from '../components/LazyImage.jsx';
import { supabase } from '../services/supabase.js';

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

// ─── Animation Variants ────────────────────────────────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

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
  <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="col-span-full flex flex-col items-center justify-center py-20 text-center">
    <Ghost size={44} className="mb-4 text-slate-200" aria-hidden="true" />
    <p className="text-sm text-slate-400 mb-3">{label}</p>
    <Link
      to="/shop"
      className="text-sm font-semibold text-[#D4A017] underline-offset-2 hover:underline"
    >
      Browse all products
    </Link>
  </motion.div>
));
EmptyState.displayName = 'EmptyState';

const ErrorState = memo(({ message, onRetry }) => (
  <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="col-span-full flex flex-col items-center justify-center py-20 text-center gap-4">
    <AlertCircle size={36} className="text-red-400" aria-hidden="true" />
    <p className="text-sm text-slate-500">{message}</p>
    <button
      onClick={onRetry}
      className="rounded-full border border-[#D4A017] px-5 py-2 text-sm font-semibold text-[#D4A017] transition-colors duration-150 hover:bg-[#D4A017] hover:text-[#1A2744]"
    >
      Try again
    </button>
  </motion.div>
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
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center gap-3 py-10 text-center">
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
      </motion.div>
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
        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} id="newsletter-error" role="alert" className="mt-1.5 text-xs text-red-500">
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={status === 'submitting'}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#D4A017] px-6 py-3 text-sm font-bold text-[#1A2744] shadow-md shadow-[#D4A017]/20 transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === 'submitting' ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#1A2744] border-t-transparent" />
            Subscribing…
          </>
        ) : (
          'Subscribe'
        )}
      </motion.button>
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
    timerRef.current = window.setInterval(next, 5000);
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

  return (
    <motion.div
      variants={scaleIn}
      className="relative z-10 w-full max-w-lg shrink-0 md:ml-auto"
      ref={containerRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Promotional banners"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-slate-800 shadow-2xl shadow-[#1A2744]/50 border border-white/10 ring-1 ring-white/20">
        {/* Slides */}
        <div
          className="flex h-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: `translateX(-${current * 100}%)`, willChange: 'transform' }}
        >
          {HERO_SLIDES.map((s, i) => (
            <div key={i} className="min-w-full h-full relative group">
              <LazyImage
                src={s.src}
                alt={s.alt}
                className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                width="900"
                height="675"
                priority={i === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
              
              {/* Animated Price bubble per slide with Glassmorphism */}
              <AnimatePresence>
                {i === current && (
                  <motion.div 
                    initial={{ y: 20, opacity: 0, backdropFilter: 'blur(0px)' }}
                    animate={{ y: 0, opacity: 1, backdropFilter: 'blur(12px)' }}
                    exit={{ y: 10, opacity: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="absolute bottom-6 left-6 rounded-2xl bg-white/20 border border-white/30 px-5 py-4 shadow-xl backdrop-blur-md"
                  >
                    <p className="text-[11px] font-medium text-white/80 tracking-wide uppercase">{s.tagline}</p>
                    <p className="text-2xl font-bold text-white drop-shadow-md">{s.price}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Arrow buttons */}
        <button
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md border border-white/20 transition-all hover:bg-white/40 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md border border-white/20 transition-all hover:bg-white/40 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
          aria-label="Next slide"
        >
          <ChevronRight size={20} />
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-6 right-6 flex gap-2 bg-black/20 backdrop-blur-md px-3 py-2 rounded-full border border-white/10">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-6 bg-[#D4A017] shadow-[0_0_8px_rgba(212,160,23,0.8)]'
                  : 'w-2 bg-white/60 hover:bg-white'
              }`}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === current ? 'true' : 'false'}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
});
HeroCarousel.displayName = 'HeroCarousel';

const ShopBySchoolSection = memo(() => (
  <motion.section 
    initial="hidden" 
    whileInView="visible" 
    viewport={{ once: true, amount: 0.1 }}
    variants={staggerContainer}
    aria-label="Shop by School" 
    className="mx-auto max-w-7xl px-4 py-16 md:px-6 relative"
  >
    <div className="absolute inset-0 bg-gradient-to-b from-[#FAF8F3]/50 to-transparent pointer-events-none -z-10" />
    <motion.div variants={fadeInUp} className="mb-12 flex flex-wrap items-end justify-between gap-4">
      <div>
        <span className="inline-block rounded-full bg-[#D4A017]/10 px-3 py-1 text-xs font-semibold text-[#D4A017] uppercase tracking-wider">
          Official Vendor
        </span>
        <h2 className="mt-3 text-3xl font-serif font-semibold text-[#1A2744] md:text-4xl">Shop by School</h2>
        <p className="mt-2 text-sm text-slate-500 max-w-md leading-relaxed">
          Authorised supplier for leading schools across Pakistan. Get exactly what your school requires.
        </p>
      </div>
      <Link
        to="/school-packs"
        className="group flex items-center gap-1.5 text-sm font-semibold text-[#D4A017] transition-colors duration-150 hover:text-[#b88a14]"
      >
        All school packs
        <span className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">
          <ArrowRight size={16} />
        </span>
      </Link>
    </motion.div>
    
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {SCHOOLS.map((school) => (
        <motion.div key={school.slug} variants={fadeInUp}>
          <Link
            to={`/school-packs?school=${school.slug}`}
            className="group flex flex-col items-center rounded-3xl border border-slate-200/60 bg-white/60 backdrop-blur-sm p-8 text-center transition-all duration-300 hover:border-[#D4A017]/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-[#D4A017] focus-visible:ring-offset-2"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-full border border-slate-100 bg-[#FAF8F3] shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:shadow-md">
              <LazyImage
                src={`/logos/${school.slug}.png`}
                alt={school.name}
                width="80"
                height="80"
                className="h-full w-full rounded-full object-contain p-4"
                placeholderSrc="/roots.png"
              />
            </div>
            <h3 className="mt-5 font-semibold text-[#1A2744] text-lg">{school.name}</h3>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{school.desc}</p>
          </Link>
        </motion.div>
      ))}
    </div>
  </motion.section>
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
      const [featuredRes, arrivalsRes] = await Promise.all([
        supabase.from('products').select('*').order('ratings', { ascending: false }).limit(4),
        supabase.from('products').select('*').order('created_at', { ascending: false }).limit(6)
      ]);

      if (featuredRes.error) throw featuredRes.error;
      if (arrivalsRes.error) throw arrivalsRes.error;

      if (featuredRes.data) setFeaturedProducts(featuredRes.data);
      if (arrivalsRes.data) setNewArrivals(arrivalsRes.data);
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
      const gridClass = `grid gap-6 sm:grid-cols-2 ${
        cols === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
      }`;
      const skeletonCount = cols === 4 ? 4 : 6;

      if (error) return <div className={gridClass}><ErrorState message={fetchError} onRetry={handleRetry} /></div>;
      if (loading) return <div className={gridClass}>{[...Array(skeletonCount)].map((_, i) => <SkeletonCard key={i} />)}</div>;
      if (!products.length) return <div className={gridClass}><EmptyState /></div>;

      return (
        <motion.div 
          variants={staggerContainer} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, amount: 0.1 }} 
          className={gridClass}
        >
          {products.map((p) => (
            <motion.div key={p._id || p.id} variants={fadeInUp}>
              <ProductCard product={p} />
            </motion.div>
          ))}
        </motion.div>
      );
    },
    [fetchError, handleRetry]
  );

  return (
    <main className="bg-white">
      {/* ── Skip link ──────────────────────────────────────────────────────── */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-[#D4A017] focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-[#1A2744]"
      >
        Skip to content
      </a>

      {/* ── Trust bar ──────────────────────────────────────────────────────── */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gradient-to-r from-[#1A2744] via-[#203152] to-[#1A2744] py-3.5 border-b border-white/5"
      >
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-4 list-none">
            {TRUST_ITEMS.map(({ icon: Icon, label, sub }) => (
              <li key={label} className="flex items-center gap-3 text-white">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 shrink-0">
                  <Icon size={16} className="text-[#D4A017]" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[11px] font-bold tracking-wide uppercase text-slate-100">{label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section
        id="main-content"
        aria-label="Hero"
        className="relative overflow-hidden bg-[#1A2744]"
      >
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A2744] via-[#121c30] to-[#0a101d] -z-10" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #D4A017 1px, transparent 0)',
            backgroundSize: '48px 48px',
          }}
          aria-hidden="true"
        />
        
        {/* Glowing Orbs for Glassmorphism Background */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#D4A017]/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#4a90e2]/10 rounded-full blur-[150px] pointer-events-none" />

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative mx-auto flex max-w-7xl flex-col gap-14 px-4 py-16 md:flex-row md:items-center md:gap-16 md:px-6 md:py-28"
        >
          {/* Copy */}
          <div className="relative z-10 max-w-xl space-y-7">
            <motion.div variants={fadeInUp}>
              <span className="inline-block rounded-full bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#D4A017] shadow-sm">
                Premium School Supplies
              </span>
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-[3rem] font-serif font-medium leading-[1.1] text-white md:text-[4.25rem] tracking-tight">
              Paper, pens &amp; <span className="text-[#D4A017] italic">everything</span> between the lines.
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-base leading-relaxed text-slate-300 md:text-lg max-w-md">
              Textbooks, notebooks, art materials, and office essentials — picked for
              students, teachers, and anyone who still enjoys a good pen.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-4 pt-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#D4A017] to-[#e5b839] px-7 py-3.5 text-sm font-bold text-[#1A2744] shadow-[0_0_20px_rgba(212,160,23,0.3)] transition-all"
                >
                  Shop Now <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/shop?bookpacks=true"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 backdrop-blur-sm px-7 py-3.5 text-sm font-bold text-white transition-all hover:bg-white/10 hover:border-white/50"
                >
                  School book packs
                </Link>
              </motion.div>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex gap-8 border-t border-white/10 pt-8 mt-4 text-sm">
              {[
                { label: 'Products', value: '2,400+' },
                { label: 'Brands',   value: '85+'    },
                { label: 'Since',    value: '1998'   },
              ].map(({ label, value }, i) => (
                <div key={label} className={`flex-1 ${i < 2 ? 'border-r border-white/10 pr-8' : ''}`}>
                  <p className="text-2xl font-serif font-semibold text-white drop-shadow-sm">{value}</p>
                  <p className="text-white/50 text-xs mt-1 uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Image Carousel */}
          <HeroCarousel />
        </motion.div>
      </section>

      <ShopBySchoolSection />

      {/* ── Categories ─────────────────────────────────────────────────────── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
        aria-label="Product categories"
        className="bg-[#FAF8F3]/60 py-20 md:py-24 relative overflow-hidden"
      >
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <motion.div variants={fadeInUp} className="mb-12 max-w-xl text-center mx-auto">
            <span className="inline-block rounded-full bg-[#D4A017]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#D4A017]">
              Departments
            </span>
            <h2 className="mt-3 text-3xl font-serif font-semibold text-[#1A2744] md:text-4xl">
              Find what you need
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              Organised the way you'd walk our aisles — beautifully laid out and not buried under generic filters.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {CATEGORIES.map(({ name, icon: Icon }) => (
              <motion.div key={name} variants={fadeInUp}>
                <Link
                  to={`/shop?category=${encodeURIComponent(name)}`}
                  className="group flex flex-col items-center justify-center gap-4 rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all duration-300 hover:border-[#D4A017]/40 hover:shadow-lg hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-[#D4A017]"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FAF8F3] to-slate-50 text-[#1A2744] shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#D4A017]/10 group-hover:text-[#D4A017]">
                    <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
                  </div>
                  <p className="text-sm font-semibold text-[#1A2744]">{name}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── New Arrivals ───────────────────────────────────────────────────── */}
      <section aria-label="New arrivals" className="bg-white py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 flex flex-wrap items-end justify-between gap-4 border-b border-slate-100 pb-6"
          >
            <div>
              <span className="inline-block rounded-full bg-[#D4A017]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#D4A017]">
                Just In
              </span>
              <h2 className="mt-3 text-3xl font-serif font-semibold text-[#1A2744]">New Arrivals</h2>
            </div>
            <Link
              to="/shop"
              className="group flex items-center gap-1.5 text-sm font-semibold text-[#D4A017] hover:text-[#b88a14]"
            >
              View all
              <span className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">
                <ArrowRight size={16} />
              </span>
            </Link>
          </motion.div>
          {renderGrid({
            loading: loadingArrivals,
            error: fetchError,
            products: newArrivals,
            cols: 3,
          })}
        </div>
      </section>

      {/* ── Delivery banner ────────────────────────────────────────────────── */}
      <section aria-label="Delivery offer" className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden flex flex-col gap-6 rounded-[2rem] bg-gradient-to-br from-[#1A2744] via-[#203152] to-[#121c30] px-8 py-12 md:flex-row md:items-center md:justify-between md:px-16 shadow-2xl border border-white/5"
        >
          {/* Decorative Background Elements */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#D4A017]/20 rounded-full blur-[80px]" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#4a90e2]/10 rounded-full blur-[80px]" />
          
          <div className="relative z-10 max-w-xl">
            <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#D4A017] backdrop-blur-sm border border-white/10 mb-4">
              Delivery across Pakistan
            </span>
            <h3 className="text-3xl font-serif font-medium text-white leading-tight">
              Free delivery on orders above Rs.&nbsp;1,500
            </h3>
            <p className="mt-3 text-sm text-white/70 leading-relaxed">
              We process and dispatch orders placed before 2 PM on the very same day. Cash on delivery available in major cities.
            </p>
          </div>
          <div className="relative z-10">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/shop"
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-[#D4A017] to-[#e5b839] px-8 py-4 text-sm font-bold text-[#1A2744] shadow-lg shadow-[#D4A017]/20 transition-all"
              >
                Start an order <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── Staff Picks ────────────────────────────────────────────────────── */}
      <section aria-label="Staff picks" className="bg-[#FAF8F3] py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200/60 pb-6"
          >
            <div>
              <span className="inline-block rounded-full bg-[#D4A017]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#D4A017]">
                This week
              </span>
              <h2 className="mt-3 text-3xl font-serif font-semibold text-[#1A2744]">Staff Picks</h2>
            </div>
            <Link
              to="/shop"
              className="group flex items-center gap-1.5 text-sm font-semibold text-[#D4A017] hover:text-[#b88a14]"
            >
              See full catalogue
              <span className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">
                <ArrowRight size={16} />
              </span>
            </Link>
          </motion.div>
          {renderGrid({
            loading: loadingFeatured,
            error: fetchError,
            products: featuredProducts,
            cols: 4,
          })}
        </div>
      </section>

      {/* ── Why us ─────────────────────────────────────────────────────────── */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        aria-label="Why choose us" 
        className="bg-white py-20 md:py-28"
      >
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <motion.div variants={fadeInUp} className="mb-14 max-w-xl text-center mx-auto">
            <span className="inline-block rounded-full bg-[#D4A017]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#D4A017]">
              Why people come back
            </span>
            <h2 className="mt-4 text-3xl font-serif font-semibold text-[#1A2744] md:text-5xl">
              Built on shelves, not slides
            </h2>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ title, description }) => (
              <motion.div
                variants={fadeInUp}
                key={title}
                className="group rounded-3xl border border-slate-100 bg-[#FAF8F3]/50 p-8 transition-all duration-300 hover:bg-white hover:border-[#D4A017]/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-2"
              >
                <div className="mb-6 h-1 w-10 rounded-full bg-[#D4A017] transition-all duration-300 group-hover:w-16" aria-hidden="true" />
                <h3 className="font-semibold text-[#1A2744] text-lg">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── Testimonials + Newsletter ──────────────────────────────────────── */}
      <section
        aria-label="Customer reviews and newsletter"
        className="bg-[#1A2744] py-20 md:py-28 relative overflow-hidden"
      >
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a101d] to-transparent -z-10" />
        
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative z-10">
          <div className="grid gap-12 lg:grid-cols-5">

            {/* Testimonials */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="lg:col-span-3"
            >
              <motion.span variants={fadeInUp} className="inline-block rounded-full bg-white/10 border border-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#D4A017]">
                From customers
              </motion.span>
              <motion.h2 variants={fadeInUp} className="mt-4 text-3xl font-serif font-semibold text-white">
                Word on the street
              </motion.h2>
              <ul className="mt-10 space-y-6 list-none" aria-label="Customer reviews">
                {TESTIMONIALS.map(({ name, role, initial, review }) => (
                  <motion.li
                    variants={fadeInUp}
                    key={name}
                    className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 transition-all duration-300 hover:bg-white/10"
                  >
                    <MessageSquare
                      size={28}
                      className="absolute right-6 top-6 text-white/10"
                      aria-hidden="true"
                    />
                    <div className="flex items-center gap-1 mb-4 text-[#D4A017]">
                      {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                    </div>
                    <p className="text-base leading-relaxed text-slate-300 font-medium">"{review}"</p>
                    <div className="mt-6 flex items-center gap-4 border-t border-white/10 pt-6">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#D4A017] to-[#e5b839] text-sm font-bold text-[#1A2744]">
                        {initial}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{role}</p>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Newsletter */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col justify-center rounded-3xl border border-white/10 bg-white p-10 lg:col-span-2 shadow-2xl self-start"
            >
              <h3 className="text-3xl font-serif font-semibold text-[#1A2744]">Restock alerts</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                New arrivals and back-in-stock notices — roughly twice a month, zero spam guaranteed.
              </p>
              <div className="mt-8">
                <NewsletterForm />
              </div>
            </motion.div>

          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;