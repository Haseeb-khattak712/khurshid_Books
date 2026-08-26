import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { LayoutGrid, List, Search } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import ProductCard from '../components/ProductCard.jsx';
import ShopFilters from '../components/ShopFilters.jsx';
import api from '../services/api.js';
import Spinner from '../components/Spinner.jsx';
import useScrollReveal from '../hooks/useScrollReveal.jsx';
import useDebounce from '../hooks/useDebounce.js';


const ShopPage = () => {
  const [viewGrid, setViewGrid] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filters state
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParam);
  const [price, setPrice] = useState(5000);
  const [rating, setRating] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const debouncedPrice = useDebounce(price, 300);

  // Trigger animation hook
  useScrollReveal([page, products]);

  // Sync category param with page state
  useEffect(() => {
    setPage(1);
  }, [categoryParam, rating, sort, debouncedPrice]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit: 9,
          sort,
          maxPrice: debouncedPrice
        };
        
        if (categoryParam) params.category = categoryParam;
        if (searchParam) params.search = searchParam;
        if (rating) params.rating = rating;

        const { data } = await api.get('/products', { params });
        if (data.success) {
          setProducts(data.data);
          setPages(data.pages);
          setTotalCount(data.count);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryParam, searchParam, debouncedPrice, rating, sort, page]);

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    setSearchParams((prev) => {
      if (search) {
        prev.set('search', search);
      } else {
        prev.delete('search');
      }
      prev.set('page', '1');
      return prev;
    });
    setPage(1);
  }, [search, setSearchParams]);

  const handleCategoryChange = useCallback((cat) => {
    setSearchParams((prev) => {
      if (categoryParam === cat) {
        prev.delete('category');
      } else {
        prev.set('category', cat);
      }
      prev.set('page', '1');
      return prev;
    });
  }, [categoryParam, setSearchParams]);

  return (
    <main>
      <div className="border-b border-[var(--line)] bg-[var(--paper)]">
        <div data-reveal className="mx-auto max-w-7xl px-4 py-10 md:px-6">
          <nav className="mb-2 text-xs text-[var(--text-muted)]">
            <Link to="/" className="transition hover:text-[var(--ink)]">Home</Link>
            <span className="mx-2 opacity-40">/</span>
            <span>Shop</span>
          </nav>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="font-serif text-4xl font-semibold text-[var(--ink)]">Shop</h1>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                {loading ? 'Searching shelves...' : `${totalCount} products found`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} className="relative max-w-xs">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="field py-1.5 pl-8 pr-4 text-xs"
                />
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              </form>

              <div className="surface flex w-fit gap-1 p-1">
                <button
                  type="button"
                  className={`flex items-center gap-1.5 rounded-[var(--radius-sm)] px-3 py-1.5 text-sm font-medium transition ${viewGrid ? 'bg-[var(--ink)] text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--ink)]'}`}
                  onClick={() => setViewGrid(true)}
                >
                  <LayoutGrid size={15} /> Grid
                </button>
                <button
                  type="button"
                  className={`flex items-center gap-1.5 rounded-[var(--radius-sm)] px-3 py-1.5 text-sm font-medium transition ${!viewGrid ? 'bg-[var(--ink)] text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--ink)]'}`}
                  onClick={() => setViewGrid(false)}
                >
                  <List size={15} /> List
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* Filters Sidebar */}
          <ShopFilters 
            categoryParam={categoryParam} 
            handleCategoryChange={handleCategoryChange}
            price={price}
            setPrice={setPrice}
            rating={rating}
            setRating={setRating}
          />

          {/* Product Section */}
          <section>
            <div className="surface mb-6 flex flex-wrap items-center justify-between gap-4 p-4">
              <p className="text-sm text-[var(--text-muted)]">
                {products.length > 0
                  ? `Showing ${(page - 1) * 9 + 1}–${Math.min(page * 9, totalCount)} of ${totalCount}`
                  : 'No products match your criteria'}
              </p>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="field w-auto py-1.5 text-sm"
              >
                <option value="newest">Newest first</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
                <option value="popular">Most popular</option>
                <option value="best_rated">Best rated</option>
              </select>
            </div>

            {loading ? (
              <Spinner />
            ) : products.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <h3 className="font-serif text-2xl font-semibold text-[var(--ink)]">No products found</h3>
                <p className="mt-2 text-sm text-[var(--text-muted)]">Try adjusting your filters or search keywords.</p>
              </div>
            ) : (
              <div className={viewGrid ? 'grid gap-5 md:grid-cols-2 xl:grid-cols-3' : 'space-y-4'}>
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && !loading && (
              <div className="mt-10 flex items-center justify-center gap-3">
                <button
                  type="button"
                  className="btn-secondary py-2 px-4 disabled:opacity-50"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <span className="text-sm text-[var(--text-muted)] font-medium">
                  Page {page} of {pages}
                </span>
                <button
                  type="button"
                  className="btn-primary py-2 px-4 disabled:opacity-50"
                  disabled={page === pages}
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                >
                  Next
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default ShopPage;
