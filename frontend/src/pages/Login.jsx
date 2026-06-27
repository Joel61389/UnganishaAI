import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Infinity, 
  Mail, 
  Lock, 
  AlertCircle, 
  ArrowRight, 
  Wallet, 
  Send, 
  X
} from 'lucide-react';

// ── Inline SVG brand icons ────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
  </svg>
);

const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.054a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);
// ─────────────────────────────────────────────────────────────────────────────

export default function Login() {
  const { login, connectWallet, web3Login } = useAuth();
  const navigate = useNavigate();

  const [authMode, setAuthMode] = useState('thirdweb'); // 'thirdweb' | 'standard'
  const [web3Email, setWeb3Email] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [web3Loading, setWeb3Loading] = useState(false);
  const [socialLoadingType, setSocialLoadingType] = useState(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /* ── Standard email/password login ──────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setError(''); setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    result.success ? navigate('/dashboard') : setError(result.error);
  };

  /* ── Thirdweb / Web3 auth ───────────────────────────────────────────────── */
  const handleThirdwebAuth = async (type) => {
    setError(''); setWeb3Loading(true); setMagicLinkSent(false);
    try {
      let res;
      if (type === 'email') {
        if (!web3Email.trim()) { setError('Please enter a valid email address.'); setWeb3Loading(false); return; }
        res = await connectWallet(web3Email);
        setMagicLinkSent(true);
        setTimeout(async () => {
          if (res.success) {
            const lr = await web3Login(res.address, 'embedded');
            lr.success ? navigate('/dashboard') : setError(lr.error);
          } else { setError(res.error); }
          setWeb3Loading(false);
        }, 2000);
        return;
      }
      // External wallet
      res = await connectWallet();
      if (res.success) {
        const lr = await web3Login(res.address, 'metamask');
        lr.success ? navigate('/dashboard') : setError(lr.error);
      } else { setError(res.error); }
    } catch (e) { setError(e.message || 'Web3 Login failed.'); }
    finally { if (type !== 'email') setWeb3Loading(false); }
  };

  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [socialEmail, setSocialEmail] = useState('');

  const handleSocialClick = (provider) => {
    setSelectedProvider(provider);
    setSocialEmail('');
    setSocialModalOpen(true);
  };

  /* ── Social OAuth simulation (Thirdweb social auth providers) ──────────── */
  const handleSocialLogin = async (provider, emailVal) => {
    if (!emailVal || !emailVal.trim() || !emailVal.includes('@')) {
      setError('Please enter a valid email address.');
      setSocialModalOpen(false);
      return;
    }
    setError(''); 
    setSocialLoadingType(provider);
    setSocialModalOpen(false);
    
    try {
      const res = await connectWallet(emailVal.trim());
      if (res.success) {
        await new Promise(r => setTimeout(r, 1200)); // UX delay
        const lr = await web3Login(res.address, 'embedded', emailVal.trim());
        lr.success ? navigate('/dashboard') : setError(lr.error);
      } else { 
        setError(res.error); 
      }
    } catch (e) {
      setError(e.message || 'Social login failed.');
    } finally {
      setSocialLoadingType(null);
    }
  };

  /* ── Social providers config ────────────────────────────────────────────── */
  const socialProviders = [
    { id: 'google',  label: 'Google',  Icon: GoogleIcon },
    { id: 'github',  label: 'GitHub',  Icon: GitHubIcon },
    { id: 'apple',   label: 'Apple',   Icon: AppleIcon },
    { id: 'discord', label: 'Discord', Icon: DiscordIcon },
  ];

  /* ── Shared input styles (design.md: inputs radius 4px, 1px border #e5e5e5) ── */
  const inputClass = "block w-full pl-10 pr-4 py-3 bg-white border border-ash-border rounded-[4px] text-[14px] font-inter text-midnight-ink placeholder-fog focus:outline-none focus:border-midnight-ink transition-colors";
  const inputIconClass = "absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-driftwood";
  const labelClass = "text-[11px] font-inter font-medium text-driftwood uppercase tracking-[0.08em]";

  return (
    <div className="min-h-screen bg-parchment-white font-inter antialiased flex flex-col items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-md space-y-8">

        {/* Brand Header */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-block">
            <span className="font-waldenburgfh font-bold text-[14px] tracking-[0.05em] text-midnight-ink">|| UNGANISHA</span>
          </Link>
          <h1 className="font-waldenburg text-[36px] font-light leading-[1.13] tracking-[-0.02em] text-midnight-ink">
            Welcome to Unganisha AI
          </h1>
          <p className="text-[14px] text-driftwood font-inter leading-relaxed">
            AI matchmaking for the Kenyan startup ecosystem
          </p>
        </div>

        {/* Mode Tab */}
        <div className="flex p-1 bg-warm-sand rounded-[20px] border border-ash-border">
          <button
            onClick={() => { setAuthMode('thirdweb'); setError(''); }}
            className={`flex-1 py-2.5 text-[13px] font-inter font-medium rounded-[18px] flex items-center justify-center gap-2 transition-all cursor-pointer ${
              authMode === 'thirdweb'
                ? 'bg-white text-midnight-ink shadow-[rgba(0,0,0,0.075)_0px_0px_0px_0.5px_inset]'
                : 'text-driftwood hover:text-midnight-ink'
            }`}
          >
            Thirdweb / Social
          </button>
          <button
            onClick={() => { setAuthMode('standard'); setError(''); }}
            className={`flex-1 py-2.5 text-[13px] font-inter font-medium rounded-[18px] flex items-center justify-center gap-2 transition-all cursor-pointer ${
              authMode === 'standard'
                ? 'bg-white text-midnight-ink shadow-[rgba(0,0,0,0.075)_0px_0px_0px_0.5px_inset]'
                : 'text-driftwood hover:text-midnight-ink'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            Email & Password
          </button>
        </div>

        {/* Panel */}
        <div className="p-6 sm:p-8 rounded-[20px] bg-warm-sand">
          {error && (
            <div className="flex items-center gap-2.5 p-3.5 mb-6 text-[13px] font-inter font-medium rounded-[8px] bg-white text-midnight-ink border border-ash-border">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {authMode === 'thirdweb' ? (
            <div className="space-y-6">

              {/* ── Social Buttons Grid ─────────────────────────────────── */}
              <div>
                <span className="block text-[11px] font-inter font-medium text-driftwood uppercase tracking-[0.08em] mb-3">
                  Sign in with Social Account
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {socialProviders.map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      type="button"
                      disabled={!!socialLoadingType || web3Loading}
                      onClick={() => handleSocialClick(id)}
                      className="flex items-center justify-center gap-2.5 py-3 px-4 bg-white border border-ash-border hover:border-midnight-ink/30 text-[13px] font-inter font-medium text-midnight-ink rounded-full transition-all disabled:opacity-40 cursor-pointer shadow-[rgba(0,0,0,0.06)_0px_0px_0px_1px,rgba(0,0,0,0.04)_0px_1px_2px_0px]"
                    >
                      {socialLoadingType === id ? (
                        <div className="w-4 h-4 border-2 border-ash-border border-t-midnight-ink rounded-full animate-spin" />
                      ) : (
                        <Icon />
                      )}
                      {label}
                    </button>
                  ))}
                </div>

                {/* Social Email Modal */}
                {socialModalOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-midnight-ink/40 backdrop-blur-sm" onClick={() => setSocialModalOpen(false)}>
                    <div className="w-full max-w-sm mx-4 p-6 rounded-[20px] bg-parchment-white border border-ash-border shadow-[rgba(0,0,0,0.4)_0px_0px_1px_0px,rgba(0,0,0,0.04)_0px_1px_1px_0px,rgba(0,0,0,0.04)_0px_2px_4px_0px] space-y-5" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-between">
                        <h3 className="text-[15px] font-inter font-medium text-midnight-ink flex items-center gap-2">
                          {socialProviders.find(p => p.id === selectedProvider)?.Icon && (
                            <span>{React.createElement(socialProviders.find(p => p.id === selectedProvider).Icon)}</span>
                          )}
                          Sign in with {selectedProvider?.charAt(0).toUpperCase() + selectedProvider?.slice(1)}
                        </h3>
                        <button onClick={() => setSocialModalOpen(false)} className="text-driftwood hover:text-midnight-ink transition-colors cursor-pointer">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[13px] text-driftwood font-inter">Enter the email address associated with your {selectedProvider?.charAt(0).toUpperCase() + selectedProvider?.slice(1)} account.</p>
                      <div className="relative">
                        <div className={inputIconClass}><Mail className="w-4 h-4" /></div>
                        <input
                          type="email"
                          value={socialEmail}
                          onChange={e => setSocialEmail(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && socialEmail.trim()) handleSocialLogin(selectedProvider, socialEmail); }}
                          placeholder="you@example.com"
                          autoFocus
                          className={inputClass}
                        />
                      </div>
                      <button
                        type="button"
                        disabled={!socialEmail.trim() || !socialEmail.includes('@')}
                        onClick={() => handleSocialLogin(selectedProvider, socialEmail)}
                        className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-midnight-ink text-white text-[14px] font-inter font-medium rounded-full hover:opacity-90 transition-all disabled:opacity-40 cursor-pointer"
                      >
                        Continue <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Divider ────────────────────────────────────────────── */}
              <div className="relative flex items-center justify-center py-1">
                <div className="absolute inset-x-0 h-px bg-ash-border" />
                <span className="relative px-4 bg-warm-sand text-[10px] text-fog font-inter font-medium uppercase tracking-[0.1em]">
                  Or with Email OTP (Thirdweb)
                </span>
              </div>

              {/* ── Email OTP ──────────────────────────────────────────── */}
              <div className="space-y-2">
                <label className={labelClass}>Email Address</label>
                <div className="relative">
                  <div className={inputIconClass}><Mail className="w-4 h-4" /></div>
                  <input
                    type="email"
                    value={web3Email}
                    onChange={e => setWeb3Email(e.target.value)}
                    placeholder="name@company.com"
                    disabled={web3Loading || magicLinkSent}
                    className={`${inputClass} disabled:opacity-50`}
                  />
                </div>
              </div>

              {magicLinkSent ? (
                <div className="p-5 rounded-[20px] bg-white border border-ash-border space-y-2 text-center">
                  <Send className="w-5 h-5 text-midnight-ink mx-auto mb-1 animate-bounce" />
                  <h6 className="text-[13px] font-inter font-medium text-midnight-ink">Verification Link Sent!</h6>
                  <p className="text-[11px] text-driftwood font-inter">Check your email — click the link to activate your embedded wallet.</p>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={web3Loading || !web3Email}
                  onClick={() => handleThirdwebAuth('email')}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-midnight-ink text-white text-[14px] font-inter font-medium rounded-full hover:opacity-90 transition-all disabled:opacity-40 cursor-pointer"
                >
                  {web3Loading ? 'Authenticating...' : 'Sign In with Email OTP'}
                  {!web3Loading && <ArrowRight className="w-4 h-4" />}
                </button>
              )}

              {/* ── External Wallet ────────────────────────────────────── */}
              <div className="relative flex items-center justify-center py-1">
                <div className="absolute inset-x-0 h-px bg-ash-border" />
                <span className="relative px-4 bg-warm-sand text-[10px] text-fog font-inter font-medium uppercase tracking-[0.1em]">
                  Web3 Wallet
                </span>
              </div>

              <button
                type="button"
                disabled={web3Loading || !!socialLoadingType}
                onClick={() => handleThirdwebAuth('metamask')}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 bg-white text-midnight-ink border border-ash-border hover:border-midnight-ink/30 text-[13px] font-inter font-medium rounded-full transition-all disabled:opacity-40 cursor-pointer shadow-[rgba(0,0,0,0.06)_0px_0px_0px_1px,rgba(0,0,0,0.04)_0px_1px_2px_0px]"
              >
                <Wallet className="w-4 h-4" />
                Connect Wallet (Core / MetaMask / Coinbase)
              </button>

              {/* Thirdweb + Avalanche attribution */}
              <p className="text-center text-[10px] text-driftwood font-inter mt-1">
                Powered by{' '}
                <span className="text-midnight-ink font-medium">Thirdweb Embedded Wallets</span>
                {' '}· deployed on{' '}
                <span className="text-midnight-ink font-medium">Avalanche Fuji Testnet</span>
              </p>
            </div>
          ) : (
            /* ── Standard Login Form ──────────────────────────────────── */
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="email" className={labelClass}>Email address</label>
                <div className="relative">
                  <div className={inputIconClass}><Mail className="w-4 h-4" /></div>
                  <input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className={inputClass} />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className={labelClass}>Password</label>
                <div className="relative">
                  <div className={inputIconClass}><Lock className="w-4 h-4" /></div>
                  <input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputClass} />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="group w-full flex justify-center items-center gap-2 py-3 px-4 bg-midnight-ink text-white text-[14px] font-inter font-medium rounded-full hover:opacity-90 transition-all disabled:opacity-40 cursor-pointer">
                {loading ? 'Signing in...' : 'Sign In'}
                {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-[13px] text-driftwood font-inter">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-midnight-ink hover:opacity-70 transition-opacity">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
