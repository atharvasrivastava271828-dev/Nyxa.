'use client';

import { useState, useEffect } from 'react';

export default function PitchMock() {
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = 10; // Updated to 10 slides

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
        className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10 flex flex-col items-center justify-center p-12 transition-all duration-500"
        style={{ maxHeight: '85vh', maxWidth: 'min(1200px, calc(85vh * 16 / 9))' }}
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
                  &quot;I know what I need, but not which tool can reliably get it done.&quot;
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
                  &quot;The agent knows the objective, but finding the right tools is impossible.&quot;
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
                  &quot;I need a business plan.&quot;
                </p>
                
                <div className="text-white/30 my-2 text-xl">↓</div>
                
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 w-full text-sm font-light text-gray-300">
                  Buys a <span className="text-white font-medium">&apos;Business Plan&apos;</span> Task
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
                  
                  <h3 className="text-3xl font-bold text-white tracking-widest mb-4">A &quot;TASK&quot;</h3>
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
                  &quot;I need real-time flight data.&quot;
                </p>
                
                <div className="text-white/30 my-2 text-xl">↓</div>
                
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 w-full text-sm font-light text-gray-300">
                  Calls a <span className="text-white font-medium">&apos;Flight Scraper&apos;</span> Task
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
                We&apos;re not entering one market.<br/>
                <span className="text-white">We&apos;re building at the intersection of two.</span>
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
                    AI agents paying for capabilities they don&apos;t have.
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

              {/* Center: The Task Market Wireframe */}
              <div className="w-64 flex flex-col items-center justify-center relative z-10 shrink-0">
                {/* Horizontal connecting lines behind the wireframe */}
                <div className="absolute w-[160%] h-px bg-white/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10"></div>
                
                <div className="bg-[#050505] border border-white/20 rounded-xl p-6 flex flex-col shadow-[0_0_30px_rgba(255,255,255,0.05)] w-full relative">
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-black px-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Product Demo</div>
                  <div className="text-center mb-6 mt-2">
                    <span className="text-white text-sm font-bold tracking-widest">TASK MARKET</span>
                  </div>
                  <div className="space-y-4 font-mono text-[11px] text-white/80">
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-2 rounded"><span className="text-white/40">📋</span> Research</div>
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-2 rounded"><span className="text-white/40">📋</span> Data Analysis</div>
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-2 rounded ring-1 ring-white/30"><span className="text-white/40">📋</span> Competitor Report</div>
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-2 rounded"><span className="text-white/40">📋</span> Translation</div>
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-2 rounded"><span className="text-white/40">📋</span> Design</div>
                  </div>
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
        )}
        
        {/* SLIDE 6: Business Model */}
        {currentSlide === 6 && (
          <div className="w-full h-full flex flex-col justify-between animate-in fade-in slide-in-from-right-8 duration-500 pt-8 pb-10 relative px-12">
            
            {/* Top Label */}
            <div className="w-full text-center mb-2">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">
                Business Model
              </span>
            </div>

            {/* Central Headline */}
            <div className="text-center self-center max-w-5xl mt-2 mb-6">
              <h2 className="text-4xl font-medium text-white/90 leading-snug tracking-wide">
                One Marketplace, Two Customer Markets.
              </h2>
            </div>

            {/* Center Diagram (The Marketplace Model) */}
            <div className="flex-1 w-full max-w-5xl mx-auto flex flex-col justify-center items-center">
              
              <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 w-full max-w-3xl flex flex-col items-center relative shadow-[0_0_40px_rgba(255,255,255,0.02)]">
                
                {/* Task Creators */}
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">TASK CREATORS</div>
                <div className="text-white/30 mb-2">↓</div>

                {/* Task Market */}
                <div className="border border-white/30 rounded px-6 py-2 mb-4 bg-white/5">
                  <span className="text-white font-mono text-sm tracking-widest">TASK MARKET</span>
                </div>

                {/* Split line */}
                <div className="w-px h-6 bg-white/30"></div>
                <div className="w-96 h-px bg-white/30"></div>
                <div className="w-96 flex justify-between">
                  <div className="w-px h-4 bg-white/30"></div>
                  <div className="w-px h-4 bg-white/30"></div>
                </div>

                {/* Left (B2C) & Right (B2B) */}
                <div className="w-[480px] flex justify-between mt-2">
                  
                  {/* B2C */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-purple-400">👤</span>
                      <span className="text-[11px] font-bold text-white uppercase tracking-widest">B2C HUMANS</span>
                    </div>
                    <span className="text-xs text-white/70 font-mono mb-2">Buy Tasks</span>
                    <span className="text-white/30 text-[10px] mb-2">↓</span>
                    <span className="text-xs text-white/90 font-mono font-bold">Outcome</span>
                  </div>

                  {/* B2B */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-pink-400">🤖</span>
                      <span className="text-[11px] font-bold text-white uppercase tracking-widest">B2B AGENTS</span>
                    </div>
                    <span className="text-xs text-white/70 font-mono mb-2">Consume Tasks</span>
                    <span className="text-white/30 text-[10px] mb-2">↓</span>
                    <span className="text-xs text-white/90 font-mono font-bold">Larger Outcome</span>
                  </div>

                </div>

              </div>
              
              {/* Strong statement */}
              <div className="mt-8 px-12 text-center max-w-4xl border-l-4 border-white/20 pl-8 text-left bg-white/[0.02] py-4 rounded-r-lg">
                <p className="text-lg text-white/80 font-light leading-relaxed">
                  &quot;We&apos;re primarily B2C: humans come to the marketplace to buy Tasks and get things done. But the same marketplace can become B2B infrastructure for AI agents, allowing them to discover and consume Tasks as capabilities. So one Task marketplace serves two markets—and we monetize whenever digital work happens.&quot;
                </p>
              </div>

            </div>

            {/* Bottom Statement */}
            <div className="w-full text-center mt-6">
              <h3 className="text-2xl font-medium text-white/95 tracking-tight">
                B2C today. B2B for the agentic economy. <span className="text-white font-bold border-b-2 border-white/30 pb-1">One marketplace revenue model.</span>
              </h3>
            </div>
            
          </div>
        )}

        {/* SLIDE 7: Traction & Validation */}
        {currentSlide === 7 && (
          <div className="w-full h-full flex flex-col justify-between animate-in fade-in slide-in-from-right-8 duration-500 pt-8 pb-10 relative px-12">
            
            {/* Top Label */}
            <div className="w-full text-center mb-6">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">
                Traction & Validation
              </span>
            </div>

            {/* Central Headline */}
            <div className="text-center self-center max-w-5xl mt-2 mb-10">
              <h2 className="text-4xl font-medium text-white/90 leading-snug tracking-wide">
                From Idea → Validation → Momentum
              </h2>
            </div>

            {/* The Progression Timeline */}
            <div className="flex-1 w-full max-w-5xl mx-auto flex flex-col justify-center items-center">
              
              {/* Huge Number Callout */}
              <div className="mb-14 text-center">
                <div className="text-7xl font-medium text-white tracking-tighter mb-2">2×</div>
                <div className="text-xl text-white/80 font-bold tracking-widest uppercase mt-4">Competition Selections</div>
                <p className="text-sm text-white/50 mt-2 font-mono">Our concept has been selected to advance in two competitive settings.</p>
              </div>

              {/* The Timeline Diagram */}
              <div className="flex items-start justify-center gap-6 w-full max-w-4xl relative">
                
                {/* Connecting Lines */}
                <div className="absolute top-[52px] left-[10%] right-[10%] h-px bg-white/20 -z-10"></div>
                
                {/* IDEA */}
                <div className="flex-1 flex flex-col items-center bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-lg z-10">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">IDEA</span>
                  <div className="w-px h-6 bg-white/20 mb-4"></div>
                  <span className="text-sm text-white font-medium mb-1">AI2AI</span>
                  <span className="text-sm text-white/60">Agents</span>
                </div>

                <div className="text-white/30 pt-12 text-xl font-light">→</div>

                {/* PRODUCT */}
                <div className="flex-1 flex flex-col items-center bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-lg z-10">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">PRODUCT</span>
                  <div className="w-px h-6 bg-white/20 mb-4"></div>
                  <span className="text-sm text-white font-medium mb-1">Tasks built</span>
                  <span className="text-sm text-white/60">Prototype</span>
                </div>

                <div className="text-white/30 pt-12 text-xl font-light">→</div>

                {/* VALIDATION */}
                <div className="flex-1 flex flex-col items-center bg-[#0a0a0a] border border-blue-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(59,130,246,0.1)] ring-1 ring-blue-500/20 z-10">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4">VALIDATION</span>
                  <div className="w-px h-6 bg-blue-500/50 mb-4"></div>
                  <span className="text-sm text-white font-medium mb-1">Selection</span>
                  <span className="text-sm text-white/60">Feedback</span>
                </div>

                <div className="text-white/30 pt-12 text-xl font-light">→</div>

                {/* MARKET */}
                <div className="flex-1 flex flex-col items-center bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-lg z-10">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">MARKET</span>
                  <div className="w-px h-6 bg-white/20 mb-4"></div>
                  <span className="text-sm text-white font-medium mb-1">B2C launch</span>
                  <div className="text-white/30 text-xs my-2">↓</div>
                  <span className="text-sm text-white/60">B2B Agents</span>
                </div>

              </div>
              
              {/* Bottom Quote */}
              <div className="mt-16 px-12 text-center max-w-4xl border-l-4 border-white/20 pl-8 text-left bg-white/[0.02] py-4 rounded-r-lg">
                <p className="text-lg text-white/80 font-light leading-relaxed italic">
                  &quot;We&apos;re no longer validating whether we can build it. We&apos;re validating whether people will repeatedly use and pay for it.&quot;
                </p>
              </div>

            </div>
            
          </div>
        )}

        {/* SLIDE 8: Team */}
        {currentSlide === 8 && (
          <div className="w-full h-full flex flex-col justify-between animate-in fade-in slide-in-from-right-8 duration-500 pt-8 pb-10 relative px-12">
            
            {/* Top Label */}
            <div className="w-full text-center mb-6">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">
                The Team
              </span>
            </div>

            {/* Central Headline */}
            <div className="text-center self-center max-w-5xl mt-2 mb-16">
              <h2 className="text-4xl font-medium text-white/90 leading-snug tracking-wide">
                Built by a young engineer obsessed with zero-friction systems.
              </h2>
            </div>

            {/* 4-Column Layout (Inspired by the reference image's flow) */}
            <div className="flex-1 w-full max-w-5xl mx-auto flex items-stretch justify-between gap-4 border-t border-b border-white/10 py-12">
              
              {/* Col 1 */}
              <div className="flex-1 pr-6 border-r border-white/10 last:border-0">
                <h3 className="text-lg font-bold text-white mb-6">Founder</h3>
                <ul className="space-y-4 text-sm text-gray-400 font-light">
                  <li>
                    <strong className="text-white font-medium">Atharva Srivastava</strong><br/>
                    <span className="text-white/60">High Schooler & Developer</span>
                  </li>
                </ul>
              </div>

              {/* Col 2 */}
              <div className="flex-1 px-6 border-r border-white/10 last:border-0">
                <h3 className="text-lg font-bold text-white mb-6">Execution Velocity</h3>
                <p className="text-sm text-gray-400 font-light leading-relaxed">
                  A rapid learner and relentless builder. Capable of turning complex conceptual architectures into working prototypes at high speed, without legacy baggage.
                </p>
              </div>

              {/* Col 3 */}
              <div className="flex-1 px-6 border-r border-white/10 last:border-0">
                <h3 className="text-lg font-bold text-white mb-6">Domain Obsession</h3>
                <p className="text-sm text-gray-400 font-light leading-relaxed">
                  Deeply obsessed with systems design and the future of machine-to-machine interactions. Building the autonomous layer because it is the inevitable next step for AI.
                </p>
              </div>

              {/* Col 4 */}
              <div className="flex-1 pl-6">
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 shadow-lg h-full">
                  <h3 className="text-xs font-bold text-white mb-4 uppercase tracking-wider border-b border-white/10 pb-2">Investors Evaluate:</h3>
                  <ul className="space-y-3 text-sm font-light text-white/70 list-disc list-inside marker:text-white/30">
                    <li>High coachability</li>
                    <li>Relentless passion</li>
                    <li>Execution ability</li>
                    <li>Deep domain curiosity</li>
                  </ul>
                </div>
              </div>

            </div>
            
            {/* Bottom Statement */}
            <div className="w-full text-center mt-12">
              <h3 className="text-xl font-medium text-white/60 tracking-wide">
                Age is a number. Execution is everything.
              </h3>
            </div>
            
            </div>
            
          </div>
        )}

        {/* SLIDE 9: Competition / USP */}
        {currentSlide === 9 && (
          <div className="w-full h-full flex flex-col justify-between animate-in fade-in slide-in-from-right-8 duration-500 pt-6 pb-8 relative px-12">
            
            {/* Top Label */}
            <div className="w-full text-center mb-4">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">
                Competition & Positioning
              </span>
            </div>

            {/* Central Headline */}
            <div className="text-center self-center max-w-5xl mb-10">
              <h2 className="text-[32px] font-medium text-white/90 leading-tight">
                We&apos;re not competing with one product.<br/>
                <span className="text-white">We&apos;re connecting two fragmented markets.</span>
              </h2>
            </div>

            {/* Middle Section: 2x2 Matrix & Visual Flow */}
            <div className="flex-1 w-full max-w-6xl mx-auto flex items-center justify-between gap-12">
              
              {/* Left: 2x2 Positioning Matrix */}
              <div className="flex-[1.2] w-full">
                <div className="w-full border border-white/10 rounded-xl overflow-hidden bg-white/[0.02]">
                  {/* Headers */}
                  <div className="grid grid-cols-3 border-b border-white/10 bg-white/[0.05]">
                    <div className="p-4"></div>
                    <div className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-l border-white/10">Human-first</div>
                    <div className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-l border-white/10">Agent-first</div>
                  </div>
                  {/* Row 1 */}
                  <div className="grid grid-cols-3 border-b border-white/10">
                    <div className="p-4 text-sm font-bold text-gray-300 uppercase tracking-wide flex items-center">Tools / capabilities</div>
                    <div className="p-4 text-sm font-light text-white/70 border-l border-white/10 flex items-center">AI apps, automation tools</div>
                    <div className="p-4 text-sm font-light text-white/70 border-l border-white/10 flex items-center">Agent marketplaces</div>
                  </div>
                  {/* Row 2 */}
                  <div className="grid grid-cols-3">
                    <div className="p-4 text-sm font-bold text-gray-300 uppercase tracking-wide flex items-center">Digital work / outcomes</div>
                    <div className="p-4 text-sm font-light text-white/70 border-l border-white/10 flex items-center">Task / freelance marketplaces</div>
                    <div className="p-4 text-sm font-bold text-white bg-blue-500/10 border-l border-white/10 shadow-[inset_0_0_20px_rgba(59,130,246,0.15)] flex items-center leading-snug">
                      NYXA — Task layer for both
                    </div>
                  </div>
                </div>
                
                {/* USP Text below matrix */}
                <div className="mt-6 border-l-2 border-blue-500/50 pl-4 py-1">
                  <p className="text-[15px] text-white/80 font-light leading-relaxed">
                    <strong className="text-white font-medium">Our USP:</strong> One Task ecosystem that humans can consume directly—and AI agents can discover, compose, and execute autonomously.
                  </p>
                </div>
              </div>

              {/* Right: Interaction Flow */}
              <div className="flex-1 flex flex-col items-start justify-center gap-2 pl-6 border-l border-white/10">
                
                {/* Human Flow */}
                <div className="mb-4">
                  <div className="text-sm font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2 mb-2">
                    <span className="text-xl">👤</span> Human
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 font-mono text-sm text-white/80">
                    Intent → <strong className="text-white">Task</strong> → Outcome
                  </div>
                </div>

                {/* The Bridge */}
                <div className="h-10 border-l-2 border-dashed border-white/30 ml-8 flex items-center">
                  <span className="ml-4 text-xs font-bold uppercase tracking-widest text-blue-400">↕ Same Task Layer</span>
                </div>

                {/* Agent Flow */}
                <div className="mt-4">
                  <div className="text-sm font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2 mb-2">
                    <span className="text-xl">🤖</span> Agent
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 font-mono text-sm text-white/80 leading-relaxed">
                    Objective → <strong className="text-white">Task → Task → Task</strong> → Larger Outcome
                  </div>
                </div>
                
              </div>
            </div>
            
            {/* Huge USP Quote at Bottom */}
            <div className="w-full text-center mt-auto border-t border-white/10 pt-8">
              <h3 className="text-3xl font-medium text-white tracking-tight mb-2">
                &quot;Humans consume Tasks. Agents compose Tasks.&quot;
              </h3>
              <p className="text-sm font-light text-gray-400 uppercase tracking-[0.2em]">
                Same supply. Two demand surfaces. One marketplace economy.
              </p>
            </div>
            
            </div>
            
          </div>
        )}

        {/* SLIDE 10: Roadmap */}
        {currentSlide === 10 && (
          <div className="w-full h-full flex flex-col justify-between animate-in fade-in slide-in-from-right-8 duration-500 pt-8 pb-10 relative px-12">
            
            {/* Top Label */}
            <div className="w-full text-center mb-6">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">
                Roadmap
              </span>
            </div>

            {/* Central Headline */}
            <div className="text-center self-center max-w-5xl mb-12">
              <h2 className="text-4xl font-medium text-white/90 leading-snug tracking-wide">
                From Tasks to an Agentic Economy
              </h2>
            </div>

            {/* Content: Left Flowchart, Right Phases */}
            <div className="flex-1 w-full max-w-6xl mx-auto flex items-start gap-12">
              
              {/* Left: Expanding Outward Visual */}
              <div className="flex-[0.8] bg-[#050505] border border-white/10 rounded-xl p-8 flex flex-col items-center justify-center relative shadow-lg">
                
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">TODAY</div>
                <div className="w-px h-6 bg-white/20 mb-4"></div>
                
                <div className="border border-white/30 rounded px-6 py-4 text-center w-48 bg-white/[0.02]">
                  <div className="text-sm font-bold text-white uppercase tracking-wider">TASK MARKET</div>
                  <div className="text-xs text-gray-400 mt-1">B2C</div>
                </div>

                <div className="w-px h-8 bg-white/20 my-2 relative">
                  <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 text-white/30 text-[10px]">▼</div>
                </div>

                <div className="border border-white/30 rounded px-6 py-4 text-center w-48 bg-white/[0.02]">
                  <div className="text-sm font-bold text-white uppercase tracking-wider">AGENT LAYER</div>
                  <div className="text-xs text-gray-400 mt-1">AI2AI + Tasks</div>
                </div>

                <div className="w-px h-8 bg-white/20 my-2 relative">
                  <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 text-white/30 text-[10px]">▼</div>
                </div>

                {/* Fork */}
                <div className="w-48 border-t border-white/20 h-4 flex justify-between relative">
                   <div className="w-px h-4 bg-white/20 absolute left-0 top-0"></div>
                   <div className="w-px h-4 bg-white/20 absolute right-0 top-0"></div>
                </div>

                <div className="flex w-full justify-center gap-12">
                  <div className="text-center w-20">
                    <div className="text-[10px] font-bold text-white uppercase tracking-widest">HUMAN MARKET</div>
                    <div className="w-px h-6 bg-white/20 mx-auto my-2"></div>
                  </div>
                  <div className="text-center w-20">
                    <div className="text-[10px] font-bold text-white uppercase tracking-widest">AGENT MARKET</div>
                    <div className="w-px h-6 bg-white/20 mx-auto my-2"></div>
                  </div>
                </div>

                {/* Join */}
                <div className="w-48 border-b border-white/20 h-4 flex justify-between relative mb-2">
                   <div className="w-px h-4 bg-white/20 absolute left-0 bottom-0"></div>
                   <div className="w-px h-4 bg-white/20 absolute right-0 bottom-0"></div>
                </div>
                
                <div className="w-px h-4 bg-white/20 mb-2 relative">
                  <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 text-white/30 text-[10px]">▼</div>
                </div>

                <div className="text-sm font-bold text-blue-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                  <span className="text-lg">🌐</span> AGENTIC ECONOMY
                </div>

              </div>

              {/* Right: Phases List */}
              <div className="flex-[1.2] flex flex-col gap-6 overflow-y-auto pr-4" style={{ maxHeight: '55vh' }}>
                
                {/* Phase 1 */}
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-1">PHASE 1 — Prove the Task Economy</h3>
                  <div className="text-xs text-blue-400 font-mono mb-3">Now → 6 months</div>
                  <ul className="space-y-1 text-sm text-gray-400 font-light list-disc list-inside marker:text-white/30 ml-2">
                    <li>Launch B2C Task marketplace</li>
                    <li>Build initial high-value Tasks</li>
                    <li>Onboard Task creators</li>
                    <li>Validate repeat usage & willingness to pay</li>
                    <li>Establish trust, quality & ratings</li>
                  </ul>
                </div>
                
                <div className="text-white/20 text-xs ml-4">↓</div>

                {/* Phase 2 */}
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-1">PHASE 2 — Build the Agent Layer</h3>
                  <div className="text-xs text-blue-400 font-mono mb-3">6 → 12 months</div>
                  <ul className="space-y-1 text-sm text-gray-400 font-light list-disc list-inside marker:text-white/30 ml-2">
                    <li>Enable agents to discover Tasks</li>
                    <li>Enable agents to consume and compose Tasks</li>
                    <li>Reintroduce AI2AI communication</li>
                    <li>Pilot with developers / businesses</li>
                    <li>Validate B2B agentic use cases</li>
                  </ul>
                </div>

                <div className="text-white/20 text-xs ml-4">↓</div>

                {/* Phase 3 */}
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-1">PHASE 3 — Connect the Two Markets</h3>
                  <div className="text-xs text-blue-400 font-mono mb-3">12 → 24 months</div>
                  <ul className="space-y-1 text-sm text-gray-400 font-light list-disc list-inside marker:text-white/30 ml-2">
                    <li>Humans consume Tasks directly</li>
                    <li>Agents autonomously discover & compose Tasks</li>
                    <li>Shared reputation / quality infrastructure</li>
                    <li>Marketplace flywheel begins</li>
                  </ul>
                </div>

                <div className="text-white/20 text-xs ml-4">↓</div>

                {/* Phase 4 */}
                <div className="bg-white/[0.03] border-l-2 border-blue-500/50 p-4 rounded-r-lg">
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-1">PHASE 4 — The Agentic Economy</h3>
                  <div className="text-xs text-blue-400 font-mono mb-2">24+ months</div>
                  <p className="text-sm text-white/80 font-medium">
                    Humans ask for outcomes. Agents ask for capabilities. Tasks connect both.
                  </p>
                </div>

              </div>
            </div>
            
            {/* Bottom Statement */}
            <div className="w-full text-center mt-12 border-t border-white/10 pt-8">
              <h3 className="text-2xl font-light text-white/80 tracking-wide italic">
                &quot;Start with what humans want done. Build toward a world where agents can get it done for them.&quot;
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
