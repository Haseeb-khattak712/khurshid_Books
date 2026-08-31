import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Star, ArrowLeft, Plus, Search, Pencil, X } from 'lucide-react';
import { supabase } from '../../services/supabase.js';
import Spinner from '../../components/Spinner.jsx';
import { toast } from 'react-hot-toast';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Google Books Auto-fill state
  const [googleQuery, setGoogleQuery] = useState('');
  const [googleResults, setGoogleResults] = useState([]);
  const [isSearchingGoogle, setIsSearchingGoogle] = useState(false);
  const [showGoogleDropdown, setShowGoogleDropdown] = useState(false);

  // Edit state
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Notebooks',
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
    category: 'Notebooks',
    brand: '',
    stock: '',
    images: '',
    isFeatured: false,
  });

  const CATEGORIES = [
    'Books', 'Notebooks', 'Pens', 'Art Supplies', 'Office Supplies',
    'Bags', 'Calculators', 'Geometry', 'Paper Products', 'Gift Items',
  ];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const limit = 12;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase.from('products').select('*', { count: 'exact' }).order('created_at', { ascending: false });
      
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      const { data, count, error } = await query.range(from, to);
      if (error) throw error;

      setProducts(data || []);
      setPages(Math.ceil((count || 0) / limit));
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchProducts(), 300);
    return () => clearTimeout(timer);
  }, [page, search]);

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
    const toastId = toast.loading('Uploading image...');
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormFunc((prev) => ({ ...prev, images: publicUrl }));
      toast.success('Image uploaded successfully', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Image upload failed', { id: toastId });
    }
  };

  // ─── GOOGLE BOOKS AUTO-FILL ───────────────────────────────────────────────
  
  const searchGoogleBooks = async (e) => {
    e.preventDefault();
    if (!googleQuery.trim()) return;
    setIsSearchingGoogle(true);
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(googleQuery)}&maxResults=5`);
      const data = await res.json();
      setGoogleResults(data.items || []);
      setShowGoogleDropdown(true);
    } catch (error) {
      toast.error('Failed to fetch from Google Books');
    } finally {
      setIsSearchingGoogle(false);
    }
  };

  const handleAutoFill = (book) => {
    const info = book.volumeInfo;
    const title = info.title || '';
    const author = info.authors ? info.authors.join(', ') : '';
    const desc = info.description || '';
    const fullDesc = author ? `Author: ${author}\n\n${desc}` : desc;
    const image = info.imageLinks?.thumbnail?.replace('http:', 'https:') || '';
    
    if (editingProduct) {
      setEditForm((prev) => ({ ...prev, name: title, description: fullDesc, images: image, category: 'Books' }));
    } else {
      setNewProduct((prev) => ({ ...prev, name: title, description: fullDesc, images: image, category: 'Books' }));
    }
    
    setShowGoogleDropdown(false);
    setGoogleQuery('');
    toast.success('Fields auto-filled successfully!');
  };

  // ─── EDIT LOGIC ───────────────────────────────────────────────────────────

  const startEdit = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || 'Notebooks',
      brand: product.brand || '',
      stock: product.stock || '',
      images: product.images?.[0] || product.image || '',
      isFeatured: product.is_featured || product.isFeatured || false,
    });
    setShowForm(false); // Close add form if open
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setEditForm({
      name: '',
      description: '',
      price: '',
      category: 'Notebooks',
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
        ...editForm,
        price: Number(editForm.price),
        stock: Number(editForm.stock),
        images: editForm.images ? [editForm.images] : [],
        is_featured: editForm.isFeatured,
      };
      delete payload.isFeatured;
      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', editingProduct.id || editingProduct._id);
        
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

  // ─── CREATE LOGIC (unchanged) ─────────────────────────────────────────────

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const slug = newProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const payload = {
        ...newProduct,
        slug,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        images: newProduct.images ? [newProduct.images] : [],
        is_featured: newProduct.isFeatured,
      };
      delete payload.isFeatured;
      
      const { error } = await supabase.from('products').insert([payload]);
      
      if (error) throw error;
      
      toast.success('Product created successfully');
      setShowForm(false);
      setNewProduct({ name: '', description: '', price: '', category: 'Notebooks', brand: '', stock: '', images: '', isFeatured: false });
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
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="text-[var(--brass)] hover:underline text-sm flex items-center gap-1">
              <ArrowLeft size={14} /> Dashboard
            </Link>
            <span className="text-slate-300">|</span>
            <h1 className="font-serif text-2xl font-semibold text-[#1A2744]">Manage Products</h1>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{totalCount}</span>
          </div>
          <button
            type="button"
            onClick={() => { setShowForm((v) => !v); cancelEdit(); }}
            className="btn-primary py-2 px-5 text-sm flex items-center gap-1.5"
          >
            <Plus size={15} /> {showForm ? 'Cancel' : 'Add Product'}
          </button>
        </div>

        {/* ─── EDIT FORM ──────────────────────────────────────────────────────── */}
        {editingProduct && (
          <form onSubmit={handleEditSubmit} className="mb-8 rounded-3xl border border-[var(--brass)]/30 bg-white p-6 shadow-sm space-y-4 relative">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-[var(--ink)]">Edit Product</h2>
              <button type="button" onClick={cancelEdit} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition">
                <X size={16} />
              </button>
            </div>

            {/* Google Books Search Bar */}
            <div className="rounded-2xl bg-[#FAF8F3] p-4 mb-4 border border-slate-200 relative">
              <label className="block text-xs font-semibold text-[var(--ink)] mb-2 uppercase tracking-wide">
                Auto-fill from Google Books API
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter book name or ISBN..."
                  value={googleQuery}
                  onChange={(e) => setGoogleQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchGoogleBooks(e)}
                  className="flex-1 field py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={searchGoogleBooks}
                  disabled={isSearchingGoogle}
                  className="btn-primary py-2 px-4 text-sm whitespace-nowrap"
                >
                  {isSearchingGoogle ? 'Searching...' : 'Search'}
                </button>
              </div>
              
              {showGoogleDropdown && googleResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 z-10 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                  <div className="max-h-64 overflow-y-auto">
                    {googleResults.map((book) => (
                      <div
                        key={book.id}
                        onClick={() => handleAutoFill(book)}
                        className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0"
                      >
                        <img 
                          src={book.volumeInfo.imageLinks?.smallThumbnail?.replace('http:', 'https:') || '/roots.png'} 
                          className="h-12 w-8 object-cover rounded border border-slate-200 shrink-0"
                          alt=""
                        />
                        <div className="overflow-hidden">
                          <p className="font-semibold text-sm text-[var(--ink)] truncate">{book.volumeInfo.title}</p>
                          <p className="text-xs text-slate-500 truncate">{book.volumeInfo.authors?.join(', ')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => setShowGoogleDropdown(false)} className="w-full p-2 bg-slate-100 text-xs font-semibold text-slate-500 hover:bg-slate-200">
                    Close
                  </button>
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Name *
                <input required type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="mt-1 field" />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Brand
                <input type="text" value={editForm.brand} onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                  className="mt-1 field" />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Price (Rs.) *
                <input required type="number" min="1" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  className="mt-1 field" />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Stock *
                <input required type="number" min="0" value={editForm.stock} onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                  className="mt-1 field" />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Category *
                <select required value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="mt-1 field">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Image Upload
                <input type="file" accept="image/*" onChange={(e) => uploadFileHandler(e, setEditForm)}
                  className="mt-1 w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-[var(--brass)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[var(--ink)] hover:file:bg-[var(--brass)]/80" />
                {editForm.images && <p className="mt-1 text-xs text-green-600">Image selected/uploaded.</p>}
              </label>
              <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
                Description
                <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows="3" className="mt-1 field resize-none" />
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                <input type="checkbox" checked={editForm.isFeatured} onChange={(e) => setEditForm({ ...editForm, isFeatured: e.target.checked })}
                  className="accent-[var(--brass)]" />
                Featured product
              </label>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={cancelEdit} className="btn-secondary py-2.5 px-6 text-sm">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="btn-primary py-2.5 px-6 text-sm disabled:opacity-60">
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {/* ─── ADD FORM (unchanged) ─────────────────────────────────────────── */}
        {showForm && !editingProduct && (
          <form onSubmit={handleCreateProduct} className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="font-serif text-lg font-semibold text-[var(--ink)]">New Product</h2>
            
            {/* Google Books Search Bar */}
            <div className="rounded-2xl bg-[#FAF8F3] p-4 mb-4 border border-slate-200 relative">
              <label className="block text-xs font-semibold text-[var(--ink)] mb-2 uppercase tracking-wide">
                Auto-fill from Google Books API
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter book name or ISBN..."
                  value={googleQuery}
                  onChange={(e) => setGoogleQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchGoogleBooks(e)}
                  className="flex-1 field py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={searchGoogleBooks}
                  disabled={isSearchingGoogle}
                  className="btn-primary py-2 px-4 text-sm whitespace-nowrap"
                >
                  {isSearchingGoogle ? 'Searching...' : 'Search'}
                </button>
              </div>
              
              {showGoogleDropdown && googleResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 z-10 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                  <div className="max-h-64 overflow-y-auto">
                    {googleResults.map((book) => (
                      <div
                        key={book.id}
                        onClick={() => handleAutoFill(book)}
                        className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0"
                      >
                        <img 
                          src={book.volumeInfo.imageLinks?.smallThumbnail?.replace('http:', 'https:') || '/roots.png'} 
                          className="h-12 w-8 object-cover rounded border border-slate-200 shrink-0"
                          alt=""
                        />
                        <div className="overflow-hidden">
                          <p className="font-semibold text-sm text-[var(--ink)] truncate">{book.volumeInfo.title}</p>
                          <p className="text-xs text-slate-500 truncate">{book.volumeInfo.authors?.join(', ')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => setShowGoogleDropdown(false)} className="w-full p-2 bg-slate-100 text-xs font-semibold text-slate-500 hover:bg-slate-200">
                    Close
                  </button>
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Name *
                <input required type="text" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="mt-1 field" placeholder="Premier Executive Journal" />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Brand
                <input type="text" value={newProduct.brand} onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                  className="mt-1 field" placeholder="Premier" />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Price (Rs.) *
                <input required type="number" min="1" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  className="mt-1 field" placeholder="450" />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Stock *
                <input required type="number" min="0" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                  className="mt-1 field" placeholder="50" />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Category *
                <select required value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="mt-1 field">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Image Upload
                <input type="file" accept="image/*" onChange={(e) => uploadFileHandler(e, setNewProduct)}
                  className="mt-1 w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-[var(--brass)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[var(--ink)] hover:file:bg-[var(--brass)]/80" />
                {newProduct.images && <p className="mt-1 text-xs text-green-600">Image selected/uploaded.</p>}
              </label>
              <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
                Description
                <textarea value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  rows="3" className="mt-1 field resize-none" placeholder="A short description of the product..." />
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                <input type="checkbox" checked={newProduct.isFeatured} onChange={(e) => setNewProduct({ ...newProduct, isFeatured: e.target.checked })}
                  className="accent-[var(--brass)]" />
                Featured product
              </label>
            </div>
            <button type="submit" disabled={submitting} className="btn-primary py-2.5 px-6 text-sm disabled:opacity-60">
              {submitting ? 'Creating...' : 'Create Product'}
            </button>
          </form>
        )}

        {/* Search */}
        <div className="mb-4 relative max-w-sm">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="field pl-9 py-2 text-sm"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        </div>

        {loading ? (
          <Spinner />
        ) : products.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-[var(--text-muted)]">No products found.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#EDE8DE] text-xs font-semibold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">Stock</th>
                  <th className="px-5 py-4">Rating</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr key={product.id || product._id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images && product.images.length > 0 ? product.images[0] : '/roots.png'}
                          alt={product.name}
                          className="h-10 w-10 rounded-xl object-cover border border-slate-100"
                        />
                        <div>
                          <p className="font-semibold text-[var(--ink)] max-w-[200px] truncate">{product.name}</p>
                          <p className="text-xs text-slate-400">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{product.category}</td>
                    <td className="px-5 py-4 font-semibold text-[var(--ink)]">Rs. {product.price.toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <span className={`font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 text-xs text-[var(--brass)] font-semibold">
                        <Star size={11} className="fill-[var(--brass)]" /> {product.ratings?.toFixed(1)}
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
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && !loading && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button type="button" disabled={page === 1} onClick={() => setPage((p) => p - 1)}
              className="btn-secondary py-2 px-4 text-sm disabled:opacity-50">Previous</button>
            <span className="text-sm text-[var(--text-muted)]">Page {page} of {pages}</span>
            <button type="button" disabled={page === pages} onClick={() => setPage((p) => p + 1)}
              className="btn-primary py-2 px-4 text-sm disabled:opacity-50">Next</button>
          </div>
        )}
      </div>
    </main>
  );
};

export default ManageProducts;