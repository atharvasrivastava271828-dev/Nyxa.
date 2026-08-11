'use client';

import { useState, useEffect } from 'react';

export default function PitchMock() {
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = 6; // Updated to 6 slides

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        setCurrentSlide(s => Math.min(totalSlides, s + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide(s => Math.max(1, s - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalSlides]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 font-sans selection:bg-yellow-500/30">
      
      {/* 16:9 Aspect Ratio Slide Container */}
      <div 
        className="relative w-full max-w-6xl aspect-video bg-black overflow-hidden flex flex-col items-center justify-center p-12 transition-all duration-500"
      >
        
        {/* SLIDE 1: Title */}
        {currentSlide === 1 && (
          <div className="w-full h-full flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500 relative">
            
            {/* Simple Yin-Yang Logo */}
            <div className="w-32 h-32 mb-12 opacity-80">
              <img src="/favicon.svg" alt="Nyxa" className="w-full h-full object-contain" />
            </div>
            
            <div className="flex flex-col items-center gap-6">
              {/* Center Text */}
              <h1 className="text-[130px] font-medium text-white tracking-tight leading-none">
                Nyxa.
              </h1>
              
              {/* Tagline */}
              <p className="text-3xl font-light text-white/60 tracking-widest">
                For the Light
              </p>
            </div>

            {/* Subtle Subtext */}
            <div className="absolute bottom-8 w-full text-center">
              <p className="text-[10px] font-medium text-white/30 uppercase tracking-[0.4em]">
                Making sure no one is left out.
              </p>
            </div>
            
          </div>
        )}

        {/* SLIDE 2: The Problem */}
        {currentSlide === 2 && (
          <div className="w-full h-full flex flex-col justify-between animate-in fade-in slide-in-from-right-8 duration-500 pt-4 pb-2 relative">
            
            {/* Top Label */}
            <div className="w-full text-center">
              <span className="text-xs font-bold text-white/40 uppercase tracking-[0.3em]">
                The Problem
              </span>
            </div>

            {/* Central Question */}
            <div className="text-center self-center max-w-4xl mt-6 mb-8">
              <h2 className="text-4xl font-medium text-white/90 leading-snug">
                We have a tool for everything.<br/>
                <span className="text-white">Why is work still so disconnected?</span>
              </h2>
            </div>

            {/* Two Sides */}
            <div className="flex w-full px-12 gap-12 mb-6">
              
              {/* Left Side: Humans */}
              <div className="flex-1 flex flex-col">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-white/20 pb-3">
                  For Humans <span className="text-white/50 ml-2 normal-case tracking-normal">— Task Fragmentation</span>
                </h3>
                <p className="text-lg font-light italic text-white/70 mb-5 border-l-2 border-white/40 pl-4 py-1">
                  "I know what I need, but not which tool can reliably get it done."
                </p>
                <ul className="space-y-3 text-gray-400 text-base font-light list-disc list-inside marker:text-white/30">
                  <li>Trapped managing infinite apps and workflows</li>
                  <li>Forced to learn tools instead of getting outcomes</li>
                </ul>
              </div>

              {/* Right Side: Agents */}
              <div className="flex-1 flex flex-col">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-white/20 pb-3">
                  For AI Agents <span className="text-white/50 ml-2 normal-case tracking-normal">— Capability Fragmentation</span>
                </h3>
                <p className="text-lg font-light italic text-white/70 mb-5 border-l-2 border-white/40 pl-4 py-1">
                  "The agent knows the objective, but finding the right tools is impossible."
                </p>
                <ul className="space-y-3 text-gray-400 text-base font-light list-disc list-inside marker:text-white/30">
                  <li>Isolated in silos, unable to collaborate dynamically</li>
                  <li>No standard way to discover or compose capabilities</li>
                </ul>
              </div>

            </div>

            {/* Killer Bridge (Bottom/Center) */}
            <div className="mt-auto flex flex-col items-center border-t border-white/10 pt-5 w-full">
              <h4 className="text-xl font-semibold text-white mb-1">Two users. One missing layer.</h4>
              <p className="text-gray-400 font-light text-base">
                <span className="text-white/90 font-medium">Humans</span> need to discover outcomes. <span className="text-white/90 ml-3 font-medium">Agents</span> need to discover capabilities.
              </p>
            </div>
            
          </div>
        )}

        {/* SLIDE 3: The Solution */}
        {currentSlide === 3 && (
          <div className="w-full h-full flex flex-col justify-between animate-in fade-in slide-in-from-right-8 duration-500 pt-4 pb-2 relative">
            
            {/* Top Label */}
            <div className="w-full text-center">
              <span className="text-xs font-bold text-white/40 uppercase tracking-[0.3em]">
                The Solution
              </span>
            </div>

            {/* Central Headline */}
            <div className="text-center self-center max-w-5xl mt-6 mb-8">
              <h2 className="text-4xl font-medium text-white/90 leading-snug">
                Meet Nyxa.<br/>
                <span className="text-white">A marketplace where humans and AI buy completed digital tasks.</span>
              </h2>
            </div>

            {/* Converging Paths */}
            <div className="flex w-full px-12 gap-6 mb-6 items-center justify-between">
              
              {/* Left Path: Human */}
              <div className="flex-1 flex flex-col items-center text-center">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-white/20 pb-2 w-full">
                  👤 Human User
                </h3>
                <p className="text-base font-light italic text-white/70 mb-4 h-12 flex items-center justify-center">
                  "I need a business plan."
                </p>
                
                <div className="text-white/30 my-2 text-xl">↓</div>
                
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 w-full text-sm font-light text-gray-300">
                  Buys a <span className="text-white font-medium">'Business Plan'</span> Task
                </div>

                <div className="text-white/30 my-2 text-xl">↓</div>

                <div className="font-semibold text-white/90 text-lg uppercase tracking-wide">
                  Gets a PDF Report
                </div>
              </div>

              {/* Centerpiece: TASKS */}
              <div className="flex-[1.5] flex flex-col items-center text-center px-4">
                <div className="bg-[#050505] border border-white/20 rounded-2xl p-6 shadow-[0_0_50px_rgba(255,255,255,0.05)] flex flex-col items-center w-full relative overflow-hidden">
                  {/* Subtle highlight */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
                  
                  <h3 className="text-3xl font-bold text-white tracking-widest mb-4">A "TASK"</h3>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-[0.15em] leading-relaxed">
                    A self-contained unit of work created by developers.<br/>
                    <span className="text-white/80 mt-2 block font-bold tracking-[0.2em]">INPUT → CODE EXECUTION → OUTPUT</span>
                  </p>
                </div>
              </div>

              {/* Right Path: AI Agent */}
              <div className="flex-1 flex flex-col items-center text-center">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-white/20 pb-2 w-full">
                  🤖 AI Agent
                </h3>
                <p className="text-base font-light italic text-white/70 mb-4 h-12 flex items-center justify-center">
                  "I need real-time flight data."
                </p>
                
                <div className="text-white/30 my-2 text-xl">↓</div>
                
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 w-full text-sm font-light text-gray-300">
                  Calls a <span className="text-white font-medium">'Flight Scraper'</span> Task
                </div>

                <div className="text-white/30 my-2 text-xl">↓</div>

                <div className="font-semibold text-white/90 text-lg uppercase tracking-wide">
                  Gets a JSON Response
                </div>
              </div>

            </div>

            {/* Bottom Bridge */}
            <div className="mt-auto flex flex-col items-center border-t border-white/10 pt-5 w-full">
              <p className="text-gray-400 font-light text-xl">
                <span className="text-white/90 font-medium">Humans</span> buy tasks. <span className="text-white/90 ml-4 font-medium">AI Agents</span> autonomously hire other AI agents.
              </p>
            </div>
            
          </div>
        )}

        {/* SLIDE 4: The Market */}
        {currentSlide === 4 && (
          <div className="w-full h-full flex flex-col justify-between animate-in fade-in slide-in-from-right-8 duration-500 pt-4 pb-4 relative">
            
            {/* Top Label */}
            <div className="w-full text-center">
              <span className="text-xs font-bold text-white/40 uppercase tracking-[0.3em]">
                The Market
              </span>
            </div>

            {/* Central Headline */}
            <div className="text-center self-center max-w-5xl mt-6 mb-10">
              <h2 className="text-4xl font-medium text-white/90 leading-snug">
                We're not entering one market.<br/>
                <span className="text-white">We're building at the intersection of two.</span>
              </h2>
            </div>

            {/* Two-Column Layout */}
            <div className="flex w-full px-12 gap-12 mb-2 flex-1">
              
              {/* Left Column: The Demand Surfaces */}
              <div className="flex-1 flex flex-col justify-center border-r border-white/10 pr-12">
                <div className="mb-10">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-3">
                    <span className="text-xl">👤</span> Human Task Market
                  </h3>
                  <p className="text-lg text-white/70 font-light leading-relaxed">
                    Humans paying for finished work.
                  </p>
                </div>
                
                <div className="mb-10">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-3">
                    <span className="text-xl">🤖</span> Agentic Market
                  </h3>
                  <p className="text-lg text-white/70 font-light leading-relaxed">
                    AI agents paying for capabilities they don't have.
                  </p>
                </div>

                <div className="pt-8 border-t border-white/10">
                  <p className="text-2xl font-semibold text-white">Two demand surfaces.<br/><span className="text-white/50 font-light">One underlying economy.</span></p>
                </div>
              </div>

              {/* Right Column: TAM/SAM/SOM Zoom-in */}
              <div className="flex-[1.2] flex flex-col justify-center gap-5">
                
                {/* TAM */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 relative overflow-hidden transition-all hover:bg-white/10">
                  <div className="flex justify-between items-end">
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">TAM</h4>
                      <p className="text-sm text-gray-400 font-light">All digital tasks worldwide</p>
                    </div>
                    <div className="text-4xl font-bold text-white tracking-tight">$135B</div>
                  </div>
                </div>

                {/* SAM */}
                <div className="bg-white/10 border border-white/20 rounded-xl p-6 relative overflow-hidden ml-8 transition-all hover:bg-white/15">
                  <div className="flex justify-between items-end">
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">SAM</h4>
                      <p className="text-sm text-gray-300 font-light">Tasks performed by AI agents</p>
                    </div>
                    <div className="text-4xl font-bold text-white tracking-tight">$45B</div>
                  </div>
                </div>

                {/* SOM */}
                <div className="bg-[#050505] border-2 border-white/40 rounded-xl p-6 relative overflow-hidden ml-16 shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all hover:border-white/60">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                  <div className="flex justify-between items-end">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-1">SOM</h4>
                      <p className="text-sm text-white/70 font-light">Our first 10,000 active agents</p>
                    </div>
                    <div className="text-4xl font-bold text-white tracking-tight">$30M</div>
                  </div>
                </div>

              </div>
            </div>
            
          </div>
        )}

        {/* SLIDE 5: One Task Layer */}
        {currentSlide === 5 && (
          <div className="w-full h-full flex flex-col justify-between animate-in fade-in slide-in-from-right-8 duration-500 pt-8 pb-10 relative px-12">
            
            {/* Top Label */}
            <div className="w-full text-center mb-6">
              <h2 className="text-3xl font-medium text-white/90 tracking-wide">
                One Task Layer. Two Users.
              </h2>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 w-full flex items-stretch gap-6 relative max-w-6xl mx-auto">
              
              {/* Left: Human */}
              <div className="flex-1 flex flex-col items-center pt-4">
                <div className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                  <span className="text-purple-400">👤</span> Human consumption
                </div>
                <div className="bg-white/10 px-3 py-1 rounded-md text-[11px] font-mono text-white/70 mb-8 tracking-widest">
                  Intent → Task → Outcome
                </div>

                <div className="w-full max-w-sm flex flex-col items-center">
                  <span className="text-sm text-gray-400 font-bold mb-2 self-start">I need:</span>
                  <div className="bg-[#111] border border-white/20 rounded-md p-3 w-full text-sm text-white/90 text-center shadow-lg">
                    &quot;Create a competitor analysis&quot;
                  </div>
                  
                  <div className="h-8 w-px bg-white/20 my-2"></div>
                  
                  <span className="text-sm text-gray-400 font-bold mb-2">Task Market</span>
                  <div className="flex items-center gap-2">
                    <div className="bg-white/5 border border-white/10 px-2 py-1 rounded text-[11px] text-white/80">Research</div>
                    <span className="text-white/40">→</span>
                    <div className="bg-white/5 border border-white/10 px-2 py-1 rounded text-[11px] text-white/80">Competitor Analysis</div>
                    <span className="text-white/40">→</span>
                    <div className="bg-white/5 border border-white/10 px-2 py-1 rounded text-[11px] text-white/80">Report</div>
                  </div>

                  <div className="h-8 w-px bg-white/20 my-2"></div>
                  
                  <span className="text-sm text-white font-bold tracking-widest mt-2">RESULT</span>
                </div>
              </div>

              {/* Center: The Pill */}
              <div className="w-48 flex flex-col items-center justify-center relative z-10 shrink-0">
                {/* Horizontal connecting lines behind the pill */}
                <div className="absolute w-[160%] h-px bg-white/10 top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10"></div>
                
                <div className="bg-black border border-white/20 rounded-[40px] py-12 px-4 flex flex-col items-center text-center shadow-[0_0_30px_rgba(255,255,255,0.05)] w-full">
                  <span className="text-white font-bold tracking-widest mb-6">TASK LAYER</span>
                  <ul className="text-xs text-gray-400 space-y-4 font-mono leading-relaxed">
                    <li>Discoverable</li>
                    <li>Defined</li>
                    <li>Reusable</li>
                    <li>Composable</li>
                  </ul>
                </div>
              </div>

              {/* Right: Agent */}
              <div className="flex-1 flex flex-col items-center pt-4">
                <div className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                  <span className="text-pink-400">🤖</span> Agent consumption
                </div>
                <div className="bg-white/10 px-3 py-1 rounded-md text-[11px] font-mono text-white/70 mb-8 tracking-widest">
                  Objective → Task → Task → Task → Outcome
                </div>

                <div className="w-full max-w-sm flex flex-col items-center">
                  <span className="text-sm text-gray-400 font-bold mb-2 self-start">Agent objective:</span>
                  <div className="bg-[#111] border border-white/20 rounded-md p-3 w-full text-sm text-white/90 text-center shadow-lg">
                    &quot;Complete market-entry research&quot;
                  </div>
                  
                  <div className="h-8 w-px bg-white/20 my-2"></div>
                  
                  <span className="text-sm text-gray-400 font-bold mb-2">Task Market</span>
                  <div className="flex items-center gap-2">
                    <div className="bg-white/5 border border-white/10 px-2 py-1 rounded text-[11px] text-white/80">Research Task</div>
                    <span className="text-white/40">↔</span>
                    <div className="bg-white/5 border border-white/10 px-2 py-1 rounded text-[11px] text-white/80">Analysis Task</div>
                    <span className="text-white/40">↔</span>
                    <div className="bg-white/5 border border-white/10 px-2 py-1 rounded text-[11px] text-white/80">Data Task</div>
                  </div>

                  <div className="h-8 w-px bg-white/20 my-2"></div>
                  
                  <span className="text-sm text-white font-bold tracking-widest mt-2">RESULT</span>
                </div>
              </div>

            </div>

            {/* Bottom Statement */}
            <div className="w-full text-center mt-6">
              <h3 className="text-[40px] font-medium text-white/95 tracking-tight">
                &quot;Humans consume Tasks. Agents compose Tasks.&quot;
              </h3>
            </div>
            
          </div>
        {/* SLIDE 6: Unit Economics */}
        {currentSlide === 6 && (
          <div className="w-full h-full flex flex-col justify-between animate-in fade-in slide-in-from-right-8 duration-500 pt-8 pb-10 relative px-12">
            
            {/* Top Label */}
            <div className="w-full text-center mb-6">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">
                Business Model & Unit Economics
              </span>
            </div>

            {/* Central Headline */}
            <div className="text-center self-center max-w-5xl mt-2 mb-10">
              <h2 className="text-4xl font-medium text-white/90 leading-snug">
                Software margins.<br/>
                <span className="text-white">Protocol economics.</span>
              </h2>
            </div>

            <div className="flex w-full max-w-5xl mx-auto gap-12 flex-1 items-stretch pb-4">
              
              {/* Left Column: Protocol Take-Rate */}
              <div className="flex-1 flex flex-col justify-center border border-white/10 rounded-2xl p-10 bg-white/[0.02] shadow-[0_0_40px_rgba(255,255,255,0.02)] relative overflow-hidden text-center items-center">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">Protocol Take-Rate</h3>
                <div className="text-6xl font-medium text-white mb-6 tracking-tighter">3.5%</div>
                <p className="text-lg text-white/70 font-light leading-relaxed max-w-sm">
                  We take a transparent fee on every micro-utility executed across the network.
                </p>
                <div className="mt-8 bg-[#0a0a0a] border border-white/10 rounded-lg p-4 w-full flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs font-mono text-gray-500">
                    <span>Task Cost</span><span>$0.10</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-mono text-gray-500 border-b border-white/10 pb-2">
                    <span>Nyxa Fee</span><span className="text-blue-400">+$0.0035</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-mono text-white/90 pt-1">
                    <span>Total Paid</span><span>$0.1035</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Gross Margins */}
              <div className="flex-1 flex flex-col justify-center border border-white/10 rounded-2xl p-10 bg-white/[0.02] shadow-[0_0_40px_rgba(255,255,255,0.02)] relative overflow-hidden text-center items-center">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>
                <h3 className="text-xs font-bold text-green-400 uppercase tracking-widest mb-4">Gross Margins</h3>
                <div className="text-6xl font-medium text-white mb-6 tracking-tighter">95%+</div>
                <p className="text-lg text-white/70 font-light leading-relaxed max-w-sm">
                  Tasks execute on WASM edge sandboxes. Our marginal compute cost approaches zero.
                </p>
                <div className="mt-8 flex flex-col gap-3 w-full items-center">
                  <div className="w-full flex items-center justify-center gap-4">
                    <span className="text-xs font-mono text-gray-500 w-24 text-right">Compute Cost</span>
                    <div className="h-1 flex-1 bg-white/10 rounded overflow-hidden">
                      <div className="w-[5%] h-full bg-gray-500"></div>
                    </div>
                  </div>
                  <div className="w-full flex items-center justify-center gap-4">
                    <span className="text-xs font-mono text-white/80 w-24 text-right">Net Margin</span>
                    <div className="h-1 flex-1 bg-white/10 rounded overflow-hidden">
                      <div className="w-[95%] h-full bg-green-500"></div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Statement */}
            <div className="w-full text-center mt-6">
              <h3 className="text-xl font-light text-gray-400 tracking-wide">
                LTV to CAC ratio projected at <span className="text-white font-medium">48:1+</span>
              </h3>
            </div>
            
          </div>
        )}

      </div>
      
      {/* Slide Controls & Instructions (Hidden in production presentation) */}
      <div className="mt-8 flex flex-col items-center gap-4 opacity-30 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setCurrentSlide(s => Math.max(1, s - 1))}
            disabled={currentSlide === 1}
            className="px-6 py-2 bg-white/5 text-white rounded-md hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Prev
          </button>
          
          <span className="text-gray-400 font-mono">
            Slide {currentSlide} / {totalSlides}
          </span>
          
          <button 
            onClick={() => setCurrentSlide(s => Math.min(totalSlides, s + 1))}
            disabled={currentSlide === totalSlides}
            className="px-6 py-2 bg-white/5 text-white rounded-md hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
        <p className="text-xs text-gray-600 uppercase tracking-widest">Use arrow keys to navigate</p>
      </div>

    </div>
  );
}
