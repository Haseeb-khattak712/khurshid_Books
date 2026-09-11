import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Search,
  Sparkles,
  Check,
  X,
  FolderTree,
  ChevronDown,
  ChevronRight,
  Package,
  Eye,
  CornerDownRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Spinner from '../../components/Spinner.jsx';
import {
  fetchCategoriesWithProductCounts,
  createCategory,
  updateCategory,
  deleteCategory,
  seedDefaultCategories,
  buildCategoryTree,
  AVAILABLE_ICONS,
  getCategoryIcon
} from '../../services/categoryService.js';
import CategoryTreeSelect from '../../components/admin/CategoryTreeSelect.jsx';
import CategoryItemModal from '../../components/admin/CategoryItemModal.jsx';
import TemplateModal from '../../components/admin/TemplateModal.jsx';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'roots' | 'subcategories'
  const [expandedNodes, setExpandedNodes] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  
  // Modals for Items inspection & Blueprints
  const [inspectingCategory, setInspectingCategory] = useState(null);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    parent_id: null,
    description: '',
    icon_name: 'Folder',
    display_order: 0,
    is_active: true
  });

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await fetchCategoriesWithProductCounts(true);
      setCategories(data);
      
      // Expand all roots by default
      const initialExpanded = {};
      data.forEach(c => {
        if (!c.parent_id) {
          initialExpanded[c.id || c.slug] = true;
        }
      });
      setExpandedNodes(initialExpanded);
    } catch (err) {
      toast.error('Failed to load categories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const toggleExpand = (nodeId) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const openAddModal = (preselectedParentId = null) => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      parent_id: preselectedParentId,
      description: '',
      icon_name: 'Folder',
      display_order: categories.length + 1,
      is_active: true
    });
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      parent_id: cat.parent_id || null,
      description: cat.description || '',
      icon_name: cat.icon_name || 'Folder',
      display_order: cat.display_order ?? 0,
      is_active: cat.is_active ?? true
    });
    setModalOpen(true);
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    if (!editingCategory) {
      setFormData(prev => ({ ...prev, name: val, slug: generatedSlug }));
    } else {
      setFormData(prev => ({ ...prev, name: val }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setSubmitting(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
        toast.success(`Category "${formData.name}" updated!`);
      } else {
        await createCategory(formData);
        toast.success(`Category "${formData.name}" created!`);
      }
      setModalOpen(false);
      await loadCategories();
    } catch (err) {
      toast.error(err.message || 'Error saving category');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the category "${name}"? Subcategories will be unlinked.`)) {
      return;
    }

    try {
      await deleteCategory(id);
      toast.success(`Category "${name}" deleted`);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      toast.error(err.message || 'Failed to delete category');
      console.error(err);
    }
  };

  const handleToggleActive = async (cat) => {
    try {
      const nextStatus = !cat.is_active;
      await updateCategory(cat.id, { is_active: nextStatus });
      setCategories(prev =>
        prev.map(c => (c.id === cat.id ? { ...c, is_active: nextStatus } : c))
      );
      toast.success(`Category set to ${nextStatus ? 'active' : 'inactive'}`);
    } catch (err) {
      toast.error('Failed to update status');
      console.error(err);
    }
  };

  const handleSeedDefaults = async () => {
    if (!window.confirm('This will seed or restore the default hierarchical categories in Supabase. Proceed?')) {
      return;
    }

    setSeeding(true);
    try {
      await seedDefaultCategories();
      toast.success('Default category hierarchy synced to database!');
      await loadCategories();
    } catch (err) {
      toast.error(err.message || 'Failed to seed categories. Check Supabase connection.');
      console.error(err);
    } finally {
      setSeeding(false);
    }
  };

  // Build Hierarchical Category Tree
  const categoryTree = useMemo(() => {
    return buildCategoryTree(categories);
  }, [categories]);

  // Filter Categories
  const filteredTree = useMemo(() => {
    if (!search.trim() && filterType === 'all') return categoryTree;

    const q = search.toLowerCase();

    function matchOrChildrenMatch(node) {
      const selfMatch =
        node.name.toLowerCase().includes(q) ||
        node.slug.toLowerCase().includes(q) ||
        (node.description && node.description.toLowerCase().includes(q));

      if (filterType === 'roots' && node.depth > 0) return null;
      if (filterType === 'subcategories' && node.depth === 0 && (!node.children || node.children.length === 0)) return null;

      const matchingChildren = (node.children || [])
        .map(matchOrChildrenMatch)
        .filter(Boolean);

      if (selfMatch || matchingChildren.length > 0) {
        return {
          ...node,
          children: matchingChildren
        };
      }
      return null;
    }

    return categoryTree.map(matchOrChildrenMatch).filter(Boolean);
  }, [categoryTree, search, filterType]);

  const totalSubcategoryCount = useMemo(() => {
    return categories.filter(c => Boolean(c.parent_id)).length;
  }, [categories]);

  const totalRootCount = useMemo(() => {
    return categories.filter(c => !c.parent_id).length;
  }, [categories]);

  return (
    <main className="bg-[#FAF8F3] min-h-screen pb-16 text-[#2C2C2C]">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        
        {/* Navigation & Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 transition"
              title="Back to Admin Dashboard"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="label-tag">Admin Panel</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--brass)]/10 text-[var(--brass)]">
                  {totalRootCount} Roots &bull; {totalSubcategoryCount} Subcategories
                </span>
              </div>
              <h1 className="mt-1 font-serif text-3xl font-semibold text-[#1A2744]">
                Manage Categories & Hierarchy
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Blueprints & Templates Trigger */}
            <button
              onClick={() => setTemplateModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-amber-300 bg-amber-50/90 px-4 py-2.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition shadow-xs"
              title="Scaffold categories using complete bookshop templates"
            >
              <Sparkles size={14} className="text-amber-600" />
              <span>Blueprints & Templates</span>
            </button>

            {/* Seed Defaults */}
            <button
              onClick={handleSeedDefaults}
              disabled={seeding}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs disabled:opacity-50"
              title="Restore standard 11 categories with subcategories"
            >
              <FolderTree size={14} className={seeding ? 'animate-spin' : ''} />
              {seeding ? 'Syncing...' : 'Seed Defaults'}
            </button>

            {/* Add Category */}
            <button
              onClick={() => openAddModal()}
              className="btn-primary inline-flex items-center gap-2 py-2.5 px-5 text-sm shadow-xs"
            >
              <Plus size={16} /> Add Category
            </button>
          </div>
        </div>

        {/* Search Bar & Hierarchy Filter Tabs */}
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              type="text"
              placeholder="Search category by name, slug, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 pl-11 pr-4 text-sm focus:border-[var(--brass)] focus:bg-white focus:outline-none transition"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1 text-xs">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`rounded-xl px-3 py-1.5 font-medium transition ${
                filterType === 'all'
                  ? 'bg-white text-[#1A2744] shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All ({categories.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('roots')}
              className={`rounded-xl px-3 py-1.5 font-medium transition ${
                filterType === 'roots'
                  ? 'bg-white text-[#1A2744] shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Parent Roots ({totalRootCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('subcategories')}
              className={`rounded-xl px-3 py-1.5 font-medium transition ${
                filterType === 'subcategories'
                  ? 'bg-white text-[#1A2744] shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Subcategories ({totalSubcategoryCount})
            </button>
          </div>
        </div>

        {/* Category List & Hierarchical Tree Table */}
        {loading ? (
          <div className="py-20 flex justify-center"><Spinner /></div>
        ) : filteredTree.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <FolderTree size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="font-serif text-lg font-semibold text-[var(--ink)]">No categories found</h3>
            <p className="mt-1 text-sm text-[var(--text-muted)] max-w-md mx-auto">
              {search
                ? 'Try adjusting your search query.'
                : 'Click "Add Category" or "Blueprints & Templates" to scaffold your catalog structure.'}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/75 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <tr>
                    <th className="px-5 py-4 w-12 text-center">#</th>
                    <th className="px-5 py-4">Category / Hierarchy</th>
                    <th className="px-5 py-4">Slug</th>
                    <th className="px-5 py-4 text-center">Items & Depth</th>
                    <th className="px-5 py-4 text-center">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTree.map((rootNode) => (
                    <CategoryRowItem
                      key={rootNode.id || rootNode.slug}
                      category={rootNode}
                      expandedNodes={expandedNodes}
                      toggleExpand={toggleExpand}
                      openEditModal={openEditModal}
                      openAddModal={openAddModal}
                      handleDelete={handleDelete}
                      handleToggleActive={handleToggleActive}
                      onInspectCategory={setInspectingCategory}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal for Add / Edit Category */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-fade-in">
            <div className="relative w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-[#1A2744]">
                    {editingCategory ? 'Edit Category' : 'Create New Category'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {editingCategory ? 'Update category details and hierarchy position' : 'Add a root category or link it as a subcategory'}
                  </p>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 transition"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Category Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="e.g. Oxford University Press"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[var(--brass)] focus:outline-none"
                  />
                </div>

                {/* Self-Relation: Parent Category Selector */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Parent Category (Hierarchy Self-Relation)
                  </label>
                  <CategoryTreeSelect
                    value={formData.parent_id}
                    onChange={(parentId) => setFormData(prev => ({ ...prev, parent_id: parentId }))}
                    categories={categories}
                    excludeId={editingCategory?.id}
                    placeholder="None (Make this a Top-Level Root Category)"
                    allowClear={true}
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Leave blank for a main department, or choose a parent to make this a nested subcategory.
                  </span>
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. oxford-books"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-mono focus:border-[var(--brass)] focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-400">Used in URLs: /shop?category=...</span>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of what products belong in this category..."
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-[var(--brass)] focus:outline-none resize-none"
                  />
                </div>

                {/* Display Order & Active */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[var(--brass)] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                      Visibility
                    </label>
                    <label className="flex items-center gap-2 mt-2.5 cursor-pointer text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="h-4 w-4 rounded border-slate-300 text-[var(--brass)] focus:ring-[var(--brass)]"
                      />
                      Active on storefront
                    </label>
                  </div>
                </div>

                {/* Icon Selector */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                    Choose Icon
                  </label>
                  <div className="grid grid-cols-6 gap-2 rounded-2xl border border-slate-200 bg-slate-50/50 p-3 max-h-36 overflow-y-auto">
                    {AVAILABLE_ICONS.map((iconKey) => {
                      const IconComp = getCategoryIcon(iconKey);
                      const isSelected = formData.icon_name === iconKey;
                      return (
                        <button
                          key={iconKey}
                          type="button"
                          onClick={() => setFormData({ ...formData, icon_name: iconKey })}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl transition ${
                            isSelected
                              ? 'bg-[var(--brass)] text-white shadow-xs'
                              : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200/60'
                          }`}
                          title={iconKey}
                        >
                          <IconComp size={18} />
                          <span className="text-[9px] truncate w-full text-center mt-1">
                            {iconKey}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="btn-secondary py-2.5 px-5 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary py-2.5 px-6 text-sm disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal for Category Items Inspection */}
        {inspectingCategory && (
          <CategoryItemModal
            category={inspectingCategory}
            allCategories={categories}
            onClose={() => setInspectingCategory(null)}
          />
        )}

        {/* Modal for Scaffolding Blueprints / Templates */}
        <TemplateModal
          isOpen={templateModalOpen}
          onClose={() => setTemplateModalOpen(false)}
          initialTab="category"
          onCategoryTemplateApplied={() => loadCategories()}
        />

      </div>
    </main>
  );
};

// ==============================================================================
// RECURSIVE CATEGORY ROW COMPONENT
// ==============================================================================

function CategoryIcon({ iconName, size = 16, className = '' }) {
  const IconComp = getCategoryIcon(iconName);
  return <IconComp size={size} className={className} />;
}

function CategoryRowItem({
  category,
  expandedNodes,
  toggleExpand,
  openEditModal,
  openAddModal,
  handleDelete,
  handleToggleActive,
  onInspectCategory,
  depth = 0
}) {
  const hasChildren = category.children && category.children.length > 0;
  const isExpanded = expandedNodes[category.id || category.slug] ?? false;
  const indentPadding = depth * 28;

  return (
    <>
      <tr className={`hover:bg-slate-50/70 transition group ${depth > 0 ? 'bg-amber-50/15' : ''}`}>
        {/* Expand Toggle or Tree Branch Icon */}
        <td className="px-4 py-3.5 text-center">
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggleExpand(category.id || category.slug)}
              className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition"
              title={isExpanded ? 'Collapse subcategories' : 'Expand subcategories'}
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : depth > 0 ? (
            <CornerDownRight size={14} className="text-slate-300 mx-auto" />
          ) : (
            <span className="text-slate-300 text-xs font-mono">-</span>
          )}
        </td>

        {/* Category Name with Hierarchy Indentation */}
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-3" style={{ paddingLeft: `${indentPadding}px` }}>
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
              depth === 0
                ? 'bg-[var(--brass)]/10 text-[var(--brass)]'
                : 'bg-amber-100/60 text-amber-800'
            }`}>
              <CategoryIcon iconName={category.icon_name} size={17} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-[#1A2744] text-sm truncate">
                  {category.name}
                </p>
                {depth > 0 ? (
                  <span className="rounded-md bg-amber-50 px-1.5 py-0.2 text-[10px] font-semibold text-amber-800 border border-amber-200/60">
                    Subcategory
                  </span>
                ) : (
                  hasChildren && (
                    <span className="rounded-md bg-slate-100 px-1.5 py-0.2 text-[10px] font-semibold text-slate-600">
                      {category.children.length} sub-branches
                    </span>
                  )
                )}
              </div>
              {category.description && (
                <p className="text-xs text-slate-400 truncate max-w-sm">
                  {category.description}
                </p>
              )}
            </div>
          </div>
        </td>

        {/* Slug */}
        <td className="px-5 py-3.5 font-mono text-xs text-slate-500">
          <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-slate-600">
            /{category.slug}
          </span>
        </td>

        {/* Item Counts & View Items Button */}
        <td className="px-5 py-3.5 text-center">
          <button
            type="button"
            onClick={() => onInspectCategory(category)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-[var(--brass)] hover:text-[var(--brass)] hover:bg-amber-50/40 transition shadow-2xs"
            title="Inspect all items in this category"
          >
            <Package size={13} className="text-[var(--brass)]" />
            <span>{category.product_count ?? 0} Products</span>
            <Eye size={12} className="text-slate-400 ml-0.5" />
          </button>
        </td>

        {/* Active Toggle */}
        <td className="px-5 py-3.5 text-center">
          <button
            onClick={() => handleToggleActive(category)}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition ${
              category.is_active
                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {category.is_active ? <Check size={11} /> : <X size={11} />}
            {category.is_active ? 'Active' : 'Hidden'}
          </button>
        </td>

        {/* Row Actions */}
        <td className="px-5 py-3.5 text-right">
          <div className="flex items-center justify-end gap-1">
            {/* Quick Add Subcategory */}
            <button
              onClick={() => openAddModal(category.id)}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-800 transition"
              title={`Add subcategory inside "${category.name}"`}
            >
              <Plus size={15} />
            </button>
            <button
              onClick={() => openEditModal(category)}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#1A2744] transition"
              title="Edit Category"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => handleDelete(category.id, category.name)}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
              title="Delete Category"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </td>
      </tr>

      {/* Render children recursively if expanded */}
      {hasChildren && isExpanded && category.children.map((child) => (
        <CategoryRowItem
          key={child.id || child.slug}
          category={child}
          expandedNodes={expandedNodes}
          toggleExpand={toggleExpand}
          openEditModal={openEditModal}
          openAddModal={openAddModal}
          handleDelete={handleDelete}
          handleToggleActive={handleToggleActive}
          onInspectCategory={onInspectCategory}
          depth={depth + 1}
        />
      ))}
    </>
  );
}

export default ManageCategories;
