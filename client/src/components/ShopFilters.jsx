import { memo } from 'react';
import { SlidersHorizontal } from 'lucide-react';

const CATEGORIES = [
  'Books',
  'Notebooks',
  'Pens',
  'Art Supplies',
  'Office Supplies',
  'Bags',
  'Calculators',
  'Geometry',
  'Paper Products',
  'Gift Items'
];

const ShopFilters = ({
  categoryParam,
  handleCategoryChange,
  price,
  setPrice,
  rating,
  setRating
}) => {
  return (
    <aside className="surface-raised h-fit p-5 lg:sticky lg:top-24">
      <div className="flex items-center gap-2 border-b border-[var(--line)] pb-3">
        <SlidersHorizontal size={16} className="text-[var(--brass)]" />
        <h2 className="font-serif text-xl font-semibold text-[var(--ink)]">Filters</h2>
      </div>
      <div className="mt-5 space-y-6">
        {/* Category Filter */}
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Category</h3>
          <div className="max-h-60 overflow-y-auto pr-1 space-y-2 text-sm text-[var(--text)]">
            {CATEGORIES.map((cat) => (
              <label key={cat} className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  className="accent-[var(--brass)]"
                  checked={categoryParam === cat}
                  onChange={() => handleCategoryChange(cat)}
                />
                {cat}
              </label>
            ))}
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
