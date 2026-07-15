import { useState, useEffect } from 'react';
import { useAuthState, useAuthDispatch } from '../hooks/useAuth.js';
import api from '../services/api.js';
import { toast } from 'react-hot-toast';

const ProfilePage = () => {
  const { user } = useAuthState();
  const dispatch = useAuthDispatch();

  // Profile fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  // Address fields
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      if (user.address) {
        setStreet(user.address.street || '');
        setCity(user.address.city || '');
        setProvince(user.address.province || '');
        setPostalCode(user.address.postalCode || '');
        setCountry(user.address.country || '');
      }
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const address = { street, city, province, postalCode, country };
      const { data } = await api.put('/auth/me', { name, phone, address });
      if (data.success) {
        dispatch({ type: 'UPDATE_USER', payload: data.data });
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setPasswordLoading(true);
    try {
      const { data } = await api.put('/auth/change-password', { currentPassword, newPassword });
      if (data.success) {
        toast.success('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#FAF8F3]">
        <p className="text-lg text-[var(--text-muted)]">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <main className="bg-[#FAF8F3] text-[#2C2C2C]">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="font-serif text-3xl font-semibold text-[#1A2744]">Your Profile</h1>
            <form className="mt-6 space-y-5" onSubmit={handleUpdateProfile}>
              <label className="block text-sm font-medium text-slate-700">
                Name
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-[#FAF8F3] px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-[#D4A017]"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Email (Cannot be changed)
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-100 px-5 py-3 text-sm outline-none cursor-not-allowed"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Phone
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-[#FAF8F3] px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-[#D4A017]"
                />
              </label>

              <h2 className="mt-8 font-serif text-xl font-semibold text-[#1A2744]">Shipping Address</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
                  Street Address
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="House number, street name, sector/area"
                    className="mt-2 w-full rounded-3xl border border-slate-200 bg-[#FAF8F3] px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-[#D4A017]"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  City
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Lahore"
                    className="mt-2 w-full rounded-3xl border border-slate-200 bg-[#FAF8F3] px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-[#D4A017]"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Province
                  <input
                    type="text"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    placeholder="Punjab"
                    className="mt-2 w-full rounded-3xl border border-slate-200 bg-[#FAF8F3] px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-[#D4A017]"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Postal Code
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="54000"
                    className="mt-2 w-full rounded-3xl border border-slate-200 bg-[#FAF8F3] px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-[#D4A017]"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Country
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Pakistan"
                    className="mt-2 w-full rounded-3xl border border-slate-200 bg-[#FAF8F3] px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-[#D4A017]"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-4 rounded-3xl bg-[#D4A017] px-6 py-3 text-sm font-semibold text-[#1A2744] hover:bg-[#c39220] transition disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="font-serif text-xl font-semibold text-[#1A2744]">Change Password</h2>
              <form className="mt-4 space-y-4" onSubmit={handleChangePassword}>
                <label className="block text-sm font-medium text-slate-700">
                  Current Password
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-slate-200 bg-[#FAF8F3] px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-[#D4A017]"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  New Password
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-slate-200 bg-[#FAF8F3] px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-[#D4A017]"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Confirm New Password
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-slate-200 bg-[#FAF8F3] px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-[#D4A017]"
                  />
                </label>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full rounded-3xl border border-[#D4A017] bg-white px-6 py-3 text-sm font-semibold text-[#1A2744] hover:bg-[#FAF8F3] transition disabled:opacity-50"
                >
                  {passwordLoading ? 'Updating...' : 'Change Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProfilePage;
