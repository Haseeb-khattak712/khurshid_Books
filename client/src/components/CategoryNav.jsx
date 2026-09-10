import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  ChevronDown,
  Sparkles,
  Flame,
  ArrowRight,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { fetchCategories, DEFAULT_CATEGORIES, getCategoryIcon } from '../services/categoryService.js';

const CategoryNav = () => {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    fetchCategories(false).then((data) => {
      if (isMounted && data && data.length > 0) {
        setCategories(data);
      }
    }).catch(console.error);

    return () => { isMounted = false; };
  }, []);

  // Close dropdown on click outside or escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsDropdownOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Close dropdown when path changes
  useEffect(() => {
    setIsDropdownOpen(false);
  }, [location.pathname, location.search]);

  // Quick horizontal categories (take first 6-7 popular ones)
  const quickLinks = categories.slice(0, 7);

  return (
    <div className="border-t border-b border-[var(--line)] bg-white/80 backdrop-blur-md hidden lg:block select-none">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
        
        {/* Left: "Shop by Category" Mega Button */}
        <div ref={dropdownRef} className="relative py-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2.5 rounded-xl bg-[var(--ink)] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[var(--brass)] shadow-xs"
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
          >
            <Menu size={16} />
            <span>Shop by Category</span>
            <ChevronDown
              size={15}
              className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Category Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute left-0 top-[calc(100%+4px)] z-50 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-fade-in divide-y divide-slate-100">
              <div className="bg-slate-50/80 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>All Departments</span>
                <span className="text-[10px] lowercase text-slate-400 font-normal">
                  {categories.length} categories
                </span>
              </div>

              <div className="max-h-[420px] overflow-y-auto py-1.5">
                {categories.map((cat) => {
                  const IconComponent = getCategoryIcon(cat.icon_name);
                  const isSchool = cat.name.toLowerCase().includes('school');
                  const isBooks = cat.name.toLowerCase().includes('book');

                  return (
                    <Link
                      key={cat.id || cat.slug}
                      to={`/shop?category=${encodeURIComponent(cat.name)}`}
                      className="group flex items-center justify-between px-4 py-2.5 transition hover:bg-amber-50/60"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition group-hover:bg-[var(--brass)] group-hover:text-white">
                          <IconComponent size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-slate-800 group-hover:text-[var(--brass)] transition">
                            {cat.name}
                          </p>
                          {cat.description && (
                            <p className="truncate text-[10px] text-slate-400">
                              {cat.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {isSchool ? (
                        <span className="ml-2 shrink-0 rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-bold uppercase text-rose-600 border border-rose-200">
                          Hot
                        </span>
                      ) : (
                        <ArrowRight
                          size={12}
                          className="shrink-0 text-slate-300 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition"
                        />
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Bottom footer highlight */}
              <div className="bg-slate-50/50 p-2.5">
                <Link
                  to="/shop"
                  className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[var(--brass)] hover:underline"
                >
                  <Sparkles size={13} />
                  <span>Explore Full Catalog</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Center: Horizontal Quick Links */}
        <nav className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none">
          {quickLinks.map((cat) => {
            const isSchoolPack = cat.name.toLowerCase().includes('school packs');
            return (
              <Link
                key={cat.id || cat.slug}
                to={`/shop?category=${encodeURIComponent(cat.name)}`}
                className="relative flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-[var(--brass)]"
              >
                <span>{cat.name}</span>
                {isSchoolPack && (
                  <span className="flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold uppercase text-amber-800">
                    <Flame size={10} className="text-amber-600" /> Packs
                  </span>
                )}
              </Link>
            );
          })}

          <Link
            to="/shop"
            className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold text-[var(--brass)] hover:underline flex items-center gap-1"
          >
            <span>All Categories &rarr;</span>
          </Link>
        </nav>

        {/* Right: Quick Perks Badge */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-500 shrink-0">
          <div className="flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Same Day Dispatch</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CategoryNav;
