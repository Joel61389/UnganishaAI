import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, Plus, X, Save, AlertCircle, Award, Target, HelpCircle, Layers } from 'lucide-react';

export default function Profile() {
  const { refreshProfile } = useAuth();
  const [profile, setProfile] = useState({
    bio: '',
    industry: '',
    experience_years: 0,
    skills: [],
    interests: [],
    goals: [],
    challenges: []
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  
  // Temporary input state for adding tags
  const [inputs, setInputs] = useState({
    skill: '',
    interest: '',
    goal: '',
    challenge: ''
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/profile');
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setStatusMsg({ type: 'error', text: 'Could not fetch profile. Have you completed onboarding?' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (field, val) => {
    setProfile(prev => ({ ...prev, [field]: val }));
  };

  const handleTagInput = (field, val) => {
    setInputs(prev => ({ ...prev, [field]: val }));
  };

  const handleAddTag = (listField, inputKey) => {
    const value = inputs[inputKey].trim();
    if (!value) return;
    
    // Prevent duplicates
    if (!profile[listField].includes(value)) {
      setProfile(prev => ({
        ...prev,
        [listField]: [...prev[listField], value]
      }));
    }
    
    setInputs(prev => ({ ...prev, [inputKey]: '' }));
  };

  const handleRemoveTag = (listField, tagToRemove) => {
    setProfile(prev => ({
      ...prev,
      [listField]: prev[listField].filter(t => t !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const response = await axios.put('/profile', profile);
      setProfile(response.data);
      setStatusMsg({ type: 'success', text: 'Profile updated successfully! Recommendation engine matches regenerated.' });
      
      // Refresh Auth Context user info
      await refreshProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      setStatusMsg({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 max-w-5xl mx-auto">
        <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm">Fetching profile configurations...</p>
      </div>
    );
  }

  const TagSection = ({ label, listField, inputKey, placeholder, icon: Icon, color }) => (
    <div className="p-5 rounded-2xl bg-slate-900/20 border border-slate-850 space-y-3">
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      
      {/* Existing Tags */}
      <div className="flex flex-wrap gap-1.5 min-h-[32px]">
        {profile[listField]?.map((tag, idx) => (
          <span 
            key={idx} 
            className="flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300"
          >
            {tag}
            <button 
              type="button" 
              onClick={() => handleRemoveTag(listField, tag)}
              className="p-0.5 text-slate-500 hover:text-rose-400 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>

      {/* Input row */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputs[inputKey]}
          onChange={(e) => handleTagInput(inputKey, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddTag(listField, inputKey);
            }
          }}
          placeholder={placeholder}
          className="flex-1 px-3 py-1.5 bg-slate-950/40 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
        />
        <button
          type="button"
          onClick={() => handleAddTag(listField, inputKey)}
          className="p-2 bg-slate-900 hover:bg-brand-500/10 text-brand-400 border border-slate-800 hover:border-brand-500/25 rounded-xl transition-all"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <User className="w-6 h-6 text-brand-400" />
            Profile Configuration
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">Inspect and adjust your structured data profile inputs to fine-tune recommendation parameters.</p>
        </div>
      </div>

      {statusMsg.text && (
        <div className={`flex items-center gap-2 p-3 text-xs font-semibold rounded-xl border ${
          statusMsg.type === 'success'
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
        }`}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 rounded-2xl glass-panel-glow border-slate-800 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Industry */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Primary Industry</label>
              <input
                type="text"
                value={profile.industry || ''}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                placeholder="e.g. FinTech, AgriTech, EdTech"
                className="block w-full px-4 py-2.5 bg-slate-950/40 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-650 focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Experience Years */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Years of Experience</label>
              <input
                type="number"
                min="0"
                max="50"
                value={profile.experience_years || 0}
                onChange={(e) => handleInputChange('experience_years', parseInt(e.target.value) || 0)}
                className="block w-full px-4 py-2.5 bg-slate-950/40 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Bio (Colspan-2) */}
            <div className="grid col-span-1 md:col-span-2 space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Bio Summary</label>
              <textarea
                rows={3}
                value={profile.bio || ''}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Write a brief professional summary..."
                className="block w-full px-4 py-2.5 bg-slate-950/40 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-650 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Tag Editors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TagSection 
            label="My Core Skills" 
            listField="skills" 
            inputKey="skill" 
            placeholder="Add skill (e.g. FastAPI, Flutter, UI/UX)" 
            icon={Award} 
            color="text-brand-400"
          />

          <TagSection 
            label="Active Goals" 
            listField="goals" 
            inputKey="goal" 
            placeholder="Add goal (e.g. Find Co-founder, Funding)" 
            icon={Target} 
            color="text-accent-400"
          />

          <TagSection 
            label="Current Challenges" 
            listField="challenges" 
            inputKey="challenge" 
            placeholder="Add roadblock (e.g. Need marketing support)" 
            icon={HelpCircle} 
            color="text-amber-400"
          />

          <TagSection 
            label="Ecosystem Interests" 
            listField="interests" 
            inputKey="interest" 
            placeholder="Add sector interest (e.g. AI, Climate Tech)" 
            icon={Layers} 
            color="text-violet-400"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full flex justify-center items-center gap-1.5 py-3 px-4 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-sm font-semibold text-white rounded-xl shadow-lg transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving changes...' : 'Save Configuration'}
        </button>
      </form>
    </div>
  );
}
