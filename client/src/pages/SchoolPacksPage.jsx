import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import LazyImage from '../components/LazyImage.jsx';
import api from '../services/api.js';

const SchoolPacksPage = () => {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const schoolFilter = searchParams.get('school');

  useEffect(() => {
    const fetchPacks = async () => {
      try {
        const params = {};
        if (schoolFilter) params.school = schoolFilter;
        // limit initial payload to 12 items to reduce DOM and payload
        params.limit = 12;
        const res = await api.get('/school-packs', { params });
        if (res.data.success) {
          setPacks(res.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching packs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPacks();
  }, [schoolFilter]);

  const schools = [
    { name: 'Beaconhouse', slug: 'beaconhouse', color: 'bg-blue-600', description: 'Official vendor since 2014' },
    { name: 'LGS', slug: 'lgs', color: 'bg-purple-600', description: 'Trusted LGS vendor' },
    { name: 'Roots', slug: 'roots', color: 'bg-red-600', description: 'Complete Roots supplies' },
    { name: 'The City School', slug: 'tcs', color: 'bg-orange-600', description: 'TCS approved packs' },
    { name: 'Silver Oaks', slug: 'silver-oaks', color: 'bg-emerald-700', description: 'Premium Silver Oaks packs' },
  ];

  if (loading) return <div className="py-20 text-center">Loading...</div>;

  return (
    <main className="min-h-screen bg-[#FAF8F3]">
      {/* Header */}
      <div className="bg-[#1A2744] py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6 text-center">
          <h1 className="text-4xl font-bold text-white md:text-5xl">School Collection Packs</h1>
          <p className="mt-4 text-lg text-white/70">Everything your child needs for the new academic year</p>
        </div>
      </div>

      {/* School Filter Grid */}
      {!schoolFilter && (
        <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
          <h2 className="mb-8 text-center text-2xl font-semibold text-[#1A2744]">Select Your School</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {schools.map((school) => (
              <Link
                key={school.name}
                to={`/school-packs?school=${school.slug}`}
                className="group flex flex-col items-center rounded-3xl border border-slate-200 bg-white p-8 text-center transition hover:border-[#D4A017] hover:shadow-lg"
              >
                <div className={`flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold text-white shadow-lg ${school.color}`}>
                  {school.name.charAt(0)}
                </div>
                <h3 className="mt-4 text-xl font-bold text-[#1A2744]">{school.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{school.description}</p>
                <span className="mt-4 flex items-center gap-1 text-sm font-semibold text-[#D4A017] opacity-0 transition group-hover:opacity-100">
                  View Packs <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Packs Grid */}
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        {schoolFilter && (
          <div className="mb-8">
            <Link to="/school-packs" className="text-sm text-slate-500 hover:text-[#D4A017]">
              ← Back to all schools
            </Link>
            <h2 className="mt-4 text-3xl font-bold text-[#1A2744] capitalize">
              {schoolFilter.replace('-', ' ')} School Packs
            </h2>
          </div>
        )}

        {packs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400">No school packs available yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {packs.map((pack) => (
              <div key={pack._id} className="rounded-3xl border border-slate-200 bg-white overflow-hidden hover:shadow-lg transition">
                <div className="relative h-48 bg-slate-100">
                  <LazyImage src="/roots.png" alt={pack.name} className="h-full w-full object-cover" width="600" height="320" />
                  {pack.discountPrice && pack.discountPrice < pack.price && (
                    <div className="absolute top-4 right-4 rounded-full bg-[#D4A017] px-3 py-1 text-xs font-bold text-[#1A2744]">
                      SAVE Rs. {(pack.price - pack.discountPrice).toLocaleString()}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                      {pack.school}
                    </span>
                    <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-[#D4A017]">
                      {pack.grade}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#1A2744]">{pack.name}</h3>
                  <p className="mt-2 text-sm text-slate-500 line-clamp-2">{pack.description}</p>
                  
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase">Pack Includes:</p>
                    {pack.items?.slice(0, 5).map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                        <Check size={14} className="text-green-500 shrink-0" />
                        <span className="line-clamp-1">
                          {item.quantity}x {item.product?.name || item.name}
                        </span>
                      </div>
                    ))}
                    {pack.items?.length > 5 && (
                      <p className="text-xs text-slate-400">+{pack.items.length - 5} more items</p>
                    )}
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-[#1A2744]">
                        Rs. {(pack.discountPrice || pack.price).toLocaleString()}
                      </span>
                      {pack.discountPrice && (
                        <span className="ml-2 text-sm text-slate-400 line-through">
                          Rs. {pack.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => alert('Add to cart functionality coming soon')}
                      className="rounded-full bg-[#D4A017] px-5 py-2.5 text-sm font-bold text-[#1A2744] transition hover:opacity-90"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default SchoolPacksPage;