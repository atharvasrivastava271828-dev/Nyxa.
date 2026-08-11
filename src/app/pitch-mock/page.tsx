'use client';

import { useState, useEffect } from 'react';

export default function PitchMock() {
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = 2; // Updated to 2 slides

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
          <div className="w-full h-full flex flex-col items-center animate-in fade-in slide-in-from-right-8 duration-500 pt-8 relative">
            
            {/* Central Question */}
            <div className="text-center mb-16 max-w-4xl">
              <h2 className="text-4xl font-semibold text-white/90 leading-snug">
                We have more digital capability than ever—<br />
                <span className="text-yellow-500/90 font-medium">but why is getting work done still so fragmented?</span>
              </h2>
            </div>

            {/* Two Sides */}
            <div className="flex w-full px-8 gap-16 mb-8">
              
              {/* Left Side: Humans */}
              <div className="flex-1 flex flex-col">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-white/10 pb-4">
                  For Humans <span className="text-white ml-2 opacity-50">— Task Fragmentation</span>
                </h3>
                <p className="text-xl font-light italic text-white/70 mb-8 border-l-2 border-yellow-500/50 pl-4 py-1">
                  "I know what I need, but not which tool can reliably get it done."
                </p>
                <ul className="space-y-4 text-gray-400 text-lg font-light list-disc list-inside marker:text-white/20">
                  <li>Too many apps and workflows</li>
                  <li>Need to learn tools instead of focusing on outcomes</li>
                  <li>Repetitive digital work gets rebuilt again and again</li>
                  <li>Hard to know what output to trust</li>
                </ul>
              </div>

              {/* Right Side: Agents */}
              <div className="flex-1 flex flex-col">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-white/10 pb-4">
                  For AI Agents <span className="text-white ml-2 opacity-50">— Capability Fragmentation</span>
                </h3>
                <p className="text-xl font-light italic text-white/70 mb-8 border-l-2 border-yellow-500/50 pl-4 py-1">
                  "An agent may know what needs to be done, but finding specialized agents is difficult."
                </p>
                <ul className="space-y-4 text-gray-400 text-lg font-light list-disc list-inside marker:text-white/20">
                  <li>Agents are isolated</li>
                  <li>Capabilities aren't easily discoverable</li>
                  <li>Complex objectives require multiple specialized agents</li>
                  <li>Agents need a way to find, use and compose Tasks</li>
                </ul>
              </div>

            </div>

            {/* Killer Bridge (Bottom/Center) */}
            <div className="absolute bottom-12 flex flex-col items-center bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-xl px-12 py-6 w-11/12 max-w-4xl shadow-2xl">
              <h4 className="text-2xl font-semibold text-white mb-3">Two users. One missing layer.</h4>
              <p className="text-gray-400 font-light text-lg">
                <span className="text-white/80">Humans</span> need a way to discover outcomes. <span className="text-white/80 ml-2">Agents</span> need a way to discover capabilities.
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
