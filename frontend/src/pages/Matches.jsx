import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  MapPin, 
  Briefcase, 
  Activity, 
  ChevronDown, 
  ChevronUp, 
  MessageSquareShare,
  Sparkles,
  Link2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedMatchId, setExpandedMatchId] = useState(null);
  const [requestingIntroId, setRequestingIntroId] = useState(null);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/matches');
      setMatches(response.data);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleGenerateMatches = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/matches/generate');
      setMatches(response.data.matches);
    } catch (error) {
      console.error('Error generating matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestIntroduction = async (matchId) => {
    try {
      setRequestingIntroId(matchId);
      await axios.post('/introductions', { match_id: matchId });
      // Update the status of this match locally
      setMatches(prev => prev.map(m => {
        if (m.id === matchId) {
          return { ...m, status: 'introduced' };
        }
        return m;
      }));
    } catch (error) {
      console.error('Error requesting introduction:', error);
    } finally {
      setRequestingIntroId(null);
    }
  };

  const toggleExpand = (matchId) => {
    if (expandedMatchId === matchId) {
      setExpandedMatchId(null);
    } else {
      setExpandedMatchId(matchId);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-400" />
            Ecosystem Matches
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">AI-powered recommendations based on your goals, skills, and industry compatibility.</p>
        </div>
        <button
          onClick={handleGenerateMatches}
          disabled={loading}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 border border-slate-800 hover:border-brand-500/30 rounded-xl transition-all shadow-md hover:bg-slate-800/60 disabled:opacity-50"
        >
          Regenerate Matches
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Computing matching similarities...</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-slate-800 p-8">
          <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-white font-semibold text-lg">No matches found yet</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">Make sure to complete the chatbot onboarding or fill out your profile details so the AI can run compatibility vectors.</p>
          <div className="mt-6 flex justify-center gap-4">
            <Link to="/chat" className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl transition-all">
              Go to Chat Onboarding
            </Link>
            <Link to="/profile" className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl transition-all hover:bg-slate-800">
              Edit My Profile
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {matches.map((match) => {
            const candidate = match.other_user;
            const isExpanded = expandedMatchId === match.id;
            const hasIntroduced = match.status === 'introduced';
            
            return (
              <div 
                key={match.id} 
                className="rounded-2xl glass-card overflow-hidden border border-slate-850"
              >
                {/* Main Card Header */}
                <div className="p-5 flex items-start gap-4 flex-col sm:flex-row justify-between">
                  <div className="flex gap-4">
                    {/* User Initials Circle */}
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white bg-gradient-to-tr from-brand-600/30 to-accent-600/30 border border-brand-500/25 shrink-0 shadow-lg">
                      {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-white">{candidate.name}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase bg-slate-900 text-brand-400 border border-brand-500/20">
                          {candidate.role}
                        </span>
                      </div>
                      
                      {/* Meta Information */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-1.5 text-xs text-slate-400">
                        {candidate.organization && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                            {candidate.organization}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          {candidate.location || 'Kenya'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Activity className="w-3.5 h-3.5 text-slate-500" />
                          {candidate.bio ? `${candidate.bio.substring(0, 50)}...` : 'No bio provided'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Similarity Score & Button */}
                  <div className="flex items-center gap-4 self-end sm:self-auto shrink-0 mt-4 sm:mt-0">
                    <div className="text-right">
                      <span className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Match Score</span>
                      <span className="text-2xl font-bold text-white flex items-baseline gap-0.5">
                        {match.score}
                        <span className="text-xs text-brand-400 font-normal">%</span>
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      {hasIntroduced ? (
                        <Link
                          to="/introductions"
                          className="px-4 py-2.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition-all flex items-center gap-1.5"
                        >
                          Introduced
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleRequestIntroduction(match.id)}
                          disabled={requestingIntroId === match.id}
                          className="px-4 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 rounded-xl shadow-lg hover:shadow-brand-500/25 transition-all flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <MessageSquareShare className="w-3.5 h-3.5" />
                          {requestingIntroId === match.id ? 'Connecting...' : 'Connect & Introduce'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Visual Bar */}
                <div className="h-1 bg-slate-900">
                  <div 
                    className="h-full bg-gradient-to-r from-brand-500 to-accent-500"
                    style={{ width: `${match.score}%` }}
                  />
                </div>

                {/* Expand Toggle */}
                <button
                  onClick={() => toggleExpand(match.id)}
                  className="flex items-center justify-between w-full px-5 py-2.5 bg-slate-900/20 border-t border-slate-850 text-xs text-slate-400 hover:text-white transition-all font-medium"
                >
                  <span className="flex items-center gap-1 text-slate-500">
                    <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                    Why did we match?
                  </span>
                  {isExpanded ? (
                    <span className="flex items-center gap-1">Collapse Details <ChevronUp className="w-3.5 h-3.5" /></span>
                  ) : (
                    <span className="flex items-center gap-1">Expand Details <ChevronDown className="w-3.5 h-3.5" /></span>
                  )}
                </button>

                {/* Expandable Details Area */}
                {isExpanded && (
                  <div className="p-5 bg-slate-900/30 border-t border-slate-850 space-y-4 animate-fade-in text-sm text-slate-300">
                    {/* Reason List */}
                    <div>
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Match Analysis</h5>
                      <ul className="space-y-1.5">
                        {match.reason.map((res, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs">
                            <span className="text-brand-500 font-bold">•</span>
                            <span>{res}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Candidate's Bio Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Bio, Skills */}
                      <div className="space-y-3">
                        {candidate.bio && (
                          <div>
                            <span className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Bio</span>
                            <p className="text-xs mt-1 text-slate-400 leading-relaxed">{candidate.bio}</p>
                          </div>
                        )}
                        {candidate.skills && candidate.skills.length > 0 && (
                          <div>
                            <span className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Key Skills</span>
                            <div className="flex flex-wrap gap-1">
                              {candidate.skills.map((s, idx) => (
                                <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-850 text-slate-300 border border-slate-800">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Goals, Interests */}
                      <div className="space-y-3">
                        {candidate.goals && candidate.goals.length > 0 && (
                          <div>
                            <span className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Active Goals</span>
                            <div className="flex flex-wrap gap-1">
                              {candidate.goals.map((g, idx) => (
                                <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-medium bg-brand-500/10 text-brand-300 border border-brand-500/10">
                                  {g}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {candidate.interests && candidate.interests.length > 0 && (
                          <div>
                            <span className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Interests & Sectors</span>
                            <div className="flex flex-wrap gap-1">
                              {candidate.interests.map((intr, idx) => (
                                <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-medium bg-accent-500/10 text-accent-300 border border-accent-500/10">
                                  {intr}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Socials / Links */}
                    <div className="flex gap-4 pt-2 text-xs text-slate-500 border-t border-slate-850">
                      {candidate.linkedin && (
                        <a href={candidate.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white transition-all">
                          <Link2 className="w-3.5 h-3.5 text-slate-500" /> LinkedIn
                        </a>
                      )}
                      {candidate.github && (
                        <a href={candidate.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white transition-all">
                          <Link2 className="w-3.5 h-3.5 text-slate-500" /> GitHub
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
