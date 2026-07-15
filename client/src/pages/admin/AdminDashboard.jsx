import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Package, ShoppingCart, Users, TrendingUp, ArrowRight, School } from 'lucide-react';
import api from '../../services/api.js';
import Spinner from '../../components/Spinner.jsx';

const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/admin/dashboard');
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="py-20 bg-[#FAF8F3]"><Spinner /></div>;
  }

  const chartData = stats?.monthlyRevenue
    ? [...stats.monthlyRevenue]
        .reverse()
        .map((d) => ({
          month: MONTH_NAMES[d._id.month],
          revenue: d.revenue,
        }))
    : [];

  const cards = [
    { label: 'Total Products', value: stats?.totalProducts ?? 0, icon: Package, color: 'bg-blue-50 text-blue-600', link: '/admin/products' },
    { label: 'Total Orders', value: stats?.totalOrders ?? 0, icon: ShoppingCart, color: 'bg-indigo-50 text-indigo-600', link: '/admin/orders' },
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'bg-violet-50 text-violet-600', link: '/admin/users' },
    {
      label: 'Revenue This Month',
      value: `Rs. ${(stats?.revenueThisMonth ?? 0).toLocaleString()}`,
      icon: TrendingUp,
      color: 'bg-amber-50 text-[var(--brass)]',
      link: '/admin/orders'
    },
  ];

  return (
    <main className="bg-[#FAF8F3] text-[#2C2C2C] min-h-screen pb-16">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="mb-8">
          <span className="label-tag">Admin Panel</span>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-[#1A2744]">Dashboard</h1>
        </div>

        {/* Stat Cards */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.label}
                to={card.link}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition group"
              >
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${card.color} mb-4`}>
                  <Icon size={20} />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{card.label}</p>
                <p className="mt-2 text-2xl font-bold text-[#1A2744]">{card.value}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--brass)] opacity-0 group-hover:opacity-100 transition">
                  View <ArrowRight size={12} />
                </span>
              </Link>
            );
          })}
        </div>

        {/* Revenue Chart */}
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl font-semibold text-[#1A2744]">Monthly Revenue</h2>
            <span className="text-xs text-[var(--text-muted)]">Last 6 months</span>
          </div>
          {chartData.length === 0 ? (
            <div className="flex h-60 items-center justify-center text-[var(--text-muted)] text-sm">
              No revenue data available yet.
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(v) => `Rs.${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value) => [`Rs. ${value.toLocaleString()}`, 'Revenue']}
                    contentStyle={{ borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  />
                  <Bar dataKey="revenue" fill="#D4A017" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Quick nav — now 4 columns including School Packs */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Manage Products', to: '/admin/products', desc: 'Add, edit, or remove products from the catalogue.' },
            { label: 'Manage Orders', to: '/admin/orders', desc: 'Track and update order statuses for all customers.' },
            { label: 'Manage Users', to: '/admin/users', desc: 'View registered users and manage access.' },
            { label: 'School Packs', to: '/admin/school-packs', desc: 'Create and manage school book packs with bundled products.' },
          ].map((item) => (
            <Link key={item.to} to={item.to} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition group">
              <div className="flex items-center gap-2 mb-2">
                {item.label === 'School Packs' && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#D4A017]/10">
                    <School size={16} className="text-[#D4A017]" />
                  </div>
                )}
                <p className="font-serif text-lg font-semibold text-[var(--ink)] group-hover:text-[var(--brass)] transition">{item.label}</p>
              </div>
              <p className="mt-2 text-xs text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[var(--brass)]">
                Go <ArrowRight size={12} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
};

export default AdminDashboard;