import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, PenLine, Palette, Briefcase, Calculator, Ruler, FileText, Gift, Backpack } from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import api from '../services/api.js';
import Spinner from '../components/Spinner.jsx';

const categories = [
  { name: 'Books', icon: BookOpen },
  { name: 'Notebooks', icon: FileText },
  { name: 'Pens', icon: PenLine },
  { name: 'Art Supplies', icon: Palette },
  { name: 'Office', icon: Briefcase },
  { name: 'Bags', icon: Backpack },
  { name: 'Calculators', icon: Calculator },
  { name: 'Geometry', icon: Ruler },
  { name: 'Paper', icon: FileText },
  { name: 'Gifts', icon: Gift }
];

const features = [
  { num: '01', title: 'Genuine stock', description: 'We source directly from authorised distributors — no grey-market surprises.' },
  { num: '02', title: 'Same-day dispatch', description: 'Orders placed before 2pm leave our Lahore warehouse the same day.' },
  { num: '03', title: 'Straightforward returns', description: 'Damaged or wrong item? WhatsApp us a photo and we sort it out.' },
  { num: '04', title: 'One-stop shelves', description: 'From O-Level past papers to brush pens — the whole list in one cart.' }
];

const testimonials = [
  { name: 'Amina Shahid', role: 'Architecture student, NCA', review: 'They had my entire semester supply list ready in two days. The journals are exactly what I wanted — thick paper, no bleed-through.' },
  { name: 'Bilal Hassan', role: 'School admin, DHA', review: 'We order bulk stationery every term. Pricing is fair, invoices are proper, and delivery is never late.' },
  { name: 'Sara Khokhar', role: 'Calligraphy hobbyist', review: 'Finally a local shop that keeps nibs and ink in stock year-round. Packaging was careful — not a bent box in the lot.' }
];

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await api.get('/products/featured');
        if (data.success) {
          setFeaturedProducts(data.data);
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <main>
      {/* Hero */}
      <section data-reveal className="hero-ink text-[var(--cream)]">
        <div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-4 py-16 md:flex-row md:items-center md:gap-16 md:px-6 md:py-24">
          <div className="relative z-10 max-w-xl space-y-6">
            <span className="label-tag text-[var(--brass-light)]">Lahore&apos;s stationery house</span>
            <h1 className="text-[2.75rem] font-semibold leading-[1.08] md:text-[3.75rem]">
              Paper, pens &amp; everything between the lines
            </h1>
            <p className="text-base leading-relaxed text-white/70 md:text-lg">
              Textbooks, notebooks, art materials, and office essentials — picked for students, teachers, and anyone who still enjoys a good pen.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/shop" className="btn-primary">
                Browse the shop
                <ArrowRight size={16} />
              </Link>
              <Link to="/about" className="btn-ghost">
                How we started
              </Link>
            </div>
            <dl className="flex gap-8 border-t border-white/10 pt-6 text-sm">
              <div>
                <dt className="text-white/45">Catalogue</dt>
                <dd className="font-serif text-2xl font-semibold text-[var(--brass-light)]">2,400+</dd>
              </div>
              <div>
                <dt className="text-white/45">Brands</dt>
                <dd className="font-serif text-2xl font-semibold text-[var(--brass-light)]">85+</dd>
              </div>
              <div>
                <dt className="text-white/45">Since</dt>
                <dd className="font-serif text-2xl font-semibold text-[var(--brass-light)]">1998</dd>
              </div>
            </dl>
          </div>

          <div className="relative z-10 w-full max-w-lg flex-shrink-0 md:ml-auto">
            <div className="book-stack md:min-h-[440px]">
              <div className="book-stack__layer book-stack__layer--back">
                <img src="https://images.unsplash.com/photo-1495446815901-a72907e633e8?auto=format&fit=crop&w=600&q=80" alt="" />
                <div className="book-stack__spine" />
              </div>
              <div className="book-stack__layer book-stack__layer--mid">
                <img src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80" alt="" />
                <div className="book-stack__spine" />
              </div>
              <div className="book-stack__layer book-stack__layer--front">
                <img src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80" alt="Stationery collection" />
                <div className="book-stack__spine" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section data-reveal className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <div className="mb-10 max-w-lg">
          <span className="label-tag">Departments</span>
          <h2 className="mt-2 text-3xl font-semibold text-[var(--ink)] md:text-4xl">Find what you need</h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
            Organised the way you&apos;d walk our aisles — not buried under generic filters.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {categories.map(({ name, icon: Icon }) => (
            <Link key={name} to={`/shop?category=${encodeURIComponent(name)}`} className="category-tile block">
              <div className="category-tile__icon text-[var(--ink-soft)]">
                <Icon size={20} strokeWidth={1.75} />
              </div>
              <p className="font-serif text-lg font-semibold text-[var(--ink)]">{name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="border-y border-[var(--line)] bg-[var(--paper)] py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="label-tag">This week</span>
              <h2 className="mt-2 text-3xl font-semibold text-[var(--ink)]">Staff picks</h2>
            </div>
            <Link to="/shop" className="flex items-center gap-1 text-sm font-semibold text-[var(--brass)] transition hover:gap-2">
              See full catalogue <ArrowRight size={14} />
            </Link>
          </div>
          
          {loading ? (
            <Spinner />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Delivery banner */}
      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="surface-raised flex flex-col items-start gap-4 p-8 md:flex-row md:items-center md:justify-between md:p-10">
          <div>
            <p className="text-sm font-medium text-[var(--brass)]">Delivery across Pakistan</p>
            <h3 className="mt-1 font-serif text-2xl font-semibold text-[var(--ink)]">
              Free shipping on orders above Rs. 1,500
            </h3>
            <p className="mt-2 text-sm text-[var(--text-muted)]">Cash on delivery available in major cities.</p>
          </div>
          <Link to="/shop" className="btn-primary shrink-0">Start an order</Link>
        </div>
      </section>

      {/* Why us */}
      <section className="hero-ink py-16 text-[var(--cream)] md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-12 max-w-md">
            <span className="label-tag text-[var(--brass-light)]">Why people come back</span>
            <h2 className="mt-2 text-3xl font-semibold md:text-4xl">Built on shelves, not slides</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.num} className="feature-panel">
                <p className="feature-panel__num">{feature.num}</p>
                <h3 className="mt-3 font-serif text-xl font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials + newsletter */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <span className="label-tag">From customers</span>
            <h2 className="mt-2 text-3xl font-semibold text-[var(--ink)]">Word on the street</h2>
            <div className="mt-8 space-y-5">
              {testimonials.map((item) => (
                <div key={item.name} className="quote-card">
                  <p className="text-sm leading-relaxed text-[var(--text-muted)]">{item.review}</p>
                  <p className="mt-4 font-semibold text-[var(--ink)]">{item.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{item.role}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="surface-raised flex flex-col justify-center p-8 lg:col-span-2">
            <h3 className="font-serif text-2xl font-semibold text-[var(--ink)]">Restock alerts</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
              New arrivals and back-in-stock notices — roughly twice a month, no spam.
            </p>
            <form className="mt-6 space-y-3" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="you@email.com" className="field" />
              <button type="submit" className="btn-primary w-full">Subscribe</button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
