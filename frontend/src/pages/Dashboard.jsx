import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Infinity, 
  MessageSquare, 
  Users, 
  Inbox, 
  Sparkles, 
  ArrowRight,
  UserCheck,
  CheckCircle2
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ matchesCount: 0, introsCount: 0 });
  const [recentMatches, setRecentMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Check if profile exists
      let profileExists = false;
      try {
        const profRes = await axios.get('/profile');
        if (profRes.data && profRes.data.skills && profRes.data.skills.length > 0) {
          profileExists = true;
          setHasProfile(true);
        }
      } catch (err) {
        console.log("Profile check failed - onboarding not done yet.");
      }

      if (profileExists) {
        // Fetch matches
        const matchesRes = await axios.get('/matches');
        setRecentMatches(matchesRes.data.slice(0, 3)); // Top 3
        
        // Fetch introductions
        const introsRes = await axios.get('/introductions');
        
        setStats({
          matchesCount: matchesRes.data.length,
          introsCount: introsRes.data.length
        });
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel-glow border-brand-500/20 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2 z-10 max-w-xl">
          <span className="flex items-center gap-1 text-[10px] text-brand-400 font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            Platform Dashboard
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Habari, {user?.name}!</h2>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
            Welcome to Unganisha AI. We help discover hidden opportunities, jobs, collaborators, and mentorships by mapping compatibility indices within the MiniHack and Kuzana ecosystems.
          </p>
        </div>
        <div className="hidden md:block absolute right-0 top-0 w-48 h-full bg-gradient-to-l from-brand-500/5 to-transparent pointer-events-none" />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Synchronizing your dashboard...</p>
        </div>
      ) : !hasProfile ? (
        /* Onboarding Prompt Block */
        <div className="p-8 rounded-3xl glass-panel border-slate-800 text-center space-y-6 max-w-2xl mx-auto border-dashed">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 mb-2">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Complete Your Chat Onboarding</h3>
            <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
              Our AI chatbot needs to learn about your skills, current goals, challenges, and interests to map out match scoring vectors. Let's start the dialogue.
            </p>
          </div>
          <Link
            to="/chat"
            className="inline-flex items-center gap-1.5 py-3 px-6 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-sm font-semibold text-white rounded-xl shadow-lg transition-all"
          >
            Start Conversational Onboarding
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        /* Main Dashboard View */
        <div className="space-y-6">
          {/* Quick Counter Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Matches Box */}
            <Link 
              to="/matches" 
              className="p-5 rounded-2xl glass-card border border-slate-850 flex items-center justify-between group"
            >
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Ecosystem Matches</span>
                <span className="text-3xl font-extrabold text-white block">{stats.matchesCount}</span>
                <span className="text-xs text-brand-400 font-semibold group-hover:text-brand-300 transition-colors flex items-center gap-1">
                  View recommendations <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
                <Users className="w-6 h-6" />
              </div>
            </Link>

            {/* Introductions Box */}
            <Link 
              to="/introductions" 
              className="p-5 rounded-2xl glass-card border border-slate-850 flex items-center justify-between group"
            >
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Introductions facilitated</span>
                <span className="text-3xl font-extrabold text-white block">{stats.introsCount}</span>
                <span className="text-xs text-accent-400 font-semibold group-hover:text-accent-300 transition-colors flex items-center gap-1">
                  Manage active connections <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-accent-500/10 border border-accent-500/20 text-accent-400">
                <Inbox className="w-6 h-6" />
              </div>
            </Link>
          </div>

          {/* Top Matches Table Card */}
          <div className="p-6 rounded-2xl glass-panel border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-850">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Top Compatible Profiles</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Top generated recommendations based on your current configuration settings.</p>
              </div>
              <Link to="/matches" className="text-xs text-brand-400 hover:text-brand-300 transition-all font-semibold">
                See all matches
              </Link>
            </div>

            {recentMatches.length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-500">Generating initial recommendations. If empty, click regenerate matches.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead>
                    <tr className="border-b border-slate-850 text-slate-500">
                      <th className="py-2.5 font-bold uppercase tracking-wider">Name</th>
                      <th className="py-2.5 font-bold uppercase tracking-wider">Ecosystem Role</th>
                      <th className="py-2.5 font-bold uppercase tracking-wider">Organization</th>
                      <th className="py-2.5 font-bold uppercase tracking-wider text-right">Similarity Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/40">
                    {recentMatches.map((match) => {
                      const candidate = match.other_user;
                      return (
                        <tr key={match.id} className="hover:bg-slate-900/10 transition-colors">
                          <td className="py-3 font-semibold text-white">{candidate.name}</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-slate-900 text-brand-450 border border-brand-500/10">
                              {candidate.role}
                            </span>
                          </td>
                          <td className="py-3 text-slate-400">{candidate.organization || 'N/A'}</td>
                          <td className="py-3 text-right">
                            <span className="font-mono text-sm font-bold text-white">{match.score}%</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
