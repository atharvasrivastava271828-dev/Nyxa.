'use client';

import { useState, useEffect } from 'react';

export default function PitchMock() {
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = 1; // Update this as we add more slides

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
        className="relative w-full max-w-6xl aspect-video bg-black overflow-hidden flex flex-col items-center justify-center text-center p-12 transition-all duration-500"
      >
        
        {/* SLIDE 1 */}
        {currentSlide === 1 && (
          <div className="w-full h-full flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500 relative">
            
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
