import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import api from '../../services/api.js';
import { toast } from 'react-hot-toast';

const SCHOOLS = [
  'Beaconhouse',
  'Roots',
  'The City School',
  'Silver Oaks',
  'Lahore Grammar',
  'Aitchison',
  'Convent of Jesus & Mary',
];

const SchoolPackForm = ({ pack, isOpen, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: '',
    school: 'Beaconhouse',
    grade: '',
    academicYear: new Date().getFullYear().toString(),
    description: '',
    price: '',
    discountPrice: '',
    isActive: true,
    items: [],
  });
  const [availableProducts, setAvailableProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (pack) {
      setForm({
        name: pack.name || '',
        school: pack.school || 'Beaconhouse',
        grade: pack.grade || '',
        academicYear: pack.academicYear || new Date().getFullYear().toString(),
        description: pack.description || '',
        price: pack.price || '',
        discountPrice: pack.discountPrice || '',
        isActive: pack.isActive ?? true,
        items: pack.items?.map((item) => ({
          product: item.product?._id || item.product,
          name: item.product?.name || item.name,
          quantity: item.quantity || 1,
          price: item.price || item.product?.price || 0,
        })) || [],
      });
    } else {
      setForm({
        name: '',
        school: 'Beaconhouse',
        grade: '',
        academicYear: new Date().getFullYear().toString(),
        description: '',
        price: '',
        discountPrice: '',
        isActive: true,
        items: [],
      });
    }
  }, [pack]);

  // Fetch products for the dropdown
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get('/products', { params: { limit: 100 } });
        if (data.success) setAvailableProducts(data.data);
      } catch (error) {
        console.error('Failed to fetch products');
      }
    };
    if (isOpen) fetchProducts();
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const addItem = (product) => {
    const exists = form.items.find((item) => item.product === (product._id || product.id));
    if (exists) {
      toast.error('Product already in pack');
      return;
    }
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product: product._id || product.id,
          name: product.name,
          quantity: 1,
          price: product.price,
        },
      ],
    }));
    setProductSearch('');
  };

  const removeItem = (productId) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.product !== productId),
    }));
  };

  const updateItemQuantity = (productId, quantity) => {
    if (quantity < 1) return;
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.product === productId ? { ...item, quantity } : item
      ),
    }));
  };

  const calculateTotal = () => {
    return form.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.items.length === 0) {
      toast.error('Add at least one product to the pack');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price) || calculateTotal(),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
        items: form.items.map((item) => ({
          product: item.product,
          quantity: item.quantity,
        })),
      };
      let data;
      if (pack?._id) {
        ({ data } = await api.put(`/school-packs/${pack._id}`, payload));
      } else {
        ({ data } = await api.post('/school-packs', payload));
      }
      if (data.success) {
        toast.success(pack ? 'Pack updated successfully' : 'Pack created successfully');
        onSave(data.data);
        onClose();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save pack');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const filteredProducts = productSearch
    ? availableProducts.filter((p) =>
        p.name.toLowerCase().includes(productSearch.toLowerCase())
      )
    : availableProducts.slice(0, 8);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-semibold text-[#1A2744]">
            {pack ? 'Edit School Pack' : 'New School Pack'}
          </h2>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Pack Name *
              <input
                required
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#FAF8F3] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#D4A017]"
                placeholder="Grade 9 - Beaconhouse DHA"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              School *
              <select
                required
                name="school"
                value={form.school}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#FAF8F3] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#D4A017]"
              >
                {SCHOOLS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Grade / Class *
              <input
                required
                type="text"
                name="grade"
                value={form.grade}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#FAF8F3] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#D4A017]"
                placeholder="Grade 9, O-Level Year 1, etc."
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Academic Year *
              <input
                required
                type="text"
                name="academicYear"
                value={form.academicYear}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#FAF8F3] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#D4A017]"
                placeholder="2025"
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-slate-700">
            Description
            <textarea
              name="description"
              rows="2"
              value={form.description}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#FAF8F3] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#D4A017] resize-none"
              placeholder="What's included in this pack..."
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Pack Price (Rs.) *
              <input
                required
                type="number"
                min="0"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#FAF8F3] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#D4A017]"
                placeholder={calculateTotal().toLocaleString()}
              />
              <p className="mt-1 text-xs text-slate-400">
                Auto-calculated: Rs. {calculateTotal().toLocaleString()}
              </p>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Discount Price
              <input
                type="number"
                min="0"
                name="discountPrice"
                value={form.discountPrice}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#FAF8F3] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#D4A017]"
                placeholder="Optional discounted price"
              />
            </label>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
              className="h-5 w-5 accent-[#D4A017] rounded"
            />
            <span className="text-sm font-medium text-slate-700">Active (visible to customers)</span>
          </label>

          {/* Products Section */}
          <div className="border-t border-slate-200 pt-5">
            <h3 className="font-semibold text-[#1A2744] mb-3">Pack Items ({form.items.length})</h3>

            {/* Search & Add */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search products to add..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-[#FAF8F3] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#D4A017] pl-10"
              />
              <Plus size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              {productSearch && (
                <div className="absolute z-10 mt-1 w-full rounded-2xl border border-slate-200 bg-white shadow-lg max-h-48 overflow-y-auto">
                  {filteredProducts.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-slate-400">No products found</p>
                  ) : (
                    filteredProducts.map((p) => (
                      <button
                        key={p._id}
                        type="button"
                        onClick={() => addItem(p)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-[#FAF8F3] transition border-b border-slate-50 last:border-0"
                      >
                        <img src="/roots.png" alt="" className="h-8 w-8 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1A2744] truncate">{p.name}</p>
                          <p className="text-xs text-slate-400">Rs. {p.price}</p>
                        </div>
                        <Plus size={14} className="text-[#D4A017]" />
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Items List */}
            {form.items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <p className="text-sm text-slate-400">No items added yet. Search above to add products.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {form.items.map((item) => (
                  <div
                    key={item.product}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#FAF8F3] p-3"
                  >
                    <img src="/roots.png" alt="" className="h-10 w-10 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A2744] truncate">{item.name}</p>
                      <p className="text-xs text-slate-400">Rs. {item.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateItemQuantity(item.product, item.quantity - 1)}
                        className="h-7 w-7 flex items-center justify-center rounded-full bg-white border border-slate-200 text-xs font-bold hover:bg-slate-50"
                      >
                        -
                      </button>
                      <span className="min-w-[24px] text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateItemQuantity(item.product, item.quantity + 1)}
                        className="h-7 w-7 flex items-center justify-center rounded-full bg-white border border-slate-200 text-xs font-bold hover:bg-slate-50"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-[#1A2744] min-w-[60px] text-right">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeItem(item.product)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="text-sm text-slate-500">Total items: {form.items.reduce((a, i) => a + i.quantity, 0)}</span>
                  <span className="text-sm font-bold text-[#1A2744]">
                    Subtotal: Rs. {calculateTotal().toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-2xl bg-[#D4A017] px-6 py-3 text-sm font-bold text-[#1A2744] hover:opacity-90 transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : pack ? 'Update Pack' : 'Create Pack'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SchoolPackForm;