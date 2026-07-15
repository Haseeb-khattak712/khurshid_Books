import { useEffect } from 'react';

const useScrollReveal = (deps = []) => {
  useEffect(() => {
    window.scrollTo(0, 0);

    document.querySelectorAll('[data-reveal]').forEach((element) => {
      element.classList.remove('reveal-visible');
    });

    const elements = Array.from(document.querySelectorAll('[data-reveal]'));
    if (!elements.length) return undefined;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('reveal-visible');
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.15 }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, deps);
};

export default useScrollReveal;
