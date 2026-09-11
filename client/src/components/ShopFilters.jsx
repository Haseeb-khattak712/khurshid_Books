import { memo, useEffect, useState, useMemo } from 'react';
import { SlidersHorizontal, ChevronDown, ChevronRight, CornerDownRight } from 'lucide-react';
import { fetchCategories, DEFAULT_CATEGORIES, buildCategoryTree } from '../services/categoryService.js';

const ShopFilters = ({
  categoryParam,
  handleCategoryChange,
  price,
  setPrice,
  rating,
  setRating
}) => {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    let mounted = true;
    fetchCategories(false)
      .then((data) => {
        if (mounted && data && data.length > 0) {
          setCategories(data);
          // Auto-expand the category if currently selected
          const activeTree = buildCategoryTree(data);
          const initialExpanded = {};
          activeTree.forEach(node => {
            if (node.children && node.children.some(c => c.name.toLowerCase() === categoryParam?.toLowerCase())) {
              initialExpanded[node.id || node.slug] = true;
            }
          });
          setExpandedCategories(prev => ({ ...prev, ...initialExpanded }));
        }
      })
      .catch((err) => {
        console.error('Error loading filter categories:', err);
      });
    return () => { mounted = false; };
  }, [categoryParam]);

  const categoryTree = useMemo(() => {
    return buildCategoryTree(categories);
  }, [categories]);

  const toggleExpand = (id, e) => {
    e.stopPropagation();
    setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside className="surface-raised h-fit p-5 lg:sticky lg:top-24">
      <div className="flex items-center gap-2 border-b border-[var(--line)] pb-3">
        <SlidersHorizontal size={16} className="text-[var(--brass)]" />
        <h2 className="font-serif text-xl font-semibold text-[var(--ink)]">Filters</h2>
      </div>
      <div className="mt-5 space-y-6">
        
        {/* Category Hierarchy Filter */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              Category
            </h3>
            {categoryParam && (
              <button
                type="button"
                onClick={() => handleCategoryChange('')}
                className="text-[11px] text-[var(--brass)] hover:underline font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto pr-1 space-y-1 text-sm text-[var(--text)]">
            {categoryTree.map((root) => {
              const hasChildren = root.children && root.children.length > 0;
              const isExpanded = expandedCategories[root.id || root.slug] ?? true;
              const isSelected = categoryParam?.toLowerCase() === root.name.toLowerCase() || categoryParam?.toLowerCase() === root.slug?.toLowerCase();

              return (
                <div key={root.id || root.slug} className="space-y-1">
                  <div className={`flex items-center justify-between rounded-lg px-1.5 py-1 transition ${
                    isSelected ? 'bg-amber-50 text-[var(--brass)] font-semibold' : 'hover:bg-slate-50'
                  }`}>
                    <label className="flex cursor-pointer items-center gap-2 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        className="accent-[var(--brass)] h-3.5 w-3.5"
                        checked={isSelected}
                        onChange={() => handleCategoryChange(root.name)}
                      />
                      <span className="truncate text-xs">{root.name}</span>
                    </label>

                    {hasChildren && (
                      <button
                        type="button"
                        onClick={(e) => toggleExpand(root.id || root.slug, e)}
                        className="p-1 rounded hover:bg-slate-200 text-slate-400"
                        title={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                      </button>
                    )}
                  </div>

                  {/* Subcategories */}
                  {hasChildren && isExpanded && (
                    <div className="pl-5 space-y-1 border-l border-slate-200 ml-2 py-0.5">
                      {root.children.map((sub) => {
                        const isSubSelected = categoryParam?.toLowerCase() === sub.name.toLowerCase() || categoryParam?.toLowerCase() === sub.slug?.toLowerCase();
                        return (
                          <label
                            key={sub.id || sub.slug}
                            className={`flex cursor-pointer items-center gap-2 rounded px-1.5 py-0.5 text-xs transition ${
                              isSubSelected ? 'text-[var(--brass)] font-bold bg-amber-50/80' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="accent-[var(--brass)] h-3 w-3"
                              checked={isSubSelected}
                              onChange={() => handleCategoryChange(sub.name)}
                            />
                            <span className="truncate">{sub.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Price Filter */}
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Max Price</h3>
          <input
            type="range"
            min="50"
            max="10000"
            step="50"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full accent-[var(--brass)]"
          />
          <p className="mt-2 text-xs font-semibold text-[var(--text)]">Up to Rs. {price.toLocaleString()}</p>
        </div>

        {/* Rating Filter */}
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Rating</h3>
          <div className="space-y-2 text-sm">
            {[4, 3, 2].map((rate) => (
              <label key={rate} className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="radio"
                  name="rating"
                  className="accent-[var(--brass)]"
                  checked={Number(rating) === rate}
                  onChange={() => setRating(rate.toString())}
                />
                {rate} stars &amp; up
              </label>
            ))}
            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="radio"
                name="rating"
                className="accent-[var(--brass)]"
                checked={rating === ''}
                onChange={() => setRating('')}
              />
              Any rating
            </label>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default memo(ShopFilters);
