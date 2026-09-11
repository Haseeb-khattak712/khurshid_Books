import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Trash2,
  Star,
  ArrowLeft,
  Plus,
  Search,
  Pencil,
  X,
  Sparkles,
  Bookmark,
  Filter,
  ExternalLink,
  Image as ImageIcon,
  CheckCircle2
} from 'lucide-react';
import { supabase } from '../../services/supabase.js';
import Spinner from '../../components/Spinner.jsx';
import { toast } from 'react-hot-toast';
import {
  fetchCategories,
  DEFAULT_CATEGORIES,
  getCategoryAndDescendants
} from '../../services/categoryService.js';
import { saveCustomItemTemplate } from '../../services/templateService.js';
import { compressImage, formatFileSize } from '../../utils/imageCompressor.js';
import CategoryTreeSelect from '../../components/admin/CategoryTreeSelect.jsx';
import TemplateModal from '../../components/admin/TemplateModal.jsx';

const ManageProducts = () => {
  const [searchParams] = useSearchParams();
  const urlCategoryParam = searchParams.get('category');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState(urlCategoryParam || '');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);

  // Edit state
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Notebooks & Registers',
    category_id: null,
    subcategory: '',
    brand: '',
    stock: '',
    images: '',
    isFeatured: false,
  });

  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Books & Syllabi',
    category_id: null,
    subcategory: '',
    brand: '',
    stock: '',
    images: '',
    isFeatured: false,
  });

  // Load dynamic categories
  useEffect(() => {
    fetchCategories(true)
      .then((data) => {
        if (data && data.length > 0) {
          setCategories(data);
          const matched = urlCategoryParam
            ? data.find(c => c.name.toLowerCase() === urlCategoryParam.toLowerCase() || c.id === urlCategoryParam || c.slug === urlCategoryParam.toLowerCase())
            : null;

          if (matched) {
            setNewProduct(prev => ({
              ...prev,
              category: matched.name,
              category_id: matched.id
            }));
            setShowForm(true);
          } else if (!newProduct.category_id) {
            const first = data[0];
            setNewProduct(prev => ({
              ...prev,
              category: first.name,
              category_id: first.id
            }));
          }
        }
      })
      .catch((err) => {
        console.error('Error loading categories:', err);
      });
  }, [urlCategoryParam]);

  // Fetch products with tree-aware category filtering
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const limit = 12;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Search filter
      if (search.trim()) {
        query = query.ilike('name', `%${search.trim()}%`);
      }

      // Category filter (includes all descendant subcategories)
      if (selectedFilterCategory) {
        const { names } = getCategoryAndDescendants(selectedFilterCategory, categories);
        const filterNames = names && names.length > 0 ? names : [selectedFilterCategory];
        query = query.in('category', filterNames);
      }

      const { data, count, error } = await query.range(from, to);
      if (error) throw error;

      setProducts(data || []);
      setPages(Math.ceil((count || 0) / limit) || 1);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchProducts(), 300);
    return () => clearTimeout(timer);
  }, [page, search, selectedFilterCategory]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      toast.success(`"${name}" deleted`);
      fetchProducts();
    } catch (error) {
      toast.error(error.message || 'Failed to delete product');
    }
  };

  const uploadFileHandler = async (e, setFormFunc) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset input value so the same file can be re-selected if replaced
    e.target.value = '';

    const initialSizeStr = formatFileSize(file.size);
    const toastId = toast.loading(`Compressing image (${initialSizeStr})...`);

    try {
      // 1. Client-side browser compression (max 1200x1200px, 82% quality WebP)
      const {
        file: compressedFile,
        originalSize,
        compressedSize,
        reductionPercent
      } = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.82,
        preferredFormat: 'image/webp'
      });

      const compressedSizeStr = formatFileSize(compressedSize);
      toast.loading(
        `Uploading optimized image (${compressedSizeStr}, -${reductionPercent}% size)...`,
        { id: toastId }
      );

      // 2. Generate unique filename preserving compressed extension (.webp)
      const fileExt = compressedFile.name.split('.').pop() || 'webp';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, compressedFile, {
          contentType: compressedFile.type || 'image/webp',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormFunc((prev) => ({
        ...prev,
        images: publicUrl,
        imageMeta: {
          originalSize,
          compressedSize,
          reductionPercent
        }
      }));

      const savingText = reductionPercent > 0
        ? ` (${initialSizeStr} → ${compressedSizeStr}, -${reductionPercent}% saved)`
        : ` (${compressedSizeStr})`;

      toast.success(`Image compressed & uploaded!${savingText}`, { id: toastId, duration: 4500 });
    } catch (error) {
      console.error('Image upload/compression failed:', error);
      toast.error(error.message || 'Image upload failed', { id: toastId });
    }
  };

  // ─── APPLY TEMPLATE BLUEPRINT ──────────────────────────────────────────────

  const handleApplyTemplatePreset = (preset) => {
    const targetCategory = categories.find(
      c => c.name.toLowerCase() === preset.category?.toLowerCase() || c.slug === preset.category?.toLowerCase()
    );

    const updateFields = {
      name: preset.name || '',
      description: preset.description || '',
      price: preset.price || '',
      category: targetCategory ? targetCategory.name : (preset.category || 'Books & Syllabi'),
      category_id: targetCategory ? targetCategory.id : null,
      subcategory: preset.subcategory || '',
      brand: preset.brand || '',
      stock: preset.stock ?? 50,
      isFeatured: preset.isFeatured ?? false,
    };

    if (editingProduct) {
      setEditForm(prev => ({ ...prev, ...updateFields }));
    } else {
      setNewProduct(prev => ({ ...prev, ...updateFields }));
      setShowForm(true);
    }
  };

  const handleSaveAsCustomTemplate = (formState) => {
    if (!formState.name.trim()) {
      toast.error('Product name is required to save as a template');
      return;
    }

    try {
      saveCustomItemTemplate({
        title: formState.name,
        category: formState.category,
        subcategory: formState.subcategory,
        preset: {
          ...formState,
          price: Number(formState.price) || 0,
          stock: Number(formState.stock) || 0
        }
      });
      toast.success('Saved current form as reusable blueprint!');
    } catch (_err) {
      toast.error('Failed to save custom blueprint');
    }
  };

  // ─── EDIT LOGIC ───────────────────────────────────────────────────────────

  const startEdit = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || 'Books & Syllabi',
      category_id: product.category_id || null,
      subcategory: product.subcategory || '',
      brand: product.brand || '',
      stock: product.stock || '',
      images: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : (product.image || ''),
      isFeatured: product.is_featured || product.isFeatured || false,
    });
    setShowForm(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setEditForm({
      name: '',
      description: '',
      price: '',
      category: 'Books & Syllabi',
      category_id: null,
      subcategory: '',
      brand: '',
      stock: '',
      images: '',
      isFeatured: false,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSubmitting(true);

    try {
      const payload = {
        name: editForm.name.trim(),
        description: editForm.description,
        price: Number(editForm.price),
        stock: Number(editForm.stock),
        category: editForm.category,
        category_id: editForm.category_id || null,
        subcategory: editForm.subcategory?.trim() || null,
        brand: editForm.brand?.trim() || null,
        images: editForm.images ? [editForm.images] : [],
        is_featured: editForm.isFeatured,
        updated_at: new Date().toISOString()
      };

      let { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', editingProduct.id || editingProduct._id);

      // Fallback if category_id column does not exist yet in Supabase
      if (error && (error.code === 'PGRST204' || error.message?.includes('category_id'))) {
        const { category_id: _cid, ...fallbackPayload } = payload;
        const retry = await supabase
          .from('products')
          .update(fallbackPayload)
          .eq('id', editingProduct.id || editingProduct._id);
        error = retry.error;
      }

      if (error) throw error;

      toast.success('Product updated successfully');
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      toast.error(error.message || 'Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── CREATE LOGIC ─────────────────────────────────────────────────────────

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const slug = newProduct.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const payload = {
        name: newProduct.name.trim(),
        slug: `${slug}-${Math.random().toString(36).substring(2, 6)}`,
        description: newProduct.description,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        category: newProduct.category,
        category_id: newProduct.category_id || null,
        subcategory: newProduct.subcategory?.trim() || null,
        brand: newProduct.brand?.trim() || null,
        images: newProduct.images ? [newProduct.images] : [],
        is_featured: newProduct.isFeatured,
        ratings: 5.0,
        num_reviews: 0
      };

      let { error } = await supabase.from('products').insert([payload]);

      // Fallback if category_id column does not exist yet in Supabase
      if (error && (error.code === 'PGRST204' || error.message?.includes('category_id'))) {
        const { category_id: _cid, ...fallbackPayload } = payload;
        const retry = await supabase.from('products').insert([fallbackPayload]);
        error = retry.error;
      }

      if (error) throw error;

      toast.success('Product created successfully');
      setShowForm(false);
      setNewProduct({
        name: '',
        description: '',
        price: '',
        category: 'Books & Syllabi',
        category_id: null,
        subcategory: '',
        brand: '',
        stock: '',
        images: '',
        isFeatured: false
      });
      fetchProducts();
    } catch (error) {
      toast.error(error.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="bg-[#FAF8F3] text-[#2C2C2C] min-h-screen pb-16">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        
        {/* Header & Actions */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="text-[var(--brass)] hover:underline text-sm flex items-center gap-1">
              <ArrowLeft size={14} /> Dashboard
            </Link>
            <span className="text-slate-300">|</span>
            <h1 className="font-serif text-2xl font-semibold text-[#1A2744]">Manage Products</h1>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
              {totalCount} Items
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* 1-Click Blueprints / Templates Button */}
            <button
              type="button"
              onClick={() => setTemplateModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-amber-300 bg-amber-50/90 px-4 py-2.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition shadow-xs"
              title="Use ready-to-use product blueprints (Textbooks, Notebooks, School Packs, Art)"
            >
              <Sparkles size={14} className="text-amber-600" />
              <span>Use Blueprint / Template</span>
            </button>

            {/* Toggle Add Product Form */}
            <button
              type="button"
              onClick={() => { setShowForm((v) => !v); cancelEdit(); }}
              className="btn-primary py-2.5 px-5 text-sm flex items-center gap-1.5 shadow-xs"
            >
              <Plus size={16} /> {showForm ? 'Cancel Form' : 'Add Product'}
            </button>
          </div>
        </div>

        {/* ─── EDIT FORM ──────────────────────────────────────────────────────── */}
        {editingProduct && (
          <form onSubmit={handleEditSubmit} className="mb-8 rounded-3xl border border-[var(--brass)]/40 bg-white p-6 shadow-md space-y-4 relative animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-semibold text-[var(--ink)]">Edit Product</h2>
                <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs text-amber-800 font-mono">
                  {editingProduct.id}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveAsCustomTemplate(editForm)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
                  title="Save current values as a reusable blueprint"
                >
                  <Bookmark size={13} /> Save as Template
                </button>
                <button type="button" onClick={cancelEdit} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Product Name *
                <input required type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="mt-1 field" />
              </label>

              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Brand / Publisher
                <input type="text" value={editForm.brand} onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                  className="mt-1 field" placeholder="e.g. Oxford, Piano, Dux" />
              </label>

              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Price (Rs.) *
                <input required type="number" min="1" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  className="mt-1 field" />
              </label>

              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Stock Quantity *
                <input required type="number" min="0" value={editForm.stock} onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                  className="mt-1 field" />
              </label>

              {/* Hierarchical Primary Category Select */}
              <div className="block">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Primary Category *
                  </span>
                  <Link to="/admin/categories" target="_blank" className="text-xs text-[var(--brass)] hover:underline font-normal flex items-center gap-1">
                    Manage Hierarchy <ExternalLink size={11} />
                  </Link>
                </div>
                <CategoryTreeSelect
                  value={editForm.category_id || editForm.category}
                  categories={categories}
                  onChange={(id, cat) => {
                    if (cat) {
                      setEditForm(prev => ({
                        ...prev,
                        category: cat.name,
                        category_id: cat.id
                      }));
                    }
                  }}
                  allowClear={false}
                />
              </div>

              {/* Subcategory Label / Spec */}
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Subcategory / Curriculum Tag
                <input
                  type="text"
                  value={editForm.subcategory}
                  onChange={(e) => setEditForm({ ...editForm, subcategory: e.target.value })}
                  className="mt-1 field"
                  placeholder="e.g. Class 5, Oxford Series, Narrow Lines"
                />
              </label>

              {/* Image Upload & Active Preview */}
              <div className="block sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Product Image
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200/60 shadow-2xs">
                    <CheckCircle2 size={11} className="text-emerald-600" /> Auto-Compressed (WebP)
                  </span>
                </div>

                {editForm.images ? (
                  <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
                    <img
                      src={editForm.images}
                      alt="Active product preview"
                      className="h-20 w-20 shrink-0 rounded-xl object-cover border border-slate-200 bg-white shadow-2xs"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800">
                        Active Compressed Product Image
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-md">
                        {editForm.images}
                      </p>
                      <div className="mt-2.5 flex items-center gap-2">
                        <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-2xs">
                          <ImageIcon size={13} className="text-[var(--brass)]" /> Replace Image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => uploadFileHandler(e, setEditForm)}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setEditForm(prev => ({ ...prev, images: '' }))}
                          className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => uploadFileHandler(e, setEditForm)}
                      className="w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-[var(--brass)] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-[var(--ink)] hover:file:bg-[var(--brass)]/80 cursor-pointer"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Upload high-res JPG, PNG, or WebP. Images are automatically scaled & compressed to ~60-120 KB without clarity loss.
                    </p>
                  </div>
                )}
              </div>

              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 sm:col-span-2">
                Description & Specifications
                <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows="4" className="mt-1 field resize-none font-sans" />
              </label>

              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                <input type="checkbox" checked={editForm.isFeatured} onChange={(e) => setEditForm({ ...editForm, isFeatured: e.target.checked })}
                  className="accent-[var(--brass)] h-4 w-4" />
                Featured on homepage & storefront
              </label>
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-100 justify-end">
              <button type="button" onClick={cancelEdit} className="btn-secondary py-2.5 px-6 text-sm">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="btn-primary py-2.5 px-6 text-sm disabled:opacity-60">
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {/* ─── ADD FORM ─────────────────────────────────────────────────────── */}
        {showForm && !editingProduct && (
          <form onSubmit={handleCreateProduct} className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-serif text-lg font-semibold text-[var(--ink)]">Create New Product</h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTemplateModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition"
                >
                  <Sparkles size={13} className="text-amber-600" />
                  Apply Blueprint
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveAsCustomTemplate(newProduct)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
                  title="Save current form inputs as a reusable blueprint"
                >
                  <Bookmark size={13} /> Save Template
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Product Name *
                <input required type="text" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="mt-1 field" placeholder="Oxford New Countdown Book - Class 5" />
              </label>

              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Brand / Publisher
                <input type="text" value={newProduct.brand} onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                  className="mt-1 field" placeholder="Oxford University Press" />
              </label>

              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Price (Rs.) *
                <input required type="number" min="1" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  className="mt-1 field" placeholder="650" />
              </label>

              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Stock Quantity *
                <input required type="number" min="0" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                  className="mt-1 field" placeholder="50" />
              </label>

              {/* Hierarchical Primary Category Select */}
              <div className="block">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Primary Category *
                  </span>
                  <Link to="/admin/categories" target="_blank" className="text-xs text-[var(--brass)] hover:underline font-normal flex items-center gap-1">
                    Manage Hierarchy <ExternalLink size={11} />
                  </Link>
                </div>
                <CategoryTreeSelect
                  value={newProduct.category_id || newProduct.category}
                  categories={categories}
                  onChange={(id, cat) => {
                    if (cat) {
                      setNewProduct(prev => ({
                        ...prev,
                        category: cat.name,
                        category_id: cat.id
                      }));
                    }
                  }}
                  allowClear={false}
                />
              </div>

              {/* Subcategory Label */}
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Subcategory / Branch Tag
                <input
                  type="text"
                  value={newProduct.subcategory}
                  onChange={(e) => setNewProduct({ ...newProduct, subcategory: e.target.value })}
                  className="mt-1 field"
                  placeholder="e.g. Oxford Series, Class 5, Narrow Line"
                />
              </label>

              {/* Image Upload & Active Preview */}
              <div className="block sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Product Image
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200/60 shadow-2xs">
                    <CheckCircle2 size={11} className="text-emerald-600" /> Auto-Compressed (WebP)
                  </span>
                </div>

                {newProduct.images ? (
                  <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
                    <img
                      src={newProduct.images}
                      alt="Uploaded product preview"
                      className="h-20 w-20 shrink-0 rounded-xl object-cover border border-slate-200 bg-white shadow-2xs"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800">
                        Uploaded & Compressed Image Ready
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-md">
                        {newProduct.images}
                      </p>
                      <div className="mt-2.5 flex items-center gap-2">
                        <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-2xs">
                          <ImageIcon size={13} className="text-[var(--brass)]" /> Replace Image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => uploadFileHandler(e, setNewProduct)}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setNewProduct(prev => ({ ...prev, images: '' }))}
                          className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => uploadFileHandler(e, setNewProduct)}
                      className="w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-[var(--brass)] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-[var(--ink)] hover:file:bg-[var(--brass)]/80 cursor-pointer"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Upload high-res JPG, PNG, or WebP. Images are automatically scaled & compressed to ~60-120 KB without clarity loss.
                    </p>
                  </div>
                )}
              </div>

              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 sm:col-span-2">
                Description & Specifications
                <textarea value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  rows="4" className="mt-1 field resize-none font-sans" placeholder="Detailed product specifications, publisher, grade, paper type..." />
              </label>

              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                <input type="checkbox" checked={newProduct.isFeatured} onChange={(e) => setNewProduct({ ...newProduct, isFeatured: e.target.checked })}
                  className="accent-[var(--brass)] h-4 w-4" />
                Featured product
              </label>
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-100 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary py-2.5 px-6 text-sm">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="btn-primary py-2.5 px-6 text-sm disabled:opacity-60">
                {submitting ? 'Creating...' : 'Create Product'}
              </button>
            </div>
          </form>
        )}

        {/* Toolbar: Search & Tree-Aware Category Filter */}
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products by title..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm focus:border-[var(--brass)] focus:bg-white focus:outline-none transition"
            />
          </div>

          <div className="flex items-center gap-2 min-w-[260px]">
            <Filter size={15} className="text-slate-400 shrink-0" />
            <CategoryTreeSelect
              value={selectedFilterCategory}
              onChange={(id, cat) => {
                setSelectedFilterCategory(cat ? cat.name : '');
                setPage(1);
              }}
              categories={categories}
              placeholder="Filter by Category / Subcategory..."
              allowClear={true}
              className="text-xs"
            />
          </div>
        </div>

        {/* Product Table */}
        {loading ? (
          <div className="py-20 flex justify-center"><Spinner /></div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <p className="text-[var(--text-muted)]">No products found matching your criteria.</p>
            {selectedFilterCategory && (
              <button
                type="button"
                onClick={() => setSelectedFilterCategory('')}
                className="mt-3 text-xs text-[var(--brass)] hover:underline font-semibold"
              >
                Clear category filter ({selectedFilterCategory})
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">Category & Hierarchy</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">Stock</th>
                  <th className="px-5 py-4">Rating</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => {
                  const imgUrl = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : (product.image || '/roots.png');
                  return (
                    <tr key={product.id || product._id} className="hover:bg-slate-50/60 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={imgUrl}
                            alt={product.name}
                            className="h-11 w-11 rounded-xl object-cover border border-slate-200/60 shadow-2xs"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-[var(--ink)] max-w-[240px] truncate text-sm">
                              {product.name}
                            </p>
                            <p className="text-xs text-slate-400">{product.brand || 'Unbranded'}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                            {product.category}
                          </span>
                          {product.subcategory && (
                            <div className="text-[11px] text-amber-800 font-medium">
                              &rsaquo; {product.subcategory}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 font-semibold text-[var(--ink)]">
                        Rs. {Number(product.price || 0).toLocaleString()}
                      </td>

                      <td className="px-5 py-4">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          Number(product.stock) > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {product.stock} in stock
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 text-xs text-[var(--brass)] font-semibold">
                          <Star size={12} className="fill-[var(--brass)]" /> {(product.ratings || 5).toFixed(1)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(product)}
                            className="inline-flex items-center gap-1 rounded-full border border-amber-200 px-3 py-1 text-xs font-semibold text-[var(--brass)] hover:bg-amber-50 transition"
                          >
                            <Pencil size={12} /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(product.id || product._id, product.name)}
                            className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && !loading && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="btn-secondary py-2 px-4 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-[var(--text-muted)]">Page {page} of {pages}</span>
            <button
              type="button"
              disabled={page === pages}
              onClick={() => setPage((p) => p + 1)}
              className="btn-primary py-2 px-4 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {/* Blueprint & Item Templates Modal */}
        <TemplateModal
          isOpen={templateModalOpen}
          onClose={() => setTemplateModalOpen(false)}
          initialTab="item"
          onSelectProductTemplate={handleApplyTemplatePreset}
        />

      </div>
    </main>
  );
};

export default ManageProducts;