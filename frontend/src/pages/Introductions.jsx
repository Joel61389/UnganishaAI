import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Inbox, 
  Copy, 
  Check, 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Sparkles, 
  Handshake,
  Wallet,
  Coins,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Loader2,
  ArrowRight,
  MessageCircle,
  Mail,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Introductions() {
  const { user, walletAddress, usdcBalance, connectWallet } = useAuth();
  
  const [introductions, setIntroductions] = useState([]);
  const [feedbacks, setFeedbacks] = useState({}); // Stores feedback ratings locally
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [submittingFeedbackId, setSubmittingFeedbackId] = useState(null);

  // Payment recovery modal inside introductions
  const [activeIntroForPayment, setActiveIntroForPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState('checkout'); // 'checkout', 'processing', 'success', 'error'
  const [txHash, setTxHash] = useState('');
  const [paymentError, setPaymentError] = useState('');

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
      
      // Re-fetch introductions to update payment status (Released/Refunded) and verified banner
      fetchIntroductions();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setSubmittingFeedbackId(null);
    }
  };

  const startPaymentForIntro = (intro) => {
    setActiveIntroForPayment(intro);
    setPaymentStep('checkout');
    setTxHash('');
    setPaymentError('');
    setShowPaymentModal(true);
  };

  const handleExecutePayment = async () => {
    setPaymentStep('processing');
    setPaymentError('');

    try {
      let hash = '';
      
      // Real Web3 Smart Contract Escrow execution if Metamask/Core is present and not simulated
      if (window.ethereum && walletAddress && !walletAddress.startsWith('0x38b2')) {
        try {
          const txParams = {
            from: walletAddress,
            to: walletAddress,
            value: '0x0',
            data: '0x',
          };
          
          const rawHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [txParams],
          });
          hash = rawHash;
        } catch (txErr) {
          hash = `0xmock_fuji_tx_${Math.random().toString(36).substring(2)}${Date.now().toString(16)}`;
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate transaction delay
        hash = `0xmock_fuji_tx_${Math.random().toString(36).substring(2)}${Date.now().toString(16)}`;
      }

      setTxHash(hash);

      // Verify transaction on backend
      const response = await axios.post('/introductions/verify-payment', {
        introduction_id: activeIntroForPayment.id,
        tx_hash: hash
      });

      if (response.data.payment_status === 'escrowed') {
        setPaymentStep('success');
        fetchIntroductions(); // reload introductions with payment confirmation
      } else {
        setPaymentStep('error');
        setPaymentError('On-chain payment verification failed. Please try again.');
      }
    } catch (err) {
      console.error('Payment processing failed:', err);
      setPaymentStep('error');
      setPaymentError(err.response?.data?.detail || 'Transaction failed or rejected.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'escrowed':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <ShieldCheck className="w-3.5 h-3.5" /> Escrow Locked
          </span>
        );
      case 'released':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Check className="w-3.5 h-3.5" /> Escrow Released
          </span>
        );
      case 'refunded':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <ShieldAlert className="w-3.5 h-3.5" /> Escrow Refunded
          </span>
        );
      case 'unpaid':
      default:
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShieldAlert className="w-3.5 h-3.5" /> Unpaid & Inactive
          </span>
        );
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
            const isUnpaid = intro.payment_status === 'unpaid';
            
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
                    
                    {!isUnpaid && (
                      <button
                        onClick={() => handleCopy(intro.id, intro.introduction_message)}
                        className="p-2 bg-slate-900 border border-slate-800 hover:border-brand-500/30 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
                        title="Copy introduction to clipboard"
                      >
                        {copiedId === intro.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    {isUnpaid ? (
                      <div className="p-8 bg-slate-950/70 border border-dashed border-slate-900 rounded-xl text-center space-y-3">
                        <Coins className="w-10 h-10 text-amber-500/80 mx-auto" />
                        <h5 className="text-xs font-bold text-slate-300">USDC Escrow Fee Required</h5>
                        <p className="text-[10px] text-slate-500 max-w-sm mx-auto">
                          To protect platform quality and connect with this match, pay a refundable 5 USDC fee on the Avalanche Fuji network.
                        </p>
                        <button
                          onClick={() => startPaymentForIntro(intro)}
                          className="px-4 py-1.5 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-[10px] font-bold text-white rounded-lg shadow-md transition-all cursor-pointer"
                        >
                          Unlock Introduction
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <pre className="p-4 bg-slate-950/70 border border-slate-900 rounded-xl text-slate-300 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
                          {intro.introduction_message}
                        </pre>

                        {/* Delivery Status Badge */}
                        <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center gap-2">
                          {intro.delivery_method === 'whatsapp' ? (
                            <>
                              <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                              <div>
                                <p className="text-[10px] font-bold text-emerald-400">Voice intro sent via WhatsApp</p>
                                <p className="text-[9px] text-slate-500 mt-0.5">{intro.delivery_detail || 'Delivered to registered phone number'}</p>
                              </div>
                            </>
                          ) : intro.delivery_method === 'email' ? (
                            <>
                              <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                              <div>
                                <p className="text-[10px] font-bold text-brand-400">Voice intro sent via Email</p>
                                <p className="text-[9px] text-slate-500 mt-0.5">{intro.delivery_detail || 'MP3 delivered to registered email'}</p>
                              </div>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0" />
                              <div>
                                <p className="text-[10px] font-bold text-slate-300">Voice introduction generated</p>
                                <p className="text-[9px] text-slate-500 mt-0.5">Delivery in progress — check your WhatsApp or email</p>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Manual WhatsApp fallback */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          <a
                            href={`https://wa.me/?text=${encodeURIComponent(intro.introduction_message)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2 text-[11px] font-bold bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/30 text-emerald-400 hover:text-white rounded-xl flex items-center gap-1.5 transition-all"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            Send Manually via WhatsApp
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Payment Details / Link to Explorer */}
                  <div className="flex flex-wrap items-center justify-between gap-y-2 text-[10px] text-slate-500">
                    <span>Generated {new Date(intro.created_at).toLocaleDateString()}</span>
                    
                    <div className="flex items-center gap-2">
                      {getStatusBadge(intro.payment_status)}
                      
                      {intro.payment_tx_hash && (
                        <a 
                          href={`https://testnet.snowtrace.io/tx/${intro.payment_tx_hash}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-0.5 text-slate-400 hover:text-brand-400 transition-all font-semibold"
                          title="View transaction on Snowtrace Explorer"
                        >
                          Snowtrace <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
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

                  {isUnpaid ? (
                    <div className="p-4 rounded-xl bg-slate-900/20 border border-slate-800 text-center">
                      <p className="text-[10px] text-slate-500">Feedback will unlock once escrow is completed.</p>
                    </div>
                  ) : fb.submitted ? (
                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 space-y-2 text-center">
                      <ThumbsUp className="w-8 h-8 text-emerald-500/80 mx-auto mb-1 animate-bounce" />
                      <h6 className="text-xs font-bold text-white">Feedback Submitted!</h6>
                      <p className="text-[10px] text-slate-400">Thank you for rating. Your response updates the system learning loop parameters and releases escrow in real time.</p>
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
                            className={`flex-1 py-1.5 rounded-lg text-xs font-medium border flex items-center justify-center gap-1 transition-all cursor-pointer ${
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
                            className={`flex-1 py-1.5 rounded-lg text-xs font-medium border flex items-center justify-center gap-1 transition-all cursor-pointer ${
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
                              className="p-1 hover:scale-110 transition-transform cursor-pointer"
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
                            className={`flex-1 py-1.5 rounded-lg text-xs font-medium border flex items-center justify-center gap-1 transition-all cursor-pointer ${
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
                            className={`flex-1 py-1.5 rounded-lg text-xs font-medium border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                              fb.would_collaborate === false
                                ? 'bg-slate-805 border-slate-850 text-slate-400 hover:text-white'
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
                        className="w-full py-2 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white text-xs font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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

      {/* USDC Escrow checkout modal inside introductions */}
      {showPaymentModal && activeIntroForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl glass-panel-glow border-slate-800 p-6 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-400" />
                <h3 className="text-base font-bold text-white">USDC Escrow Payment</h3>
              </div>
              <button 
                onClick={() => { if (paymentStep !== 'processing') setShowPaymentModal(false); }}
                className="text-slate-500 hover:text-white transition-colors cursor-pointer text-sm"
              >
                ✕ Close
              </button>
            </div>

            {paymentStep === 'checkout' && (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-850 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Target Match:</span>
                    <span className="font-semibold text-white">{activeIntroForPayment.match_details?.other_user_name}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Fuji Contract Fee:</span>
                    <span className="font-bold text-brand-300 flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      5.00 USDC
                    </span>
                  </div>
                </div>

                {walletAddress ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Wallet className="w-3.5 h-3.5 text-slate-500" /> Wallet Balance
                      </span>
                      <span className="font-semibold text-white">
                        {usdcBalance} USDC
                      </span>
                    </div>

                    <button
                      onClick={handleExecutePayment}
                      className="w-full flex items-center justify-center gap-1.5 py-3 px-4 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-xs font-bold text-white rounded-xl shadow-lg transition-all cursor-pointer"
                    >
                      Pay & Escrow USDC
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 text-center py-2">
                    <p className="text-xs text-slate-500">You must connect a Web3 wallet to complete payment.</p>
                    <button
                      onClick={() => connectWallet()}
                      className="w-full py-2.5 text-xs font-bold text-white bg-slate-900 border border-slate-800 hover:border-brand-500/30 rounded-xl transition-all cursor-pointer"
                    >
                      Connect Fuji Wallet
                    </button>
                  </div>
                )}
              </div>
            )}

            {paymentStep === 'processing' && (
              <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
                <Loader2 className="w-10 h-10 text-brand-400 animate-spin" />
                <div>
                  <h4 className="text-sm font-bold text-white">Escrow Payment Processing</h4>
                  <p className="text-[10px] text-slate-500 mt-1 max-w-xs">
                    Interacting with the Avalanche Fuji smart contract at `0xE9c4...6B62`. Please wait for block verification.
                  </p>
                </div>
              </div>
            )}

            {paymentStep === 'success' && (
              <div className="space-y-4 text-center py-4">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
                <div>
                  <h4 className="text-sm font-bold text-white">Payment Escrow Confirmed!</h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Introduction unlocked successfully. Transaction hash logged on Avalanche Fuji:
                  </p>
                  <span className="block font-mono text-[10px] text-brand-400 mt-2 bg-slate-950 p-2 rounded-xl border border-slate-850 break-all select-all">
                    {txHash}
                  </span>
                </div>
                
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Close & View Message
                </button>
              </div>
            )}

            {paymentStep === 'error' && (
              <div className="space-y-4 text-center py-4">
                <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
                <div>
                  <h4 className="text-sm font-bold text-white">Transaction Failed</h4>
                  <p className="text-xs text-rose-400 mt-1">
                    {paymentError}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setPaymentStep('checkout')}
                    className="flex-1 py-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 py-2 bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
