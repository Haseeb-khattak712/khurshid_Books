import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Flame,
  ArrowRight,
  BookOpen,
  FolderTree
} from 'lucide-react';
import {
  fetchCategories,
  DEFAULT_CATEGORIES,
  buildCategoryTree,
  getCategoryIcon
} from '../services/categoryService.js';

const CategoryNav = () => {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredRootId, setHoveredRootId] = useState(null);
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

  // Close dropdown when route changes
  useEffect(() => {
    setIsDropdownOpen(false);
  }, [location.pathname, location.search]);

  // Build category hierarchy
  const categoryTree = useMemo(() => {
    return buildCategoryTree(categories);
  }, [categories]);

  // Active hovered category for multi-tier flyout
  const activeHoveredNode = useMemo(() => {
    if (!categoryTree.length) return null;
    if (hoveredRootId) {
      return categoryTree.find(c => (c.id || c.slug) === hoveredRootId) || categoryTree[0];
    }
    return categoryTree[0];
  }, [categoryTree, hoveredRootId]);

  // Horizontal quick links (first 7 root categories)
  const quickLinks = categoryTree.slice(0, 7);

  return (
    <div className="border-t border-b border-[var(--line)] bg-white/90 backdrop-blur-md hidden lg:block select-none relative z-40">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
        
        {/* Left: "Shop by Category" Mega Button */}
        <div ref={dropdownRef} className="relative py-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setIsDropdownOpen((prev) => !prev);
              if (!hoveredRootId && categoryTree.length > 0) {
                setHoveredRootId(categoryTree[0].id || categoryTree[0].slug);
              }
            }}
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

          {/* Multi-Tier Mega Flyout Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute left-0 top-[calc(100%+4px)] z-50 flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-fade-in divide-x divide-slate-100">
              
              {/* Primary Departments Column (Roots) */}
              <div className="w-72 bg-white flex flex-col">
                <div className="bg-slate-50/90 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between border-b border-slate-100">
                  <span>Departments</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {categoryTree.length} categories
                  </span>
                </div>

                <div className="max-h-[440px] overflow-y-auto py-1.5 divide-y divide-slate-50">
                  {categoryTree.map((cat) => {
                    const IconComponent = getCategoryIcon(cat.icon_name);
                    const isSelected = activeHoveredNode && (activeHoveredNode.id || activeHoveredNode.slug) === (cat.id || cat.slug);
                    const hasChildren = cat.children && cat.children.length > 0;

                    return (
                      <div
                        key={cat.id || cat.slug}
                        onMouseEnter={() => setHoveredRootId(cat.id || cat.slug)}
                        className={`group flex items-center justify-between px-4 py-2.5 transition cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50/75 text-[var(--brass)] font-semibold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <Link
                          to={`/shop?category=${encodeURIComponent(cat.name)}`}
                          className="flex items-center gap-3 min-w-0 flex-1"
                        >
                          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition ${
                            isSelected
                              ? 'bg-[var(--brass)] text-white'
                              : 'bg-slate-100 text-slate-600 group-hover:bg-[var(--brass)] group-hover:text-white'
                          }`}>
                            <IconComponent size={14} />
                          </div>
                          <span className="truncate text-xs">
                            {cat.name}
                          </span>
                        </Link>

                        {hasChildren ? (
                          <ChevronRight
                            size={14}
                            className={`shrink-0 text-slate-300 transition ${
                              isSelected ? 'text-[var(--brass)] translate-x-0.5' : 'group-hover:text-slate-500'
                            }`}
                          />
                        ) : (
                          <ArrowRight
                            size={12}
                            className="shrink-0 text-slate-300 opacity-0 group-hover:opacity-100 transition"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Bottom footer link */}
                <div className="bg-slate-50/70 p-2.5 border-t border-slate-100 mt-auto">
                  <Link
                    to="/shop"
                    className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[var(--brass)] hover:underline"
                  >
                    <Sparkles size={13} />
                    <span>Explore Full Catalog</span>
                  </Link>
                </div>
              </div>

              {/* Subcategories Flyout Panel */}
              <div className="w-80 bg-slate-50/50 p-4 flex flex-col justify-between min-h-[380px] max-h-[500px]">
                {activeHoveredNode && activeHoveredNode.children && activeHoveredNode.children.length > 0 ? (
                  <>
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Subcategories
                          </span>
                          <h4 className="font-serif text-sm font-semibold text-[#1A2744]">
                            {activeHoveredNode.name}
                          </h4>
                        </div>
                        <Link
                          to={`/shop?category=${encodeURIComponent(activeHoveredNode.name)}`}
                          className="text-xs font-semibold text-[var(--brass)] hover:underline flex items-center gap-1"
                        >
                          <span>View All</span>
                          <ArrowRight size={12} />
                        </Link>
                      </div>

                      <div className="mt-3 space-y-1 max-h-[360px] overflow-y-auto pr-1">
                        {activeHoveredNode.children.map((sub) => {
                          const SubIcon = getCategoryIcon(sub.icon_name);
                          return (
                            <Link
                              key={sub.id || sub.slug}
                              to={`/shop?category=${encodeURIComponent(sub.name)}`}
                              className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-white hover:text-[var(--brass)] hover:shadow-2xs transition"
                            >
                              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white border border-slate-200 text-slate-500">
                                <SubIcon size={12} />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-medium">{sub.name}</p>
                                {sub.description && (
                                  <p className="truncate text-[10px] text-slate-400">
                                    {sub.description}
                                  </p>
                                )}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 text-center mt-auto">
                      <span className="text-[11px] text-slate-400">
                        {activeHoveredNode.children.length} subcategories available
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                        {activeHoveredNode && (
                          <>
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--brass)]/10 text-[var(--brass)]">
                              {(() => {
                                const IconComp = getCategoryIcon(activeHoveredNode.icon_name);
                                return <IconComp size={18} />;
                              })()}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-serif text-sm font-semibold text-[#1A2744] truncate">
                                {activeHoveredNode?.name}
                              </h4>
                              <p className="text-[11px] text-slate-400 truncate">
                                Main Department
                              </p>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="mt-6 text-center p-6 rounded-2xl border border-dashed border-slate-200 bg-white">
                        <p className="text-xs text-slate-600 font-medium">
                          Browse all products in this department
                        </p>
                        {activeHoveredNode && (
                          <Link
                            to={`/shop?category=${encodeURIComponent(activeHoveredNode.name)}`}
                            className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl bg-[var(--ink)] px-4 py-2 text-xs font-bold text-white hover:bg-[var(--brass)] transition shadow-xs"
                          >
                            <span>Explore {activeHoveredNode.name}</span>
                            <ArrowRight size={13} />
                          </Link>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 text-center mt-auto">
                      <span className="text-[11px] text-slate-400">
                        Direct Department Collection
                      </span>
                    </div>
                  </>
                )}
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
