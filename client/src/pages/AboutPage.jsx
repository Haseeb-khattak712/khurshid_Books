import { Link } from 'react-router-dom';

const AboutPage = () => (
  <main>
    <div className="hero-ink px-4 py-16 text-[var(--cream)] md:px-6 md:py-20">
      <div className="mx-auto max-w-3xl">
        <span className="label-tag text-[var(--brass-light)]">About us</span>
        <h1 className="mt-3 text-4xl font-semibold md:text-5xl">A shop that grew with its neighbourhood</h1>
        <p className="mt-5 text-base leading-relaxed text-white/70">
          Khurshid Books started as a single counter on Stationery Lane in 1998 — textbooks for the school down the road, registers for the accountants upstairs, pens for everyone.
        </p>
      </div>
    </div>

    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="surface-raised p-8">
          <h2 className="font-serif text-2xl font-semibold text-[var(--ink)]">What we believe</h2>
          <p className="mt-4 text-sm leading-relaxed text-[var(--text-muted)]">
            Good stationery is not luxury — it is the quiet tool behind every exam passed, every sketch finished, every letter sent. We stock what people actually use, from Camlin watercolours to O-Level past papers, and we keep it in stock.
          </p>
        </div>
        <div className="surface-raised p-8">
          <h2 className="font-serif text-2xl font-semibold text-[var(--ink)]">Where we are now</h2>
          <p className="mt-4 text-sm leading-relaxed text-[var(--text-muted)]">
            The counter became a warehouse, then a website — but the same family still checks the shelves. Walk in anytime, or order online with the same people picking your items.
          </p>
        </div>
      </div>
      <div className="mt-10 text-center">
        <Link to="/shop" className="btn-primary">Browse the catalogue</Link>
      </div>
    </div>
  </main>
);

export default AboutPage;
