import { Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="footer-depth text-[var(--cream)]">
    <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-[1.4fr_1fr_1fr_1.2fr] md:px-6">
      <div>
        <p className="font-serif text-3xl font-semibold">Khurshid Books</p>
        <p className="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-white/40">Est. Lahore</p>
        <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/65">
          A neighbourhood stationery shop grown into a full catalogue — notebooks, pens, textbooks, and art supplies under one roof.
        </p>
      </div>

      <div>
        <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Browse</h4>
        <ul className="space-y-2.5 text-sm text-white/70">
          <li><Link to="/shop" className="transition hover:text-[var(--brass-light)]">Shop all</Link></li>
          <li><Link to="/about" className="transition hover:text-[var(--brass-light)]">Our story</Link></li>
          <li><Link to="/contact" className="transition hover:text-[var(--brass-light)]">Get in touch</Link></li>
          <li><Link to="/wishlist" className="transition hover:text-[var(--brass-light)]">Saved items</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Departments</h4>
        <ul className="space-y-2.5 text-sm text-white/70">
          <li>Textbooks &amp; reference</li>
          <li>Writing &amp; notebooks</li>
          <li>Art &amp; craft</li>
          <li>Office &amp; school</li>
        </ul>
      </div>

      <div>
        <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Visit us</h4>
        <ul className="space-y-3 text-sm text-white/70">
          <li className="flex gap-2.5">
            <MapPin size={16} className="mt-0.5 shrink-0 text-[var(--brass-light)]" />
            <span>123 Stationery Lane, Anarkali, Lahore</span>
          </li>
          <li className="flex gap-2.5">
            <Mail size={16} className="mt-0.5 shrink-0 text-[var(--brass-light)]" />
            <span>support@khursheedagency.com</span>
          </li>
          <li className="flex gap-2.5">
            <Phone size={16} className="mt-0.5 shrink-0 text-[var(--brass-light)]" />
            <span>+92 300 1234567</span>
          </li>
        </ul>
      </div>
    </div>
    <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/40 md:px-6">
      © {new Date().getFullYear()} Khurshid Books. All rights reserved.
    </div>
  </footer>
);

export default Footer;
