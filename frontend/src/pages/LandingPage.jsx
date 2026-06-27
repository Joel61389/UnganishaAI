import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';
import kuzanaLogo from '../assets/kuzana-logo.png';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="min-h-screen bg-parchment-white text-midnight-ink font-inter antialiased selection:bg-warm-sand overflow-x-hidden">
      {/* ══ NAVIGATION ═══════════════════════════════════════════════════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b ${scrolled ? 'bg-parchment-white/95 backdrop-blur-md border-ash-border py-3' : 'bg-transparent border-transparent py-4'}`}>
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          {/* Logo Wordmark */}
          <div className="flex items-center gap-1.5">
            <span className="font-waldenburgfh font-bold text-sm tracking-[0.05em] text-midnight-ink">|| UNGANISHA</span>
          </div>

          {/* Navigation links */}
          <div className="hidden sm:flex items-center gap-6 text-xs font-medium text-driftwood">
            <a href="#how-it-works" className="hover:text-midnight-ink transition-colors">How It Works</a>
            <a href="#introductions" className="hover:text-midnight-ink transition-colors">Warm Intros</a>
            <Link to="/login" className="hover:text-midnight-ink transition-colors">Sign In</Link>
          </div>

          {/* CTA & Kuzana Logo on the Right */}
          <div className="flex items-center gap-4">
            <Link
              to="/register"
              className="bg-midnight-ink text-white font-medium text-xs rounded-full px-4 py-2 hover:bg-midnight-ink/90 transition-all shadow-[rgba(0,0,0,0.06)_0px_0px_0px_1px]"
            >
              Get Started
            </Link>
            {kuzanaLogo && (
              <img
                src={kuzanaLogo}
                alt="Kuzana Logo"
                className="h-6 object-contain opacity-80 mix-blend-multiply"
              />
            )}
          </div>
        </div>
      </nav>

      {/* ══ HERO SECTION ══════════════════════════════════════════════════════ */}
      <section className="relative pt-32 pb-24 border-b border-ash-border overflow-hidden">
        {/* Background Image with Muted Overlay */}
        <div className="absolute inset-0">
          <img 
            src="/unganisha-hero-img.jpg" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-35" 
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-parchment-white/20 via-parchment-white/60 to-parchment-white" />
        
        {/* Content Container */}
        <div className="relative max-w-5xl mx-auto px-6 z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Column — Title & Actions */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-medium border border-ash-border bg-warm-sand text-driftwood">
                Kuzana & MiniHack Ecosystem Partner
              </div>

              <h1 className="font-waldenburg text-[40px] sm:text-[48px] lg:text-[56px] font-light leading-[1.1] tracking-[-0.02em] text-midnight-ink">
                Your network's potential is trapped.
              </h1>
              
              <p className="text-sm sm:text-base text-driftwood leading-relaxed font-normal max-w-xl">
                Valuable opportunities are locked inside the circles of people you know. Most builders never connect because nobody has the time to scan networks and make introductions.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 bg-midnight-ink text-white text-xs font-medium px-6 py-3 rounded-full hover:opacity-90 transition-all"
                >
                  Join the Platform
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center text-midnight-ink border border-ash-border hover:bg-warm-sand bg-white text-xs font-medium px-6 py-3 rounded-full transition-all"
                >
                  How It Works
                </a>
              </div>
            </div>

            {/* Right Column — Clean description list */}
            <div className="lg:col-span-5 space-y-6 lg:border-l lg:border-ash-border lg:pl-8">
              <h3 className="text-xs font-bold text-midnight-ink uppercase tracking-wider">Clear Communication, Direct Connections</h3>
              <p className="text-xs sm:text-sm text-driftwood leading-relaxed font-normal">
                Unganisha maps professional capabilities, current startup goals, and development milestones across the Kenyan tech ecosystem.
              </p>
              <p className="text-xs sm:text-sm text-driftwood leading-relaxed font-normal">
                No complex forms or resume listings. Describe your goals in a simple chatbot dialogue, and receive direct introductions on WhatsApp to potential co-founders, developers, and partners.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ THE CHALLENGE / MATCH CASE ══════════════════════════════════════ */}
      <section className="py-20 border-t border-ash-border bg-warm-sand/30">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <span className="text-[10px] font-bold text-driftwood uppercase tracking-wider">The Focus</span>
            <h2 className="font-waldenburg text-2xl md:text-3xl font-light text-midnight-ink mt-2 mb-4 tracking-[-0.02em]">
              Connecting developers & founders
            </h2>
            <p className="text-driftwood text-sm leading-relaxed">
              Instead of static directories or cold outreach, our pilot matches MiniHack developers with Kuzana founders who need immediate technical execution.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <h3 className="font-waldenburg text-base font-light text-midnight-ink tracking-[-0.01em]">MiniHack Developers</h3>
              <p className="text-xs text-driftwood leading-relaxed">
                Matches are based on project history, technical depth, and current bandwidth rather than resume keywords.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-waldenburg text-base font-light text-midnight-ink tracking-[-0.01em]">Kuzana Founders</h3>
              <p className="text-xs text-driftwood leading-relaxed">
                Profiles capture immediate operational hurdles, funding status, and co-founder requirements.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-waldenburg text-base font-light text-midnight-ink tracking-[-0.01em]">Conversational Setup</h3>
              <p className="text-xs text-driftwood leading-relaxed">
                Profile setup is a simple, unstructured text conversation. The system processes inputs to generate profile vectors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ═════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-20 border-t border-ash-border">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <span className="text-[10px] font-bold text-driftwood uppercase tracking-wider">Logic</span>
            <h2 className="font-waldenburg text-2xl md:text-3xl font-light text-midnight-ink mt-2 mb-4 tracking-[-0.02em]">
              Simple matching architecture
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-driftwood">01 / Profiling</span>
              <h3 className="font-waldenburg text-base font-light text-midnight-ink">Goal & Need Capture</h3>
              <p className="text-xs text-driftwood leading-relaxed">
                A simple chat interview about your current milestones and immediate bottlenecks to create an intent profile.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono text-driftwood">02 / Compatibility</span>
              <h3 className="font-waldenburg text-base font-light text-midnight-ink">Match Score Engine</h3>
              <p className="text-xs text-driftwood leading-relaxed">
                An algorithm matches profiles based on goals, technical depth, operational challenges, and timing.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono text-driftwood">03 / Introduction</span>
              <h3 className="font-waldenburg text-base font-light text-midnight-ink">Context-Rich Messages</h3>
              <p className="text-xs text-driftwood leading-relaxed">
                Generates a warm introduction message detailing why you should connect and drops it directly into WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CONNECTION EXAMPLE ══════════════════════════════════════════════ */}
      <section id="introductions" className="py-20 border-t border-ash-border bg-warm-sand/30">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-12 gap-12 items-center">
          {/* Left Column — Text */}
          <div className="md:col-span-5 space-y-4">
            <span className="text-[10px] font-bold text-driftwood uppercase tracking-wider">Warm Introductions</span>
            <h2 className="font-waldenburg text-2xl md:text-3xl font-light text-midnight-ink tracking-[-0.02em]">
              Actionable connection messages
            </h2>
            <p className="text-driftwood text-xs leading-relaxed">
              We focus on context-rich, warm introductions instead of static profiles or generic cold templates. Connections contain immediate operational needs and overlapping interest areas.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <CheckCircle className="w-4 h-4 text-midnight-ink" />
              <span className="text-xs font-medium text-driftwood">Focus: clean, direct founder-to-developer matchmaking.</span>
            </div>
          </div>

          {/* Right Column — Bubble Mockup */}
          <div className="md:col-span-7">
            <div className="bg-white rounded-2xl p-6 border border-ash-border space-y-4">
              <div className="flex items-center justify-between text-xs border-b border-ash-border pb-3">
                <span className="font-mono text-[10px] text-driftwood">CONNECTION PROMPT EXAMPLE</span>
                <span className="text-driftwood font-medium text-[10px]">WhatsApp</span>
              </div>
              <div className="p-4 rounded-xl bg-warm-sand/50 border border-ash-border/50 text-xs text-midnight-ink leading-relaxed">
                {"Hey Amani! I wanted to introduce Wanjiru, a Kuzana founder building fintech infrastructure in Westlands, and yourself (a MiniHack developer looking for co-founder opportunities). She has shipped two products and understands the local market deeply. Your technical experience in payments would be highly complementary to her startup's goals. Shall I connect you?"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA & STATUS ════════════════════════════════════════════════════ */}
      <section className="py-24 border-t border-ash-border text-center bg-parchment-white">
        <div className="max-w-2xl mx-auto px-6 space-y-6">
          <h2 className="font-waldenburg text-3xl font-light text-midnight-ink tracking-[-0.02em]">
            Connect your startup goals.
          </h2>
          <p className="text-driftwood text-xs leading-relaxed max-w-md mx-auto">
            Briefly describe your milestone or project help request, import your profile, and let the matchmaking engine find the exact contact.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              to="/register"
              className="bg-midnight-ink text-white font-medium text-xs rounded-full px-6 py-3 hover:opacity-90 transition-all"
            >
              Register Profile
            </Link>
            <Link
              to="/login"
              className="bg-white text-midnight-ink border border-ash-border font-medium text-xs rounded-full px-6 py-3 hover:bg-warm-sand transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════════════════════════ */}
      <footer className="py-8 border-t border-ash-border bg-parchment-white">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-driftwood">
          <div className="flex items-center gap-1.5 font-waldenburgfh font-bold text-midnight-ink">
            || UNGANISHA
          </div>
          <div className="flex items-center gap-4">
            <a href="#how-it-works" className="hover:text-midnight-ink">How It Works</a>
            <a href="#introductions" className="hover:text-midnight-ink">Intros</a>
            <span>© 2026 Unganisha for Kuzana</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
