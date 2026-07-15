import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Star, ArrowLeft, Plus, Search } from 'lucide-react';
import api from '../../services/api.js';
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
      const params = { page, limit: 12 };
      if (search) params.search = search;
      const { data } = await api.get('/products', { params });
      if (data.success) {
        setProducts(data.data);
        setPages(data.pages);
        setTotalCount(data.count);
      }
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
      await api.delete(`/products/${id}`);
      toast.success(`"${name}" deleted`);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...newProduct,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        images: newProduct.images ? [newProduct.images] : [],
      };
      const { data } = await api.post('/products', payload);
      if (data.success) {
        toast.success('Product created successfully');
        setShowForm(false);
        setNewProduct({ name: '', description: '', price: '', category: 'Notebooks', brand: '', stock: '', images: '', isFeatured: false });
        fetchProducts();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create product');
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
            onClick={() => setShowForm((v) => !v)}
            className="btn-primary py-2 px-5 text-sm flex items-center gap-1.5"
          >
            <Plus size={15} /> {showForm ? 'Cancel' : 'Add Product'}
          </button>
        </div>

        {/* Add Product Form */}
        {showForm && (
          <form onSubmit={handleCreateProduct} className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="font-serif text-lg font-semibold text-[var(--ink)]">New Product</h2>
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
                Image URL
                <input type="url" value={newProduct.images} onChange={(e) => setNewProduct({ ...newProduct, images: e.target.value })}
                  className="mt-1 field" placeholder="https://..." />
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
                  <tr key={product._id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {product.images?.[0] && (
                          <img src={product.images[0]} alt={product.name} className="h-10 w-10 rounded-xl object-cover border border-slate-100" />
                        )}
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
                      <button
                        type="button"
                        onClick={() => handleDelete(product._id, product.name)}
                        className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
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
