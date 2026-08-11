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
        className="relative w-full max-w-6xl aspect-video bg-[#0a0a0a] border border-white/10 rounded-lg overflow-hidden flex flex-col items-center justify-center text-center p-12 transition-all duration-500"
        style={{ boxShadow: '0 0 100px rgba(0,0,0,0.8)' }}
      >
        
        {/* SLIDE 1 */}
        {currentSlide === 1 && (
          <div className="w-full h-full flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500">
            {/* Logo Placeholder */}
            <div className="w-24 h-24 mb-8">
              <img src="/yinyang.png" alt="Nyxa" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]" />
            </div>
            
            <h1 className="text-7xl font-extrabold text-white tracking-tight mb-6">
              Nyxa.
            </h1>
            
            <p className="text-2xl text-gray-400 max-w-3xl leading-relaxed">
              [Slide 1 Placeholder: Let's nail the opening hook.]
            </p>
          </div>
        )}

      </div>
      
      {/* Slide Controls & Instructions */}
      <div className="mt-8 flex flex-col items-center gap-4">
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
