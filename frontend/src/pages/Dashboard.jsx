import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  MessageSquare, 
  Users, 
  Inbox, 
  ArrowRight,
  Coins
} from 'lucide-react';

export default function Dashboard() {
  const { user, walletAddress, usdcBalance } = useAuth();
  const [stats, setStats] = useState({ matchesCount: 0, introsCount: 0, escrowCount: 0 });
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
        const escrowedCount = introsRes.data.filter(i => i.payment_status === 'escrowed').length;
        
        setStats({
          matchesCount: matchesRes.data.length,
          introsCount: introsRes.data.length,
          escrowCount: escrowedCount
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

  const labelClass = "text-[11px] font-inter font-medium text-driftwood uppercase tracking-[0.08em]";

  return (
    <div className="space-y-12 animate-fade-in max-w-[1200px] mx-auto px-6 py-12">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-4 max-w-2xl">
          <span className={labelClass}>
            Platform Dashboard
          </span>
          <h2 className="font-waldenburg text-[36px] font-light leading-[1.13] tracking-[-0.02em] text-midnight-ink">Habari, {user?.name}!</h2>
          <p className="text-[14px] text-driftwood font-inter leading-relaxed">
            Welcome to Unganisha AI. We help discover hidden opportunities, jobs, collaborators, and mentorships by mapping compatibility indices within the MiniHack and Unganisha ecosystems.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-[3px] border-ash-border border-t-midnight-ink rounded-full animate-spin"></div>
          <p className="text-[13px] text-driftwood font-inter">Synchronizing your dashboard...</p>
        </div>
      ) : !hasProfile ? (
        /* Onboarding Prompt Block */
        <div className="p-8 md:p-12 rounded-[20px] bg-warm-sand text-center space-y-6 max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white border border-ash-border shadow-sm mb-2">
            <MessageSquare className="w-6 h-6 text-midnight-ink" />
          </div>
          <div className="space-y-3">
            <h3 className="font-waldenburg text-[24px] font-light tracking-[-0.02em] text-midnight-ink">Complete Your Chat Onboarding</h3>
            <p className="text-[14px] text-driftwood font-inter leading-relaxed max-w-md mx-auto">
              Our AI chatbot needs to learn about your skills, current goals, challenges, and interests to map out match scoring vectors. Let's start the dialogue.
            </p>
          </div>
          <Link
            to="/chat"
            className="inline-flex items-center gap-2 py-3 px-6 bg-midnight-ink text-white text-[14px] font-inter font-medium rounded-full hover:opacity-90 transition-all cursor-pointer"
          >
            Start Conversational Onboarding
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        /* Main Dashboard View */
        <div className="space-y-8">
          {/* Quick Counter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Matches Box */}
            <Link 
              to="/matches" 
              className="p-6 rounded-[20px] bg-warm-sand flex items-center justify-between group cursor-pointer transition-transform hover:-translate-y-0.5"
            >
              <div className="space-y-2">
                <span className={labelClass}>Ecosystem Matches</span>
                <span className="font-waldenburg text-[48px] font-light leading-[1.08] tracking-[-0.96px] text-midnight-ink block">{stats.matchesCount}</span>
                <span className="text-[13px] text-midnight-ink font-inter hover:opacity-70 transition-opacity flex items-center gap-1.5 pt-1">
                  View recommendations <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
              <div className="p-3 bg-white rounded-full border border-ash-border shadow-sm text-midnight-ink">
                <Users className="w-6 h-6 stroke-[1.5]" />
              </div>
            </Link>

            {/* Introductions Box */}
            <Link 
              to="/introductions" 
              className="p-6 rounded-[20px] bg-warm-sand flex items-center justify-between group cursor-pointer transition-transform hover:-translate-y-0.5"
            >
              <div className="space-y-2">
                <span className={labelClass}>Introductions facilitated</span>
                <span className="font-waldenburg text-[48px] font-light leading-[1.08] tracking-[-0.96px] text-midnight-ink block">{stats.introsCount}</span>
                <span className="text-[13px] text-midnight-ink font-inter hover:opacity-70 transition-opacity flex items-center gap-1.5 pt-1">
                  Manage active connections <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
              <div className="p-3 bg-white rounded-full border border-ash-border shadow-sm text-midnight-ink">
                <Inbox className="w-6 h-6 stroke-[1.5]" />
              </div>
            </Link>

            {/* USDC Escrow Box */}
            <div 
              className="p-6 rounded-[20px] bg-warm-sand flex items-center justify-between"
            >
              <div className="space-y-2">
                <span className={labelClass}>USDC in Fuji Escrow</span>
                <span className="font-waldenburg text-[48px] font-light leading-[1.08] tracking-[-0.96px] text-midnight-ink block">{stats.escrowCount * 5}</span>
                <span className="text-[13px] text-driftwood font-inter flex items-center gap-1.5 pt-1">
                  Active balance: {usdcBalance} USDC
                </span>
              </div>
              <div className="p-3 bg-white rounded-full border border-ash-border shadow-sm text-midnight-ink">
                <Coins className="w-6 h-6 stroke-[1.5]" />
              </div>
            </div>
          </div>

          {/* Top Matches Table Card */}
          <div className="p-8 rounded-[24px] bg-warm-sand space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-ash-border">
              <div className="space-y-1">
                <h4 className="font-inter text-[16px] font-medium text-midnight-ink">Top Compatible Profiles</h4>
                <p className="text-[13px] text-driftwood font-inter">Top generated recommendations based on your current configuration settings.</p>
              </div>
              <Link to="/matches" className="text-[13px] font-inter text-midnight-ink hover:opacity-70 transition-opacity">
                See all matches
              </Link>
            </div>

            {recentMatches.length === 0 ? (
              <p className="text-center py-10 text-[13px] text-driftwood font-inter">Generating initial recommendations. If empty, check your matches page to regenerate.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-inter">
                  <thead>
                    <tr className="border-b border-ash-border/50">
                      <th className={`py-3 ${labelClass}`}>Name</th>
                      <th className={`py-3 ${labelClass}`}>Ecosystem Role</th>
                      <th className={`py-3 ${labelClass}`}>Organization</th>
                      <th className={`py-3 text-right ${labelClass}`}>Similarity Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ash-border/50">
                    {recentMatches.map((match) => {
                      const candidate = match.other_user;
                      return (
                        <tr key={match.id} className="hover:bg-white/50 transition-colors">
                          <td className="py-4 text-[14px] font-medium text-midnight-ink">{candidate.name}</td>
                          <td className="py-4">
                            <span className="px-2.5 py-1 rounded-[14px] text-[11px] font-medium bg-white border border-ash-border text-midnight-ink">
                              {candidate.role}
                            </span>
                          </td>
                          <td className="py-4 text-[14px] text-driftwood">{candidate.organization || 'N/A'}</td>
                          <td className="py-4 text-right">
                            <span className="font-geist-mono text-[13px] text-midnight-ink">{match.score}%</span>
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
