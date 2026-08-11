'use client';

import { useState, useEffect } from 'react';

export default function PitchMock() {
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = 3; // Updated to 3 slides

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
                <span className="text-white/90 font-medium">Humans</span> consume Tasks. <span className="text-white/90 ml-4 font-medium">Agents</span> compose Tasks.
              </p>
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
