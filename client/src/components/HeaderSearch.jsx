import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, X, Loader2, BookOpen, ArrowRight } from 'lucide-react';
import { supabase } from '../services/supabase.js';
import { fetchCategories, DEFAULT_CATEGORIES, getCategoryIcon } from '../services/categoryService.js';

const HeaderSearch = ({ onSearchExecuted }) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('*');
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [results, setResults] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Load active categories for the selector
  useEffect(() => {
    let isMounted = true;
    fetchCategories(false).then((data) => {
      if (isMounted && data && data.length > 0) {
        setCategories(data);
      }
    }).catch(console.error);
    return () => { isMounted = false; };
  }, []);

  // Close popup on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Debounced predictive search query
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        let dbQuery = supabase
          .from('products')
          .select('id, name, slug, price, discount_price, category, brand, images, stock', { count: 'exact' })
          .ilike('name', `%${trimmed}%`);

        if (selectedCategory && selectedCategory !== '*') {
          dbQuery = dbQuery.ilike('category', selectedCategory);
        }

        const { data, count, error } = await dbQuery.limit(5);

        if (!error && data) {
          setResults(data);
          setTotalCount(count || data.length);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query, selectedCategory]);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    setIsOpen(false);

    const params = new URLSearchParams();
    if (query.trim()) {
      params.set('search', query.trim());
    }
    if (selectedCategory && selectedCategory !== '*') {
      params.set('category', selectedCategory);
    }

    if (onSearchExecuted) onSearchExecuted();
    navigate(`/shop?${params.toString()}`);
  };

  const handleProductClick = (slug) => {
    setIsOpen(false);
    if (onSearchExecuted) onSearchExecuted();
    navigate(`/product/${slug}`);
  };

  const clearQuery = () => {
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      {/* Search Input Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex items-center rounded-2xl border border-slate-200 bg-white shadow-xs transition-all duration-200 focus-within:border-[var(--brass)] focus-within:ring-2 focus-within:ring-[var(--brass)]/20 hover:border-slate-300"
      >
        {/* Category Selector Dropdown */}
        <div className="relative hidden shrink-0 sm:flex items-center border-r border-slate-200 bg-slate-50/70 hover:bg-slate-100/70 rounded-l-2xl transition">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-10 cursor-pointer appearance-none bg-transparent pl-3.5 pr-8 text-xs font-medium text-slate-700 focus:outline-none max-w-[145px] truncate"
            title="Filter by category"
          >
            <option value="*">All Categories</option>
            {categories.map((c) => (
              <option key={c.id || c.slug} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={13}
            className="pointer-events-none absolute right-2.5 text-slate-400"
          />
        </div>

        {/* Text Input */}
        <div className="relative flex flex-1 items-center">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            placeholder="Search books, course packs, stationery, arts..."
            className="h-10.5 w-full bg-transparent px-3.5 text-sm text-[var(--ink)] placeholder-slate-400 focus:outline-none"
          />

          {/* Loading or Clear Icon */}
          {loading ? (
            <Loader2 size={16} className="mr-2.5 animate-spin text-[var(--brass)]" />
          ) : query ? (
            <button
              type="button"
              onClick={clearQuery}
              className="mr-2 p-1 text-slate-400 hover:text-slate-600 transition"
              title="Clear search"
            >
              <X size={14} />
            </button>
          ) : null}
        </div>

        {/* Search Action Button */}
        <button
          type="submit"
          className="flex h-10.5 items-center gap-1.5 rounded-r-2xl bg-[var(--brass)] px-4 text-xs font-semibold text-white transition hover:bg-[var(--brass)]/90 active:scale-95 shrink-0"
          aria-label="Submit search"
        >
          <Search size={15} />
          <span className="hidden md:inline">Search</span>
        </button>
      </form>

      {/* Predictive Live Results Dropdown */}
      {isOpen && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xl animate-fade-in">
          
          {/* Header count */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-2 text-[11px] font-medium text-slate-500">
            <span>
              {results.length > 0
                ? `Showing ${results.length} of ${totalCount} results`
                : 'No matching products'}
            </span>
            {selectedCategory !== '*' && (
              <span className="rounded-md bg-white px-2 py-0.5 border border-slate-200 text-slate-600">
                in {selectedCategory}
              </span>
            )}
          </div>

          {/* Results List */}
          {results.length > 0 ? (
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {results.map((item) => {
                const img = Array.isArray(item.images)
                  ? item.images[0]
                  : item.images || '/placeholder.png';
                const hasDiscount = item.discount_price && item.discount_price < item.price;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleProductClick(item.slug || item.id)}
                    className="flex cursor-pointer items-center gap-3.5 p-3 transition hover:bg-slate-50/80 group"
                  >
                    {/* Thumbnail */}
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-[#FAF8F3] p-1 flex items-center justify-center">
                      <img
                        src={img}
                        alt={item.name}
                        className="h-full w-full object-contain transition group-hover:scale-105"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-[#1A2744] group-hover:text-[var(--brass)] transition">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 font-medium">
                          {item.category || 'General'}
                        </span>
                        {item.brand && <span>• {item.brand}</span>}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right shrink-0">
                      {hasDiscount ? (
                        <>
                          <span className="text-sm font-bold text-rose-600">
                            Rs. {Number(item.discount_price).toLocaleString()}
                          </span>
                          <span className="block text-[11px] text-slate-400 line-through">
                            Rs. {Number(item.price).toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-bold text-[#1A2744]">
                          Rs. {Number(item.price).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-sm">
              <BookOpen size={28} className="mx-auto text-slate-300 mb-2" />
              <p>No products found matching "{query}"</p>
              <p className="text-xs text-slate-400 mt-1">
                Try searching with general keywords like "notebook", "oxford", or "pencil".
              </p>
            </div>
          )}

          {/* Footer View All Link */}
          {results.length > 0 && (
            <div className="border-t border-slate-100 bg-slate-50/50 p-2.5 text-center">
              <button
                type="button"
                onClick={handleSearchSubmit}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brass)] hover:underline"
              >
                View all {totalCount} results for "{query}" <ArrowRight size={13} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HeaderSearch;
