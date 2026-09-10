import { useEffect, useState } from 'react';
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
  RefreshCw,
  FolderTree
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Spinner from '../../components/Spinner.jsx';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  seedDefaultCategories,
  AVAILABLE_ICONS,
  getCategoryIcon
} from '../../services/categoryService.js';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon_name: 'Folder',
    display_order: 0,
    is_active: true
  });

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await fetchCategories(true); // true = include inactive
      setCategories(data);
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

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
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
    
    // Auto-update slug if we're adding a new category or if the slug previously matched the slugified name
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
    if (!window.confirm(`Are you sure you want to delete the category "${name}"?`)) {
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
    if (!window.confirm('This will seed or restore the default 11 Scribble-inspired categories in Supabase. Proceed?')) {
      return;
    }

    setSeeding(true);
    try {
      await seedDefaultCategories();
      toast.success('Default categories successfully synced to database!');
      await loadCategories();
    } catch (err) {
      toast.error(err.message || 'Failed to seed categories. Check Supabase connection.');
      console.error(err);
    } finally {
      setSeeding(false);
    }
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

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
                  {categories.length} Categories
                </span>
              </div>
              <h1 className="mt-1 font-serif text-3xl font-semibold text-[#1A2744]">
                Manage Categories
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSeedDefaults}
              disabled={seeding}
              className="inline-flex items-center gap-2 rounded-2xl border border-amber-300 bg-amber-50/80 px-4 py-2.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition shadow-sm disabled:opacity-50"
              title="Seed or restore the 11 core categories adapted from Scribble"
            >
              <Sparkles size={14} className={seeding ? 'animate-spin' : ''} />
              {seeding ? 'Seeding...' : 'Seed Scribble Defaults'}
            </button>

            <button
              onClick={openAddModal}
              className="btn-primary inline-flex items-center gap-2 py-2.5 px-5 text-sm"
            >
              <Plus size={16} /> Add Category
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search category by name, slug, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 pl-11 pr-4 text-sm focus:border-[var(--brass)] focus:bg-white focus:outline-none transition"
            />
          </div>
        </div>

        {/* Category List */}
        {loading ? (
          <div className="py-20 flex justify-center"><Spinner /></div>
        ) : filteredCategories.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <FolderTree size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="font-serif text-lg font-semibold text-[var(--ink)]">No categories found</h3>
            <p className="mt-1 text-sm text-[var(--text-muted)] max-w-md mx-auto">
              {search ? 'Try adjusting your search query.' : 'Click "Add Category" or "Seed Scribble Defaults" to populate your product categories.'}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/75 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <tr>
                    <th className="px-5 py-4 w-16 text-center">Order</th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">Slug</th>
                    <th className="px-5 py-4">Description</th>
                    <th className="px-5 py-4 text-center">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCategories.map((cat) => {
                    const IconComponent = getCategoryIcon(cat.icon_name);
                    return (
                      <tr key={cat.id || cat.slug} className="hover:bg-slate-50/60 transition group">
                        <td className="px-5 py-4 text-center font-mono text-xs text-slate-400">
                          {cat.display_order ?? '-'}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--brass)]/10 text-[var(--brass)]">
                              <IconComponent size={18} />
                            </div>
                            <div>
                              <p className="font-medium text-[#1A2744] text-sm">
                                {cat.name}
                              </p>
                              <span className="text-[11px] text-slate-400">
                                Icon: {cat.icon_name || 'Folder'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-slate-500">
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-slate-600">
                            {cat.slug}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-500 max-w-xs truncate">
                          {cat.description || <span className="text-slate-300 italic">No description</span>}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => handleToggleActive(cat)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
                              cat.is_active
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                            title="Click to toggle category visibility"
                          >
                            {cat.is_active ? (
                              <>
                                <Check size={12} /> Active
                              </>
                            ) : (
                              <>
                                <X size={12} /> Hidden
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(cat)}
                              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-[#1A2744] transition"
                              title="Edit Category"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(cat.id, cat.name)}
                              className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                              title="Delete Category"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal for Add / Edit */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
            <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl font-semibold text-[#1A2744]">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 transition"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="e.g. Fine Arts & Crafts"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[var(--brass)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. art-supplies"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-mono focus:border-[var(--brass)] focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-400">Used in URLs: /shop?category=...</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief summary of what products belong here..."
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-[var(--brass)] focus:outline-none resize-none"
                  />
                </div>

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
                    <label className="flex items-center gap-2 mt-2 cursor-pointer text-sm font-medium text-slate-700">
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

      </div>
    </main>
  );
};

export default ManageCategories;
