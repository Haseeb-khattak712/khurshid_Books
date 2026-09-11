import { useState } from 'react';
import {
  X,
  Sparkles,
  FolderTree,
  Package,
  Check,
  ChevronRight,
  Plus,
  Trash2,
  BookOpen,
  School,
  BookMarked,
  PenLine,
  Palette,
  Calculator,
  ArrowRight
} from 'lucide-react';
import {
  CATEGORY_TREE_BLUEPRINTS,
  ITEM_CREATION_BLUEPRINTS,
  getCustomItemTemplates,
  deleteCustomItemTemplate
} from '../../services/templateService.js';
import { applyCategoryBlueprint, getCategoryIcon } from '../../services/categoryService.js';
import { toast } from 'react-hot-toast';

/**
 * TemplateModal: Universal blueprint selector for scaffolding Category Trees
 * and prefilling Item/Product creation forms.
 */
export default function TemplateModal({
  isOpen,
  onClose,
  initialTab = 'category', // 'category' | 'item'
  onSelectProductTemplate = null,
  onCategoryTemplateApplied = null
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedCategoryBp, setSelectedCategoryBp] = useState(CATEGORY_TREE_BLUEPRINTS[0]);
  const [selectedProductBp, setSelectedProductBp] = useState(ITEM_CREATION_BLUEPRINTS[0]);
  const [customTemplates, setCustomTemplates] = useState(getCustomItemTemplates());
  const [applyingCategory, setApplyingCategory] = useState(false);

  if (!isOpen) return null;

  const handleApplyCategoryTree = async () => {
    if (!selectedCategoryBp) return;
    setApplyingCategory(true);
    const toastId = toast.loading(`Scaffolding "${selectedCategoryBp.name}"...`);

    try {
      await applyCategoryBlueprint(selectedCategoryBp);
      toast.success(`Category tree "${selectedCategoryBp.name}" created!`, { id: toastId });
      if (onCategoryTemplateApplied) {
        await onCategoryTemplateApplied(selectedCategoryBp);
      }
      onClose();
    } catch (err) {
      console.error('Error applying category template:', err);
      toast.error(err.message || 'Failed to apply category blueprint', { id: toastId });
    } finally {
      setApplyingCategory(false);
    }
  };

  const handleSelectProductPreset = (presetObj) => {
    if (onSelectProductTemplate) {
      onSelectProductTemplate(presetObj);
      toast.success(`Applied product template: ${presetObj.name || presetObj.title}`);
    }
    onClose();
  };

  const handleDeleteCustom = (templateId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this custom saved template?')) return;
    deleteCustomItemTemplate(templateId);
    setCustomTemplates(getCustomItemTemplates());
    toast.success('Custom template removed');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-fade-in">
      <div className="relative w-full max-w-4xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="font-serif text-lg font-semibold text-[#1A2744]">
                Templates & Blueprints
              </h2>
              <p className="text-xs text-slate-500">
                1-click presets for scaffolding category trees and adding structured items
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-200 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 px-6 pt-2 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('category')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold uppercase tracking-wider transition border-b-2 ${
              activeTab === 'category'
                ? 'border-[var(--brass)] text-[var(--brass)]'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <FolderTree size={16} /> Category Tree Blueprints ({CATEGORY_TREE_BLUEPRINTS.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('item')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold uppercase tracking-wider transition border-b-2 ${
              activeTab === 'item'
                ? 'border-[var(--brass)] text-[var(--brass)]'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Package size={16} /> Item Creation Blueprints ({ITEM_CREATION_BLUEPRINTS.length + customTemplates.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: CATEGORY TREE BLUEPRINTS */}
          {activeTab === 'category' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Blueprint Selector Cards */}
              <div className="md:col-span-5 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Select Hierarchy Blueprint
                </p>
                {CATEGORY_TREE_BLUEPRINTS.map((bp) => {
                  const IconComp = getCategoryIcon(bp.icon_name);
                  const isSelected = selectedCategoryBp?.id === bp.id;

                  return (
                    <div
                      key={bp.id}
                      onClick={() => setSelectedCategoryBp(bp)}
                      className={`cursor-pointer rounded-2xl border p-4 transition ${
                        isSelected
                          ? 'border-[var(--brass)] bg-amber-50/40 ring-2 ring-[var(--brass)]/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--brass)]/10 text-[var(--brass)]">
                            <IconComp size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#1A2744]">
                              {bp.name}
                            </p>
                            <span className="text-[10px] text-slate-400">
                              {bp.subcategories.length} Subcategories
                            </span>
                          </div>
                        </div>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-600">
                          {bp.badge}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-slate-500 line-clamp-2">
                        {bp.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Blueprint Preview & Tree Visualizer */}
              <div className="md:col-span-7 flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <h3 className="font-serif text-base font-semibold text-[#1A2744]">
                        Tree Blueprint Preview
                      </h3>
                      <p className="text-xs text-slate-500">
                        This will automatically generate the parent category and all nested subcategories.
                      </p>
                    </div>
                    <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                      Auto-linking enabled
                    </span>
                  </div>

                  {/* Visual Category Tree Node */}
                  <div className="mt-4 space-y-2">
                    {/* Root Category Node */}
                    <div className="flex items-center gap-3 rounded-xl border border-[var(--brass)]/40 bg-white p-3 shadow-xs">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brass)] text-white">
                        <FolderTree size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#1A2744]">
                            {selectedCategoryBp.root.name}
                          </span>
                          <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold uppercase text-amber-800">
                            Root / Parent
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Slug: /{selectedCategoryBp.root.slug}
                        </p>
                      </div>
                    </div>

                    {/* Subcategories Branch List */}
                    <div className="pl-6 space-y-2 border-l-2 border-dashed border-amber-300 ml-4 py-1">
                      {selectedCategoryBp.subcategories.map((sub, idx) => (
                        <div
                          key={sub.slug}
                          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono text-[10px] text-slate-400">
                              #{idx + 1}
                            </span>
                            <span className="font-medium text-slate-700 truncate">
                              {sub.name}
                            </span>
                          </div>
                          <span className="font-mono text-[10px] text-slate-400">
                            /{sub.slug}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Apply Button */}
                <div className="pt-4 border-t border-slate-200 mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-secondary py-2 px-4 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyCategoryTree}
                    disabled={applyingCategory}
                    className="btn-primary py-2.5 px-6 text-xs flex items-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    <Sparkles size={14} className={applyingCategory ? 'animate-spin' : ''} />
                    {applyingCategory ? 'Scaffolding Tree...' : `Scaffold "${selectedCategoryBp.name}"`}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ITEM CREATION BLUEPRINTS */}
          {activeTab === 'item' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Product Blueprint List */}
              <div className="md:col-span-5 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Standard Store Blueprints
                </p>
                {ITEM_CREATION_BLUEPRINTS.map((bp) => {
                  const isSelected = selectedProductBp?.id === bp.id;

                  return (
                    <div
                      key={bp.id}
                      onClick={() => setSelectedProductBp(bp)}
                      className={`cursor-pointer rounded-2xl border p-3.5 transition ${
                        isSelected
                          ? 'border-[var(--brass)] bg-amber-50/40 ring-2 ring-[var(--brass)]/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-[#1A2744]">
                          {bp.title}
                        </p>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-600">
                          {bp.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {bp.category} &rsaquo; {bp.subcategory}
                      </p>
                    </div>
                  );
                })}

                {/* Custom User Templates Section */}
                {customTemplates.length > 0 && (
                  <>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-4 mb-2">
                      Your Custom Saved Blueprints
                    </p>
                    {customTemplates.map((custom) => {
                      const isSelected = selectedProductBp?.id === custom.id;
                      return (
                        <div
                          key={custom.id}
                          onClick={() => setSelectedProductBp(custom)}
                          className={`cursor-pointer rounded-2xl border p-3.5 transition ${
                            isSelected
                              ? 'border-[var(--brass)] bg-amber-50/40 ring-2 ring-[var(--brass)]/20 shadow-xs'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-[#1A2744] truncate">
                              {custom.title || custom.preset?.name}
                            </p>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteCustom(custom.id, e)}
                              className="text-slate-300 hover:text-rose-500 p-1"
                              title="Delete template"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Custom Preset
                          </p>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>

              {/* Right Column: Blueprint Preview & Form Attributes */}
              <div className="md:col-span-7 flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
                <div>
                  <div className="pb-3 border-b border-slate-200 flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-base font-semibold text-[#1A2744]">
                        {selectedProductBp?.title || selectedProductBp?.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Pre-fills title pattern, categories, specs table, brand & suggested pricing.
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                      {selectedProductBp?.preset?.category}
                    </span>
                  </div>

                  {/* Preset Values Display */}
                  <div className="mt-4 space-y-3 text-xs">
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Default Product Name
                      </span>
                      <p className="font-semibold text-[#1A2744] mt-0.5">
                        {selectedProductBp?.preset?.name}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-slate-200 bg-white p-2.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Suggested Price
                        </span>
                        <p className="font-semibold text-slate-800 mt-0.5">
                          Rs. {selectedProductBp?.preset?.price}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-2.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Initial Stock
                        </span>
                        <p className="font-semibold text-slate-800 mt-0.5">
                          {selectedProductBp?.preset?.stock} units
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Structured Description Blueprint
                      </span>
                      <pre className="mt-1 text-[11px] font-sans text-slate-600 bg-slate-50 p-2.5 rounded-lg max-h-36 overflow-y-auto whitespace-pre-wrap border border-slate-100">
                        {selectedProductBp?.preset?.description}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Apply Preset Button */}
                <div className="pt-4 border-t border-slate-200 mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-secondary py-2 px-4 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectProductPreset(selectedProductBp.preset || selectedProductBp)}
                    className="btn-primary py-2.5 px-6 text-xs flex items-center gap-2 shadow-sm"
                  >
                    <Check size={14} /> Apply to Product Form
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
