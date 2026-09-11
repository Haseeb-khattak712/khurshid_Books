import { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDown, Search, X, Check, Folder, CornerDownRight } from 'lucide-react';
import {
  buildCategoryTree,
  flattenCategoryTree,
  isDescendantOf,
  getCategoryIcon
} from '../../services/categoryService.js';

/**
 * CategoryTreeSelect: Hierarchical dropdown component for selecting categories & subcategories.
 * Automatically displays nested depth, handles search filtering, and prevents circular parent selection.
 */
export default function CategoryTreeSelect({
  value,
  onChange,
  categories = [],
  excludeId = null,
  placeholder = 'Select a category...',
  allowClear = true,
  disabled = false,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  // Build tree & flat options with depth and circular dependency exclusion
  const flattenedOptions = useMemo(() => {
    // Exclude self and all descendants if editing a category
    const validCategories = excludeId
      ? categories.filter(c => c.id !== excludeId && !isDescendantOf(c.id, excludeId, categories))
      : categories;

    const tree = buildCategoryTree(validCategories);
    return flattenCategoryTree(tree);
  }, [categories, excludeId]);

  // Find selected category object
  const selectedCategory = useMemo(() => {
    if (!value) return null;
    return categories.find(c => c.id === value || c.name === value || c.slug === value) || null;
  }, [value, categories]);

  // Filtered options based on search query
  const filteredOptions = useMemo(() => {
    if (!search.trim()) return flattenedOptions;
    const q = search.toLowerCase();
    return flattenedOptions.filter(
      opt => opt.name.toLowerCase().includes(q) ||
             opt.fullPath.toLowerCase().includes(q) ||
             (opt.slug && opt.slug.toLowerCase().includes(q))
    );
  }, [flattenedOptions, search]);

  const handleSelect = (category) => {
    onChange(category.id, category);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null, null);
  };

  const SelectedIcon = selectedCategory ? getCategoryIcon(selectedCategory.icon_name) : Folder;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(prev => !prev)}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2 min-h-[42px] rounded-xl border text-sm transition text-left ${
          disabled
            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
            : isOpen
            ? 'border-[var(--brass)] bg-white ring-2 ring-[var(--brass)]/20 shadow-xs'
            : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 truncate">
          {selectedCategory ? (
            <>
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[var(--brass)]/10 text-[var(--brass)]">
                <SelectedIcon size={14} />
              </div>
              <div className="truncate">
                <span className="font-medium text-slate-800">{selectedCategory.name}</span>
                {selectedCategory.parent_id && (
                  <span className="ml-2 text-xs text-slate-400 truncate">
                    (Subcategory)
                  </span>
                )}
              </div>
            </>
          ) : (
            <span className="text-slate-600 font-medium italic flex items-center gap-1.5">
              <Folder size={14} className="text-slate-400 shrink-0" />
              <span className="truncate">{placeholder || 'None (Top-Level Root Category)'}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          {allowClear && selectedCategory && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              className="p-1 rounded-full hover:bg-slate-100 hover:text-slate-600 transition"
              title="Clear selection"
            >
              <X size={14} />
            </span>
          )}
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-[var(--brass)]' : ''}`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl animate-fade-in divide-y divide-slate-100">
          {/* Search Input */}
          <div className="p-2.5 bg-slate-50/80">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs focus:border-[var(--brass)] focus:outline-none"
              />
            </div>
          </div>

          {/* Category List */}
          <div className="max-h-60 overflow-y-auto py-1">
            {allowClear && (
              <button
                type="button"
                onClick={() => handleSelect({ id: null, name: '' })}
                className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-slate-600 hover:bg-slate-50 transition text-left"
              >
                <div className="flex items-center gap-2">
                  <Folder size={13} className="text-slate-400" />
                  <span className="italic font-medium">None (Top-Level Root Category)</span>
                </div>
                {!value && <Check size={14} className="text-[var(--brass)]" />}
              </button>
            )}

            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No matching categories found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const IconComponent = getCategoryIcon(opt.icon_name);
                const isSelected = selectedCategory && (selectedCategory.id === opt.id || selectedCategory.name === opt.name);
                const indentPadding = opt.depth * 20;

                return (
                  <button
                    key={opt.id || opt.slug}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    style={{ paddingLeft: `${14 + indentPadding}px` }}
                    className={`w-full flex items-center justify-between pr-3.5 py-2 text-xs transition text-left group ${
                      isSelected
                        ? 'bg-[var(--brass)]/10 text-[var(--brass)] font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 truncate">
                      {opt.depth > 0 && (
                        <CornerDownRight size={12} className="text-slate-300 shrink-0" />
                      )}
                      <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${
                        isSelected ? 'bg-[var(--brass)] text-white' : 'bg-slate-100 text-slate-500 group-hover:text-[var(--brass)]'
                      }`}>
                        <IconComponent size={12} />
                      </div>
                      <span className="truncate">{opt.name}</span>
                      {opt.depth === 0 && opt.hasChildren && (
                        <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-500">
                          Parent
                        </span>
                      )}
                    </div>

                    {isSelected && (
                      <Check size={14} className="shrink-0 text-[var(--brass)] ml-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
