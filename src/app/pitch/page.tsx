'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import TaskRunner from '../../components/TaskRunner';

export default function PitchDeck() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [slideKey, setSlideKey] = useState(0);

  const totalSlides = 10;

  const nextSlide = useCallback(() => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(prev => prev + 1);
      setSlideKey(prev => prev + 1);
    }
  }, [currentSlide, totalSlides]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
      setSlideKey(prev => prev + 1);
    }
  }, [currentSlide]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.warn(err));
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const slides = [
    // Slide 1: Title
    {
      id: 1,
      header: null,
      content: (
        <div className="flex flex-col items-center justify-center text-center h-full max-w-4xl mx-auto">
          <div className="relative mb-6 group cursor-pointer pitch-animate-title">
            <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-yellow-400/20 via-white/10 to-yellow-400/20 blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 pitch-pulse-halo"></div>
            <img src="/yinyang.png" alt="YinYang Logo" className="relative w-28 h-28 theme-logo transform group-hover:scale-105 transition-transform duration-500" />
          </div>

          <h1 className="text-[100px] md:text-[160px] font-bold tracking-tighter leading-none text-white mb-4 pitch-animate-title">
            Nyxa.
          </h1>
          
          <div className="w-48 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent mb-8 mx-auto pitch-animate-subtitle"></div>
          
          <p className="text-xl md:text-2xl text-gray-200 font-bold mb-2 uppercase tracking-widest pitch-animate-stagger-1">
            THE SHORTCUT PARTY
          </p>
          <p className="text-lg md:text-xl text-gray-400 font-light mb-8 uppercase tracking-wide pitch-animate-stagger-2">
            The Autonomous Exchange Layer for AI & Micro-Utilities
          </p>
          
          <div className="pitch-animate-stagger-3">
            <span className="text-xs font-bold text-white tracking-[0.3em] uppercase py-1.5 px-6 border border-white/20 rounded-full bg-white/5 backdrop-blur-sm shadow-[0_0_15px_rgba(255,255,255,0.05)]">
              FOR THE LIGHT
            </span>
          </div>
          
          <p className="text-[11px] font-bold text-gray-600 tracking-widest uppercase mt-6 pitch-animate-stagger-3">
            Engineering & Cryptography Core
          </p>
        </div>
      ),
    },

    // Slide 2: Hypothesis
    {
      id: 2,
      header: null,
      content: (
        <div className="flex flex-col justify-center text-center h-full max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight mb-4 pitch-animate-title">
            People do not want to buy tools.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-gray-400 to-gray-600">They just want the job done.</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-400 font-light mb-8 pitch-animate-subtitle">
            The Psychological Reality of Frictionless Fulfillment
          </p>
          <div className="w-32 h-px bg-white/20 mb-10 mx-auto pitch-animate-subtitle"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 border border-white/10 rounded-xl bg-white/[0.02] hover:border-white/40 hover:bg-white/[0.04] transition-all duration-300 transform hover:-translate-y-1 pitch-animate-stagger-1">
              <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center font-mono text-xs mx-auto mb-4 border border-white/20">01</div>
              <h3 className="text-lg font-bold text-white mb-3 uppercase tracking-widest">The Mental Load</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Buying software forces users and AI agents to master complex interfaces, manage credentials, and handle operational failures, creating heavy cognitive stress.
              </p>
            </div>

            <div className="p-6 border border-white/10 rounded-xl bg-white/[0.02] hover:border-white/40 hover:bg-white/[0.04] transition-all duration-300 transform hover:-translate-y-1 pitch-animate-stagger-2">
              <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center font-mono text-xs mx-auto mb-4 border border-white/20">02</div>
              <h3 className="text-lg font-bold text-white mb-3 uppercase tracking-widest">Shift to Outcomes</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Users and autonomous agents seek guaranteed end results—verified computations, executed tasks, and rendered data—not the underlying tools required to build them.
              </p>
            </div>

            <div className="p-6 border border-white/10 rounded-xl bg-white/[0.02] hover:border-white/40 hover:bg-white/[0.04] transition-all duration-300 transform hover:-translate-y-1 pitch-animate-stagger-3">
              <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center font-mono text-xs mx-auto mb-4 border border-white/20">03</div>
              <h3 className="text-lg font-bold text-white mb-3 uppercase tracking-widest">Frictionless Fulfillment</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                The future belongs to zero-friction marketplaces where intent translates directly into verified execution without manual labor, SaaS overhead, or setup drag.
              </p>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 3: Shift
    {
      id: 3,
      header: null,
      content: (
        <div className="flex flex-col justify-center text-center h-full max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight mb-4 pitch-animate-title">
            From Selling Software<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-600">To Selling Verified Results.</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-400 font-light mb-8 pitch-animate-subtitle">
            The Paradigm Shift in Machine-to-Machine Commerce
          </p>
          <div className="w-32 h-px bg-white/20 mb-10 mx-auto pitch-animate-subtitle"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 border border-white/10 rounded-xl bg-white/[0.02] hover:border-white/40 transition-all duration-300 pitch-animate-stagger-1">
              <h3 className="text-lg font-bold text-white mb-3 uppercase tracking-widest">SaaS Model Fatigue</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Traditional SaaS charges recurring subscriptions for potential access. Nyxa charges micro-fees only upon successful delivery of verified, completed work.
              </p>
            </div>
            <div className="p-6 border border-white/10 rounded-xl bg-white/[0.02] hover:border-white/40 transition-all duration-300 pitch-animate-stagger-2">
              <h3 className="text-lg font-bold text-white mb-3 uppercase tracking-widest">Machine-Native Commerce</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Autonomous AI agents cannot fill out credit card forms or manage SaaS plans; they require zero-friction, programmatic outcome procurement.
              </p>
            </div>
            <div className="p-6 border border-white/10 rounded-xl bg-white/[0.02] hover:border-white/40 transition-all duration-300 pitch-animate-stagger-3">
              <h3 className="text-lg font-bold text-white mb-3 uppercase tracking-widest">The Result Marketplace</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                A global liquid exchange where developers deploy WASM micro-utilities and autonomous agents trade results in sub-second execution windows.
              </p>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 4: Solution
    {
      id: 4,
      header: null,
      content: (
        <div className="flex flex-col justify-center text-center h-full max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight mb-4 pitch-animate-title">
            The Exchange for Autonomous Outcomes.
          </h2>
          <p className="text-lg md:text-xl text-gray-400 font-light mb-8 pitch-animate-subtitle">
            Unified Compute & Escrow Settlement for Autonomous AI Agents
          </p>
          <div className="w-32 h-px bg-white/20 mb-10 mx-auto pitch-animate-subtitle"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 border border-white/10 rounded-xl bg-white/[0.02] hover:border-white/40 transition-all duration-300 pitch-animate-stagger-1">
              <h3 className="text-lg font-bold text-white mb-3 uppercase tracking-widest">Instant Execution</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                AI agents request complex data transformations, code executions, or cryptographic verifications with zero environment setup or key management.
              </p>
            </div>
            <div className="p-6 border border-white/10 rounded-xl bg-white/[0.02] hover:border-white/40 transition-all duration-300 pitch-animate-stagger-2">
              <h3 className="text-lg font-bold text-white mb-3 uppercase tracking-widest">Escrow Security</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Funds are locked safely in escrow ledgers before execution begins, guaranteeing buyer protection and payment seller assurance.
              </p>
            </div>
            <div className="p-6 border border-white/10 rounded-xl bg-white/[0.02] hover:border-white/40 transition-all duration-300 pitch-animate-stagger-3">
              <h3 className="text-lg font-bold text-white mb-3 uppercase tracking-widest">Pay-Per-Outcome</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Pure result-based billing. No recurring subscriptions, zero minimum commitments, and sub-cent precision micro-transaction settlement.
              </p>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 5: Market Size
    {
      id: 5,
      header: null,
      content: (
        <div className="flex flex-col justify-center text-center h-full max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-2 pitch-animate-title">
            $135 Billion Machine-to-Machine API Economy
          </h2>
          <p className="text-lg text-gray-400 font-light mb-4 pitch-animate-subtitle">
            Capturing the Explosive Growth of Autonomous Agent Commerce
          </p>
          
          <h3 className="text-[90px] md:text-[160px] font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-600 leading-none mb-6 pitch-animate-stagger-1">
            $135B
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-5 border-t border-white/10 pt-6 pitch-animate-stagger-1">
              <h4 className="text-lg font-bold text-white mb-2">TAM ($135B)</h4>
              <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
                Global market size for API infrastructure, developer tools, and cloud micro-service transactions.
              </p>
            </div>
            <div className="p-5 border-t border-white/10 pt-6 pitch-animate-stagger-2">
              <h4 className="text-lg font-bold text-white mb-2">SAM ($42B)</h4>
              <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
                Target market for autonomous AI agent compute, edge execution, and programmatic workflow layers expanding at 48% CAGR.
              </p>
            </div>
            <div className="p-5 border-t border-white/10 pt-6 pitch-animate-stagger-3">
              <h4 className="text-lg font-bold text-white mb-2">SOM ($3.8B)</h4>
              <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
                Achievable Year 4 market capture in autonomous micro-utility transaction fees and escrow settlements.
              </p>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 6: Product Architecture & Demo
    {
      id: 6,
      header: null,
      content: (
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-center mb-8 pitch-animate-title">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-2">
              Platform Architecture: Edge & Escrow Engine
            </h2>
            <p className="text-lg text-gray-400 font-light">
              Verifiable Execution Pipeline Designed for Sub-Second Latency
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
              <div className="p-4 border-l-2 border-white/30 bg-white/[0.01] pitch-animate-stagger-1">
                <h3 className="text-xl font-bold text-white mb-1">01. Edge WASM Sandbox</h3>
                <p className="text-gray-400 text-xs md:text-sm leading-relaxed">Tasks run at global edge nodes inside secure WebAssembly sandboxes, eliminating cloud overhead.</p>
              </div>
              <div className="p-4 border-l-2 border-white/30 bg-white/[0.01] pitch-animate-stagger-2">
                <h3 className="text-xl font-bold text-white mb-1">02. Escrow Ledger</h3>
                <p className="text-gray-400 text-xs md:text-sm leading-relaxed">Programmable escrow holds funds securely during execution, preventing counterparty default.</p>
              </div>
              <div className="p-4 border-l-2 border-white/30 bg-white/[0.01] pitch-animate-stagger-3">
                <h3 className="text-xl font-bold text-white mb-1">03. Atomic Settlement</h3>
                <p className="text-gray-400 text-xs md:text-sm leading-relaxed">Payment releases instantly upon verified task completion. If output fails, funds return to buyer.</p>
              </div>
            </div>
            
            <div className="lg:col-span-7 pitch-animate-stagger-2">
              <div className="border border-white/20 bg-[#0a0a0a] rounded-xl p-6 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs font-bold tracking-widest uppercase text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    Live Prototype Demo
                  </span>
                  <span className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-white/20"></div>
                    <div className="w-2 h-2 rounded-full bg-white/20"></div>
                    <div className="w-2 h-2 rounded-full bg-white/20"></div>
                  </span>
                </div>
                <div className="invert grayscale contrast-125 hue-rotate-180">
                   <TaskRunner taskSlug="gst-invoice" taskTitle="GST Invoice Generator" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 7: Business Model
    {
      id: 7,
      header: null,
      content: (
        <div className="flex flex-col justify-center text-center h-full max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-2 pitch-animate-title">
            Unit Economics & Protocol Monetization
          </h2>
          <p className="text-lg text-gray-400 font-light mb-12 pitch-animate-subtitle">
            Scalable Take-Rate Infrastructure with Zero Marginal Server Overhead
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="p-8 border border-white/10 rounded-2xl bg-white/[0.02] hover:border-white/30 transition-all duration-500 pitch-animate-stagger-1">
              <h3 className="text-[90px] md:text-[130px] font-bold tracking-tighter text-white leading-none mb-4">3.5%</h3>
              <h4 className="text-xl font-bold text-white mb-3">Protocol Take-Rate</h4>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                Flat, transparent protocol fee collected automatically on every successful transaction and micro-utility execution.
              </p>
            </div>
            <div className="p-8 border border-white/10 rounded-2xl bg-white/[0.02] hover:border-white/30 transition-all duration-500 pitch-animate-stagger-2">
              <h3 className="text-[90px] md:text-[130px] font-bold tracking-tighter text-white leading-none mb-4">0</h3>
              <h4 className="text-xl font-bold text-white mb-3">Marginal Compute Overhead</h4>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                Edge-hosted WASM binaries offload compute costs to distributed nodes, maintaining ultra-high operating efficiency.
              </p>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 8: Traction
    {
      id: 8,
      header: null,
      content: (
        <div className="flex flex-col justify-center text-center h-full max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-2 pitch-animate-title">
            Traction Drivers & Financial Efficiency
          </h2>
          <p className="text-lg text-gray-400 font-light mb-12 pitch-animate-subtitle">
            High-Margin Architecture Paired with Viral Developer Acquisition
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="p-8 border border-white/10 rounded-2xl bg-white/[0.02] hover:border-white/30 transition-all duration-500 pitch-animate-stagger-1">
              <h3 className="text-[90px] md:text-[130px] font-bold tracking-tighter text-white leading-none mb-4">95%<span className="text-gray-600">+</span></h3>
              <h4 className="text-xl font-bold text-white mb-3">Gross Profit Margins</h4>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                Software-defined settlement and edge compute deliver industry-leading gross profit margins across all transaction volumes.
              </p>
            </div>
            <div className="p-8 border border-white/10 rounded-2xl bg-white/[0.02] hover:border-white/30 transition-all duration-500 pitch-animate-stagger-2">
              <h3 className="text-[90px] md:text-[130px] font-bold tracking-tighter text-white leading-none mb-4">48:1</h3>
              <h4 className="text-xl font-bold text-white mb-3">LTV / CAC Efficiency Ratio</h4>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                Open-source SDKs and developer utility publishing create self-sustaining organic acquisition flywheels.
              </p>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 9: Competition
    {
      id: 9,
      header: null,
      content: (
        <div className="flex flex-col justify-center text-center h-full max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-2 pitch-animate-title">
            We Sell the Destination. Not the Car.
          </h2>
          <p className="text-lg text-gray-400 font-light mb-12 pitch-animate-subtitle">
            Defensive Moat at the Intersection of Compute & Financial Settlement
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center border-t border-white/20 pt-10">
            <div className="p-5 pitch-animate-stagger-1">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">LEGACY APIS</span>
              <h3 className="text-lg font-bold text-white mb-3">High Friction & Static Fees</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Requires manual developer key setup, expensive monthly tier commitments, and credit card payments unsuited for AI agents.
              </p>
            </div>
            <div className="p-5 pitch-animate-stagger-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">AGENT FRAMEWORKS</span>
              <h3 className="text-lg font-bold text-white mb-3">Reasoning Without Execution</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Excellent at orchestration and LLM prompt chaining, but lack native sandboxed execution and monetary settlement primitives.
              </p>
            </div>
            <div className="p-5 border border-white/30 rounded-xl bg-white/5 shadow-[0_0_30px_rgba(255,255,255,0.05)] pitch-animate-stagger-3">
              <span className="text-xs font-bold text-white uppercase tracking-widest block mb-2">NYXA PLATFORM</span>
              <h3 className="text-lg font-bold text-white mb-3">Atomic Compute + Escrow</h3>
              <p className="text-white text-sm font-medium leading-relaxed">
                The only exchange linking WASM edge execution with escrow-backed financial settlement in one seamless transaction.
              </p>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 10: Horizon & Closing
    {
      id: 10,
      header: null,
      content: (
        <div className="flex flex-col justify-center text-center h-full max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-2 pitch-animate-title">
            $630 Million Target Annual Recurring Revenue
          </h2>
          <p className="text-lg text-gray-400 font-light mb-4 pitch-animate-subtitle">
            Scaling the Financial Backbone of the Machine Economy
          </p>

          <h3 className="text-[80px] md:text-[150px] font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-600 leading-none mb-6 pitch-animate-stagger-1">
            $630M
          </h3>
          <p className="text-lg text-gray-400 font-light mb-12 max-w-2xl mx-auto pitch-animate-stagger-2">
            Year 5 Target ARR driven by 5,000,000 active autonomous agents processing daily transactions.
          </p>
          
          <div className="mt-auto border-t border-white/20 pt-6 flex flex-col items-center justify-center gap-2 pitch-animate-stagger-3">
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-2 rounded-full bg-yellow-400/20 blur-md opacity-75 group-hover:opacity-100 transition duration-500 pitch-pulse-halo"></div>
              <img src="/yinyang.png" alt="YinYang" className="relative w-10 h-10 theme-logo mb-2" />
            </div>
            <span className="text-sm font-bold text-white tracking-widest uppercase">FOR THE LIGHT</span>
          </div>
        </div>
      ),
    },
  ];

  const current = slides[currentSlide];

  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-sans selection:bg-white selection:text-black overflow-hidden relative" data-theme="dark">
      
      {/* Background Subtle Ambient Aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/5 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Top Header */}
      <header className="px-8 md:px-16 py-8 flex items-center justify-between z-10">
        <Link href="/" className="font-bold text-xl tracking-tight hover:opacity-80 transition-opacity flex items-center gap-3">
          <img src="/yinyang.png" alt="Nyxa Logo" className="w-6 h-6 theme-logo" />
          Nyxa.
        </Link>
        
        {/* Slide Counter Indicator */}
        <div className="flex items-center gap-8">
          <div className="flex gap-1.5 items-center">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentSlide(idx);
                  setSlideKey(prev => prev + 1);
                }}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  idx === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
          
          <button
            onClick={toggleFullscreen}
            className="text-xs font-bold tracking-widest uppercase text-gray-500 hover:text-white transition-colors"
          >
            {isFullscreen ? 'Exit' : 'Fullscreen'}
          </button>
        </div>
      </header>

      {/* Main Slide Stage with Keyed Staggered Animations */}
      <main className="flex-1 flex flex-col max-w-[1400px] w-full mx-auto px-8 md:px-16 pb-16 relative z-10">
        <div 
          key={slideKey} 
          className="flex-1 flex flex-col w-full h-full"
        >
          {current.content}
        </div>
      </main>

      {/* Invisible Interactive Navigation Areas */}
      <div 
        className="fixed inset-0 z-0 flex pointer-events-none"
        aria-hidden="true"
      >
        <button 
          onClick={prevSlide} 
          disabled={currentSlide === 0}
          className="w-1/4 h-full pointer-events-auto cursor-w-resize outline-none opacity-0" 
        />
        <div className="w-2/4 h-full" />
        <button 
          onClick={nextSlide} 
          disabled={currentSlide === totalSlides - 1}
          className="w-1/4 h-full pointer-events-auto cursor-e-resize outline-none opacity-0" 
        />
      </div>

    </div>
  );
}
