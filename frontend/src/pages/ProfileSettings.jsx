import React, { useContext, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  User, Mail, Phone, Lock, Globe, Link2, AtSign, Video,
  Camera, Save, AlertTriangle, CheckCircle, Eye, EyeOff, Trash2, BookOpen, Star,
} from 'lucide-react';

const API = 'http://localhost:5000/api';

const TABS = [
  { id: 'profile',   label: 'Profile',          icon: User },
  { id: 'account',   label: 'Account & Email',  icon: Mail },
  { id: 'security',  label: 'Password',         icon: Lock },
  { id: 'danger',    label: 'Danger Zone',      icon: AlertTriangle },
];

function Toast({ msg, type }) {
  if (!msg) return null;
  const colors = { success: 'bg-green-50 border-green-400 text-green-700', error: 'bg-red-50 border-red-400 text-red-700' };
  const Icon   = type === 'success' ? CheckCircle : AlertTriangle;
  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl border shadow-lg text-sm font-medium ${colors[type]} animate-fade-in`}>
      <Icon className="w-4 h-4 flex-shrink-0" /> {msg}
    </div>
  );
}

export default function ProfileSettings() {
  const { user, setUser, updateUser } = useContext(AuthContext);
  const navigate          = useNavigate();
  const fileRef           = useRef();

  const [tab,   setTab]   = useState('profile');
  const [profile, setProfile] = useState({
    name: '', bio: '', phone: '', expertise: '', portfolio: '',
    interests: '', website: '', twitter: '', instagram: '', youtube: '',
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile]       = useState(null);

  const [emailForm, setEmailForm]   = useState({ newEmail: '', password: '' });
  const [passForm, setPassForm]     = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [deletePass, setDeletePass] = useState('');
  const [showPass, setShowPass]     = useState({ current: false, new_: false, confirm: false });

  const [toast,   setToast]   = useState({ msg: '', type: 'success' });
  const [loading, setLoading] = useState(false);

  const headers = { Authorization: `Bearer ${user?.token}` };

  // ── Load current profile ─────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    axios.get(`${API}/auth/me`, { headers }).then(r => {
      const u = r.data;
      setProfile({
        name:       u.name       || '',
        bio:        u.bio        || '',
        phone:      u.phone      || '',
        expertise:  u.expertise  || '',
        portfolio:  u.portfolio  || '',
        interests:  u.interests  || '',
        website:    u.website    || '',
        twitter:    u.twitter    || '',
        instagram:  u.instagram  || '',
        youtube:    u.youtube    || '',
      });
      setAvatarPreview(u.profilePhoto || null);
      
      // Also sync the global user context if the profile photo or name changed in the database
      if (u.profilePhoto !== user.profilePhoto || u.name !== user.name) {
        updateUser({ name: u.name, profilePhoto: u.profilePhoto });
      }
    }).catch(console.error);
  }, [user]);

  const notify = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3500);
  };

  // ── Avatar pick ──────────────────────────────────────────────────────────
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // ── Save Profile ─────────────────────────────────────────────────────────
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(profile).forEach(([k, v]) => fd.append(k, v));
      if (avatarFile) fd.append('photo', avatarFile);

      const { data } = await axios.put(`${API}/auth/profile`, fd, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' }
      });
      // Update context and localStorage so Navbar avatar refreshes and persists
      updateUser({ name: data.name, profilePhoto: data.profilePhoto });
      notify('Profile updated successfully!');
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to update profile', 'error');
    }
    setLoading(false);
  };

  // ── Change Email ─────────────────────────────────────────────────────────
  const handleChangeEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.put(`${API}/auth/change-email`, emailForm, { headers });
      updateUser({ email: data.email, token: data.token });
      setEmailForm({ newEmail: '', password: '' });
      notify('Email updated! You may need to sign in again.');
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to update email', 'error');
    }
    setLoading(false);
  };

  // ── Change Password ──────────────────────────────────────────────────────
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      return notify('New passwords do not match', 'error');
    }
    setLoading(true);
    try {
      await axios.put(`${API}/auth/change-password`, {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      }, { headers });
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      notify('Password changed successfully!');
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to change password', 'error');
    }
    setLoading(false);
  };

  // ── Delete Account ───────────────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    if (!window.confirm('This is permanent. Are you absolutely sure?')) return;
    setLoading(true);
    try {
      await axios.delete(`${API}/auth/delete-account`, {
        headers, data: { password: deletePass }
      });
      setUser(null);
      navigate('/');
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to delete account', 'error');
    }
    setLoading(false);
  };

  const isCreator = user?.role === 'Creator';

  return (
    <>
      <style>{`
        @keyframes fade-in { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:none; } }
        .animate-fade-in { animation: fade-in 0.3s ease; }
      `}</style>

      <Toast msg={toast.msg} type={toast.type} />
      <Navbar />

      <div className="min-h-screen bg-[#f8fafc] py-10 px-4">
        <div className="max-w-5xl mx-auto">

          {/* ── Header card ── */}
          <div className="relative bg-gradient-to-r from-blue-600 to-teal-500 rounded-3xl p-8 mb-8 shadow-xl overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 0%, transparent 60%)' }} />
            <div className="relative flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative group flex-shrink-0">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white/30 shadow-lg bg-white/20">
                  {avatarPreview
                    ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white">{user?.name?.[0]?.toUpperCase()}</div>
                  }
                </div>
                <button onClick={() => fileRef.current.click()}
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition">
                  <Camera className="w-4 h-4 text-gray-700" />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>
              <div className="text-white text-center sm:text-left">
                <h1 className="text-2xl font-bold">{profile.name || user?.name}</h1>
                <p className="text-white/70 text-sm mt-1">{user?.email}</p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${isCreator ? 'bg-orange-400 text-white' : 'bg-blue-400 text-white'}`}>
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          {/* ── Layout ── */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <div className="md:w-56 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
                {TABS.map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition mb-0.5 ${tab === t.id ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <t.icon className="w-4 h-4 flex-shrink-0" /> {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">

              {/* ── PROFILE TAB ── */}
              {tab === 'profile' && (
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <Section title="Basic Information" icon={User}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="Full Name" icon={User} value={profile.name} onChange={v => setProfile(p => ({...p, name: v}))} required />
                      <Field label="Mobile Number" icon={Phone} value={profile.phone} onChange={v => setProfile(p => ({...p, phone: v}))} placeholder="+1 234 567 8900" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
                      <textarea rows={3} value={profile.bio} onChange={e => setProfile(p => ({...p, bio: e.target.value}))}
                        placeholder="Tell the world about yourself…"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none" />
                    </div>
                  </Section>

                  {isCreator && (
                    <Section title="Creator Details" icon={Star}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Expertise / Speciality" icon={BookOpen} value={profile.expertise} onChange={v => setProfile(p => ({...p, expertise: v}))} placeholder="e.g. Pottery, Digital Art" />
                        <Field label="Portfolio URL" icon={Globe} value={profile.portfolio} onChange={v => setProfile(p => ({...p, portfolio: v}))} placeholder="https://yourportfolio.com" />
                      </div>
                    </Section>
                  )}

                  {!isCreator && (
                    <Section title="Learning Interests" icon={BookOpen}>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Interests</label>
                        <textarea rows={2} value={profile.interests} onChange={e => setProfile(p => ({...p, interests: e.target.value}))}
                          placeholder="e.g. Painting, Cooking, Web Design…"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none" />
                      </div>
                    </Section>
                  )}

                  <Section title="Social Links" icon={Globe}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="Website" icon={Globe}   value={profile.website}   onChange={v => setProfile(p => ({...p, website: v}))}   placeholder="https://yoursite.com" />
                      <Field label="Twitter / X" icon={AtSign}  value={profile.twitter}   onChange={v => setProfile(p => ({...p, twitter: v}))}   placeholder="@username" />
                      <Field label="Instagram" icon={Link2}   value={profile.instagram} onChange={v => setProfile(p => ({...p, instagram: v}))} placeholder="@username" />
                      <Field label="YouTube"   icon={Video}   value={profile.youtube}   onChange={v => setProfile(p => ({...p, youtube: v}))}   placeholder="Channel URL" />
                    </div>
                  </Section>

                  <div className="flex justify-end">
                    <button type="submit" disabled={loading}
                      className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition shadow disabled:opacity-50">
                      <Save className="w-4 h-4" /> {loading ? 'Saving…' : 'Save Profile'}
                    </button>
                  </div>
                </form>
              )}

              {/* ── ACCOUNT TAB ── */}
              {tab === 'account' && (
                <Section title="Change Email Address" icon={Mail}>
                  <p className="text-sm text-gray-500 mb-4">Your current email: <strong>{user?.email}</strong></p>
                  <form onSubmit={handleChangeEmail} className="space-y-4">
                    <Field label="New Email Address" icon={Mail} type="email" required
                      value={emailForm.newEmail} onChange={v => setEmailForm(p => ({...p, newEmail: v}))} placeholder="new@email.com" />
                    <Field label="Current Password (to confirm)" icon={Lock} type="password" required
                      value={emailForm.password} onChange={v => setEmailForm(p => ({...p, password: v}))} placeholder="••••••••" />
                    <div className="flex justify-end">
                      <button type="submit" disabled={loading}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition shadow disabled:opacity-50">
                        <Mail className="w-4 h-4" /> {loading ? 'Updating…' : 'Update Email'}
                      </button>
                    </div>
                  </form>
                </Section>
              )}

              {/* ── SECURITY TAB ── */}
              {tab === 'security' && (
                <Section title="Change Password" icon={Lock}>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <PasswordField label="Current Password" value={passForm.currentPassword} show={showPass.current}
                      onToggle={() => setShowPass(p => ({...p, current: !p.current}))}
                      onChange={v => setPassForm(p => ({...p, currentPassword: v}))} />
                    <PasswordField label="New Password" value={passForm.newPassword} show={showPass.new_}
                      onToggle={() => setShowPass(p => ({...p, new_: !p.new_}))}
                      onChange={v => setPassForm(p => ({...p, newPassword: v}))} />
                    <PasswordField label="Confirm New Password" value={passForm.confirmPassword} show={showPass.confirm}
                      onToggle={() => setShowPass(p => ({...p, confirm: !p.confirm}))}
                      onChange={v => setPassForm(p => ({...p, confirmPassword: v}))} />

                    {/* Password strength indicator */}
                    {passForm.newPassword && (
                      <div>
                        <div className="flex gap-1 mt-1">
                          {[1,2,3,4].map(i => (
                            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${
                              passForm.newPassword.length >= i * 3
                                ? i <= 1 ? 'bg-red-400' : i <= 2 ? 'bg-yellow-400' : i <= 3 ? 'bg-blue-400' : 'bg-green-400'
                                : 'bg-gray-100'
                            }`} />
                          ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {passForm.newPassword.length < 6 ? 'Too short' : passForm.newPassword.length < 9 ? 'Moderate' : passForm.newPassword.length < 12 ? 'Strong' : 'Very strong'}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-end pt-2">
                      <button type="submit" disabled={loading}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition shadow disabled:opacity-50">
                        <Lock className="w-4 h-4" /> {loading ? 'Changing…' : 'Change Password'}
                      </button>
                    </div>
                  </form>
                </Section>
              )}

              {/* ── DANGER ZONE TAB ── */}
              {tab === 'danger' && (
                <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
                  <div className="p-6 border-b border-red-100 bg-red-50">
                    <h2 className="text-lg font-bold text-red-700 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" /> Danger Zone
                    </h2>
                    <p className="text-sm text-red-500 mt-1">These actions are permanent and cannot be undone.</p>
                  </div>
                  <div className="p-6">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                      <h3 className="font-bold text-red-700 mb-1">Delete My Account</h3>
                      <p className="text-sm text-red-500 mb-4">All your data — workshops, orders, profile, and materials — will be permanently removed from our servers.</p>
                      <div className="space-y-3">
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                          <input type="password" placeholder="Enter your password to confirm" value={deletePass}
                            onChange={e => setDeletePass(e.target.value)}
                            className="w-full border border-red-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400" />
                        </div>
                        <button onClick={handleDeleteAccount} disabled={!deletePass || loading}
                          className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition shadow disabled:opacity-40">
                          <Trash2 className="w-4 h-4" /> {loading ? 'Deleting…' : 'Permanently Delete Account'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────
function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" />
        <h2 className="text-base font-bold text-gray-800">{title}</h2>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, icon: Icon, value, onChange, type = 'text', placeholder = '', required = false }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />}
        <input type={type} value={value} onChange={e => onChange(e.target.value)} required={required}
          placeholder={placeholder}
          className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
      </div>
    </div>
  );
}

function PasswordField({ label, value, onChange, show, onToggle }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        <input type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)} required
          placeholder="••••••••"
          className="w-full border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
        <button type="button" onClick={onToggle} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
