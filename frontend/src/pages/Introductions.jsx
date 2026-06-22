import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Inbox, 
  Copy, 
  Check, 
  Star, 
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Handshake
} from 'lucide-react';

export default function Introductions() {
  const [introductions, setIntroductions] = useState([]);
  const [feedbacks, setFeedbacks] = useState({}); // Stores feedback ratings locally
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [submittingFeedbackId, setSubmittingFeedbackId] = useState(null);

  const fetchIntroductions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/introductions');
      setIntroductions(response.data);
      
      // Fetch user's previous feedbacks to pre-fill the forms
      const feedbackResponse = await axios.get('/feedback');
      const fbMap = {};
      feedbackResponse.data.forEach(fb => {
        fbMap[fb.introduction_id] = {
          rating: fb.rating,
          comments: fb.comments,
          would_collaborate: fb.would_collaborate,
          verified: fb.verified,
          submitted: true
        };
      });
      setFeedbacks(fbMap);
    } catch (error) {
      console.error('Error fetching introductions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntroductions();
  }, []);

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFeedbackChange = (introId, field, value) => {
    setFeedbacks(prev => ({
      ...prev,
      [introId]: {
        ...prev[introId],
        [field]: value
      }
    }));
  };

  const handleSubmitFeedback = async (introId) => {
    const fb = feedbacks[introId];
    if (!fb || !fb.rating) {
      alert("Please select a rating before submitting!");
      return;
    }

    try {
      setSubmittingFeedbackId(introId);
      await axios.post('/feedback', {
        introduction_id: introId,
        rating: fb.rating,
        comments: fb.comments || "",
        would_collaborate: fb.would_collaborate || false,
        verified: fb.verified || false
      });
      
      setFeedbacks(prev => ({
        ...prev,
        [introId]: {
          ...prev[introId],
          submitted: true
        }
      }));
      
      // Re-fetch introductions to update verified status banner
      fetchIntroductions();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setSubmittingFeedbackId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Inbox className="w-6 h-6 text-brand-400" />
            Warm Introductions
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">Your generated introduction messages. Copy them to facilitate email/WhatsApp introductions.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Loading active introductions...</p>
        </div>
      ) : introductions.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-slate-800 p-8">
          <Inbox className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-white font-semibold text-lg">No introductions generated yet</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">Browse your ecosystem recommendations on the matches page and trigger a connection to see warm introductions appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {introductions.map((intro) => {
            const fb = feedbacks[intro.id] || { rating: 0, comments: '', would_collaborate: false, verified: false, submitted: false };
            const match = intro.match_details || {};
            
            return (
              <div 
                key={intro.id}
                className="rounded-2xl glass-panel-glow border-slate-800 overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-800/80"
              >
                {/* Left Side: Introduction Message */}
                <div className="flex-1 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Introduction Facilitated</span>
                      <h4 className="text-sm font-bold text-white mt-0.5">
                        {match.other_user_name} ({match.other_user_role})
                      </h4>
                    </div>
                    
                    <button
                      onClick={() => handleCopy(intro.id, intro.introduction_message)}
                      className="p-2 bg-slate-900 border border-slate-800 hover:border-brand-500/30 text-slate-400 hover:text-white rounded-lg transition-all"
                      title="Copy introduction to clipboard"
                    >
                      {copiedId === intro.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="relative">
                    <pre className="p-4 bg-slate-950/70 border border-slate-900 rounded-xl text-slate-300 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
                      {intro.introduction_message}
                    </pre>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Generated {new Date(intro.created_at).toLocaleDateString()}</span>
                    {intro.accepted && (
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold uppercase tracking-wider">
                        <Check className="w-3.5 h-3.5" /> Introduction Verified Useful
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Side: Feedback Form */}
                <div className="w-full md:w-80 p-6 bg-slate-900/10 space-y-5">
                  <div>
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                      Feedback Loop
                    </h5>
                    <p className="text-[10px] text-slate-500 mt-0.5">Help us learn and improve future recommendations.</p>
                  </div>

                  {fb.submitted ? (
                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 space-y-2 text-center">
                      <ThumbsUp className="w-8 h-8 text-emerald-500/80 mx-auto mb-1 animate-bounce" />
                      <h6 className="text-xs font-bold text-white">Feedback Submitted!</h6>
                      <p className="text-[10px] text-slate-400">Thank you for rating. Your response updates the system learning loop parameters in real time.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Q1: Was it useful? */}
                      <div>
                        <span className="block text-[11px] text-slate-400 font-medium">1. Was this introduction useful?</span>
                        <div className="flex gap-2 mt-1.5">
                          <button
                            type="button"
                            onClick={() => handleFeedbackChange(intro.id, 'verified', true)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-medium border flex items-center justify-center gap-1 transition-all ${
                              fb.verified === true
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" /> Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFeedbackChange(intro.id, 'verified', false)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-medium border flex items-center justify-center gap-1 transition-all ${
                              fb.verified === false
                                ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            <ThumbsDown className="w-3.5 h-3.5" /> No
                          </button>
                        </div>
                      </div>

                      {/* Q2: Rating 1-5 */}
                      <div>
                        <span className="block text-[11px] text-slate-400 font-medium">2. Rating (1 - 5 stars)</span>
                        <div className="flex items-center gap-1 mt-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleFeedbackChange(intro.id, 'rating', star)}
                              className="p-1 hover:scale-110 transition-transform"
                            >
                              <Star 
                                className={`w-6 h-6 transition-colors ${
                                  star <= (fb.rating || 0)
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-slate-700 hover:text-slate-500'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Q3: Would collaborate? */}
                      <div>
                        <span className="block text-[11px] text-slate-400 font-medium">3. Would you collaborate with them?</span>
                        <div className="flex gap-2 mt-1.5">
                          <button
                            type="button"
                            onClick={() => handleFeedbackChange(intro.id, 'would_collaborate', true)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-medium border flex items-center justify-center gap-1 transition-all ${
                              fb.would_collaborate === true
                                ? 'bg-brand-500/15 text-brand-400 border-brand-500/30'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            <Handshake className="w-3.5 h-3.5" /> Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFeedbackChange(intro.id, 'would_collaborate', false)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-medium border flex items-center justify-center gap-1 transition-all ${
                              fb.would_collaborate === false
                                ? 'bg-slate-800 border-slate-850 text-slate-400 hover:text-white'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            No
                          </button>
                        </div>
                      </div>

                      {/* Q4: Comments */}
                      <div>
                        <span className="block text-[11px] text-slate-400 font-medium">4. Comments (Optional)</span>
                        <textarea
                          rows={2}
                          value={fb.comments || ''}
                          onChange={(e) => handleFeedbackChange(intro.id, 'comments', e.target.value)}
                          placeholder="e.g. Setting up a call next week."
                          className="w-full mt-1.5 p-2 bg-slate-950/60 border border-slate-850 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-brand-500 placeholder-slate-650"
                        />
                      </div>

                      {/* Submit */}
                      <button
                        type="button"
                        onClick={() => handleSubmitFeedback(intro.id)}
                        disabled={submittingFeedbackId === intro.id || !fb.rating}
                        className="w-full py-2 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white text-xs font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Submit Feedback
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
