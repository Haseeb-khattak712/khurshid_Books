import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

const ProductCard = ({ product }) => {
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice : product.price;

  return (
    <div className="card-3d h-full">
      <Link to={`/product/${product.slug}`} className="card-3d-inner surface-raised flex h-full flex-col overflow-hidden">
        <div className="relative h-56 overflow-hidden bg-[var(--paper)]">
          <img
            src={product.images?.[0] || '/placeholder.png'}
            alt={product.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          {hasDiscount && (
            <span className="absolute left-3 top-3 rounded-[var(--radius-sm)] bg-[var(--stamp)] px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-white shadow-md">
              Sale
            </span>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[var(--ink)]/30 to-transparent" />
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <span className="text-[0.7rem] font-medium text-[var(--text-muted)]">{product.category}</span>
            <span className="rounded-[var(--radius-sm)] bg-[var(--paper-warm)] px-2 py-0.5 text-[0.65rem] font-semibold text-[var(--ink-soft)]">
              {product.brand}
            </span>
          </div>
          <h3 className="font-serif text-lg font-semibold leading-snug text-[var(--ink)]">{product.name}</h3>
          <div className="mt-auto flex items-end justify-between gap-2 pt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-[var(--ink)]">Rs. {displayPrice}</span>
              {hasDiscount && (
                <span className="text-xs text-[var(--text-muted)] line-through">Rs. {product.price}</span>
              )}
            </div>
            <span className="flex items-center gap-0.5 text-xs text-[var(--text-muted)]">
              <Star size={12} className="fill-[var(--brass)] text-[var(--brass)]" />
              {product.ratings?.toFixed(1)}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
