import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Infinity, User, Mail, Lock, Phone, Building2, MapPin, Globe, AlertCircle, ArrowRight } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    organization: '',
    role: 'Developer',
    location: '',
    linkedin: '',
    github: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields (Name, Email, Password).');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError('');
    setLoading(true);

    const result = await register(formData);
    setLoading(false);

    if (result.success) {
      navigate('/chat'); // Direct to onboarding chat after registering
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-40px)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-6 animate-fade-in">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 to-accent-500 shadow-xl shadow-brand-500/20">
            <Infinity className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Create your account
          </h2>
          <p className="text-sm text-slate-400">
            Join the Kenyan startup matchmaking ecosystem
          </p>
        </div>

        {/* Form Panel */}
        <div className="p-8 rounded-3xl glass-panel-glow border-slate-800">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-center gap-2 p-3 text-xs font-semibold rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Full Name *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><User className="w-4 h-4 text-slate-500" /></div>
                  <input name="name" type="text" required value={formData.name} onChange={handleChange} placeholder="e.g. Amani Mwangi" className="block w-full pl-9 pr-4 py-2.5 bg-slate-950/40 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-650 focus:outline-none focus:border-brand-500" />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Email Address *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><Mail className="w-4 h-4 text-slate-500" /></div>
                  <input name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="e.g. amani@dev.ke" className="block w-full pl-9 pr-4 py-2.5 bg-slate-950/40 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-650 focus:outline-none focus:border-brand-500" />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Password * (Min 6 chars)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><Lock className="w-4 h-4 text-slate-500" /></div>
                  <input name="password" type="password" required value={formData.password} onChange={handleChange} placeholder="••••••••" className="block w-full pl-9 pr-4 py-2.5 bg-slate-950/40 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-650 focus:outline-none focus:border-brand-500" />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><Phone className="w-4 h-4 text-slate-500" /></div>
                  <input name="phone" type="text" value={formData.phone} onChange={handleChange} placeholder="e.g. +254 712 345678" className="block w-full pl-9 pr-4 py-2.5 bg-slate-950/40 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-650 focus:outline-none focus:border-brand-500" />
                </div>
              </div>

              {/* Organization */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Organization / Company</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><Building2 className="w-4 h-4 text-slate-500" /></div>
                  <input name="organization" type="text" value={formData.organization} onChange={handleChange} placeholder="e.g. MiniHack Org" className="block w-full pl-9 pr-4 py-2.5 bg-slate-950/40 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-650 focus:outline-none focus:border-brand-500" />
                </div>
              </div>

              {/* Role SELECT */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider font-medium">Platform Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="block w-full px-4 py-2.5 bg-slate-950/40 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30"
                >
                  <option className="bg-slate-950" value="Developer">Developer</option>
                  <option className="bg-slate-950" value="Founder">Founder</option>
                  <option className="bg-slate-950" value="Mentor">Mentor</option>
                  <option className="bg-slate-950" value="Investor">Investor</option>
                  <option className="bg-slate-950" value="Professional">Professional</option>
                </select>
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Location / City</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><MapPin className="w-4 h-4 text-slate-500" /></div>
                  <input name="location" type="text" value={formData.location} onChange={handleChange} placeholder="e.g. Nairobi, Kenya" className="block w-full pl-9 pr-4 py-2.5 bg-slate-950/40 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-650 focus:outline-none focus:border-brand-500" />
                </div>
              </div>

              {/* LinkedIn */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">LinkedIn Profile URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><Globe className="w-4 h-4 text-slate-500" /></div>
                  <input name="linkedin" type="text" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/..." className="block w-full pl-9 pr-4 py-2.5 bg-slate-950/40 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-650 focus:outline-none focus:border-brand-500" />
                </div>
              </div>

              {/* GitHub */}
              <div className="grid col-span-1 md:col-span-2 space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">GitHub Profile URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><Globe className="w-4 h-4 text-slate-500" /></div>
                  <input name="github" type="text" value={formData.github} onChange={handleChange} placeholder="https://github.com/..." className="block w-full pl-9 pr-4 py-2.5 bg-slate-950/40 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-650 focus:outline-none focus:border-brand-500" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center gap-1.5 py-3 px-4 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-sm font-semibold text-white rounded-xl shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register'}
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-400 hover:text-brand-350 transition-colors">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
