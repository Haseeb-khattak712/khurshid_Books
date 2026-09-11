import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Search, Package, ExternalLink, Plus, AlertCircle } from 'lucide-react';
import { fetchProductsInCategory, getCategoryIcon } from '../../services/categoryService.js';
import Spinner from '../Spinner.jsx';

/**
 * CategoryItemModal: Displays items associated with a category and its subcategories.
 * Gives admins instant visibility and management of products inside any branch of the hierarchy.
 */
export default function CategoryItemModal({
  category,
  onClose,
  allCategories = []
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [includeSubcategories, setIncludeSubcategories] = useState(true);

  useEffect(() => {
    if (!category) return;

    let isMounted = true;
    setLoading(true);

    fetchProductsInCategory(category, includeSubcategories)
      .then((data) => {
        if (isMounted) {
          setProducts(data);
        }
      })
      .catch((err) => {
        console.error('Error fetching items for category:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [category, includeSubcategories]);

  if (!category) return null;

  const IconComponent = getCategoryIcon(category.icon_name);

  // Filter products by search
  const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.subcategory?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--brass)]/10 text-[var(--brass)]">
              <IconComponent size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-xl font-semibold text-[#1A2744]">
                  {category.name}
                </h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                  {products.length} Products
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {category.description || 'Managing items inside this category and its subcategories'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Toolbar & Search */}
        <div className="py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products by title, brand, or subcategory..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-4 text-xs focus:border-[var(--brass)] focus:bg-white focus:outline-none transition"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600 select-none">
              <input
                type="checkbox"
                checked={includeSubcategories}
                onChange={(e) => setIncludeSubcategories(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-300 text-[var(--brass)] focus:ring-[var(--brass)]"
              />
              Include Subcategories
            </label>

            <Link
              to={`/admin/products?category=${encodeURIComponent(category.name)}`}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--ink)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--brass)] transition shadow-xs"
            >
              <Plus size={13} /> Add Product
            </Link>
          </div>
        </div>

        {/* Product Items Table / Content */}
        <div className="flex-1 overflow-y-auto mt-2 -mx-2 px-2">
          {loading ? (
            <div className="py-16 flex justify-center">
              <Spinner />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-10 text-center my-4">
              <Package size={36} className="mx-auto text-slate-300 mb-2" />
              <p className="font-serif text-base font-semibold text-slate-700">
                No products found in this category
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {search
                  ? 'No items matched your search filter.'
                  : 'Add items to this category from Manage Products, or assign existing products here.'}
              </p>
              <Link
                to={`/admin/products`}
                onClick={onClose}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brass)] hover:underline"
              >
                Go to Manage Products <ExternalLink size={12} />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
              {filteredProducts.map((prod) => {
                const imgUrl = Array.isArray(prod.images) ? prod.images[0] : prod.image;
                const isOutOfStock = Number(prod.stock) <= 0;
                const isLowStock = Number(prod.stock) > 0 && Number(prod.stock) <= 5;

                return (
                  <div
                    key={prod.id || prod._id}
                    className="flex items-center justify-between p-3 hover:bg-slate-50/75 transition gap-3"
                  >
                    {/* Image & Title */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-100 border border-slate-200/60 overflow-hidden flex items-center justify-center text-slate-300">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={prod.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package size={18} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#1A2744] truncate">
                          {prod.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                          {prod.brand && <span>Brand: {prod.brand}</span>}
                          {prod.subcategory && (
                            <span className="rounded bg-amber-50 px-1.5 py-0.2 text-[10px] text-amber-800 border border-amber-200/60">
                              {prod.subcategory}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Price & Stock */}
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-slate-800">
                        Rs. {Number(prod.price || 0).toLocaleString()}
                      </p>
                      <span
                        className={`inline-block text-[10px] font-medium rounded-full px-2 py-0.2 mt-0.5 ${
                          isOutOfStock
                            ? 'bg-rose-50 text-rose-700'
                            : isLowStock
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {isOutOfStock ? 'Out of Stock' : `${prod.stock} in stock`}
                      </span>
                    </div>

                    {/* Action */}
                    <div className="shrink-0 pl-2">
                      <Link
                        to={`/admin/products?search=${encodeURIComponent(prod.name)}`}
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#1A2744] hover:bg-slate-100 transition inline-flex items-center"
                        title="Edit product in Manage Products"
                      >
                        <ExternalLink size={14} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Showing {filteredProducts.length} of {products.length} catalog items
          </span>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary py-2 px-5 text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
