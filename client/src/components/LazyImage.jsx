import { useEffect, useRef, useState } from 'react';

let lazyObserver = null;
const elementCallbacks = new Map();

const getLazyObserver = () => {
  if (lazyObserver) return lazyObserver;
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return null;

  lazyObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const callback = elementCallbacks.get(entry.target);
      if (callback) callback();
      elementCallbacks.delete(entry.target);
      lazyObserver.unobserve(entry.target);
    });
  }, { rootMargin: '200px 0px', threshold: 0.01 });

  return lazyObserver;
};

const LazyImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  srcSet,
  sizes,
  priority = false,
  placeholderSrc,
  style,
  ...props
}) => {
  const imgRef = useRef(null);
  const [isVisible, setIsVisible] = useState(priority);
  const [loaded, setLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(
    priority || !placeholderSrc ? src : placeholderSrc
  );
  const [hasError, setHasError] = useState(false);
  const [isBroken, setIsBroken] = useState(false);

  useEffect(() => {
    if (priority || !imgRef.current || typeof window === 'undefined') {
      if (!priority) setCurrentSrc(src);
      return undefined;
    }

    const observer = getLazyObserver();
    if (!observer) {
      setCurrentSrc(src);
      return undefined;
    }

    const element = imgRef.current;
    elementCallbacks.set(element, () => setIsVisible(true));
    observer.observe(element);

    return () => {
      elementCallbacks.delete(element);
      if (observer) observer.unobserve(element);
    };
  }, [priority, src, placeholderSrc]);

  useEffect(() => {
    if (isVisible && !hasError) {
      setCurrentSrc(src);
    }
  }, [isVisible, src, hasError]);

  const fallbackSrc = placeholderSrc || '/roots.png';

  if (isBroken) {
    const fallbackLabel = alt ? alt.charAt(0).toUpperCase() : '?';

    return (
      <div
        ref={imgRef}
        role="img"
        aria-label={alt || 'Image unavailable'}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FAF8F3',
          color: '#1A2744',
          width,
          height,
          fontSize: '1rem',
          fontWeight: 700,
          ...style,
        }}
        {...props}
      >
        {fallbackLabel}
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={hasError ? fallbackSrc : currentSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      srcSet={srcSet}
      sizes={sizes}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      style={{
        opacity: loaded ? 1 : 0.75,
        transition: 'opacity 160ms ease-in-out',
        willChange: 'opacity, transform',
        ...style,
      }}
      onLoad={() => setLoaded(true)}
      onError={() => {
        if (hasError) {
          setIsBroken(true);
        } else {
          setHasError(true);
        }
      }}
      {...props}
    />
  );
};

export default LazyImage;
