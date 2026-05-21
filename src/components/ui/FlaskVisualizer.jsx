import React, { useMemo } from 'react';
import { Sparkles } from 'lucide-react';

export default function FlaskVisualizer({ 
  chemVolume = 0, 
  waterVolume = 0, 
  totalVolume = 0, 
  ratioText = '1:10',
  chemicalColor = 'emerald'
}) {
  
  // Calculate relative percentages of chemical vs water
  const { chemPercent, waterPercent, totalPercent, isFilled } = useMemo(() => {
    if (!totalVolume || totalVolume <= 0) {
      return { chemPercent: 0, waterPercent: 0, totalPercent: 0, isFilled: false };
    }
    
    const total = chemVolume + waterVolume;
    if (total <= 0) {
      return { chemPercent: 0, waterPercent: 0, totalPercent: 0, isFilled: false };
    }

    // Cap the visual fill height at 85% to prevent overflowing the beaker lip, and minimum at 5% if there's any volume
    const maxVisualHeight = 85; 
    const minVisualHeight = 8;
    
    // Scale fill between 8% and 85%
    const rawTotalPct = (total / totalVolume) * 100;
    const scaledTotalPct = Math.min(
      maxVisualHeight, 
      Math.max(minVisualHeight, (rawTotalPct / 100) * maxVisualHeight)
    );

    const chemRatio = chemVolume / total;
    const chemVisualHeight = scaledTotalPct * chemRatio;
    const waterVisualHeight = scaledTotalPct * (1 - chemRatio);

    return {
      chemPercent: chemVisualHeight,
      waterPercent: waterVisualHeight,
      totalPercent: scaledTotalPct,
      isFilled: true
    };
  }, [chemVolume, waterVolume, totalVolume]);

  // Color preset mapping
  const colorPresets = {
    emerald: {
      liquid: 'url(#grad-emerald)',
      glow: 'shadow-emerald-500/20',
      text: 'text-brand-emerald',
      light: '#10b981',
      dark: '#047857'
    },
    cyan: {
      liquid: 'url(#grad-cyan)',
      glow: 'shadow-cyan-500/20',
      text: 'text-brand-cyan',
      light: '#06b6d4',
      dark: '#0e7490'
    },
    purple: {
      liquid: 'url(#grad-purple)',
      glow: 'shadow-purple-500/20',
      text: 'text-purple-400',
      light: '#c084fc',
      dark: '#7e22ce'
    },
    amber: {
      liquid: 'url(#grad-amber)',
      glow: 'shadow-amber-500/20',
      text: 'text-brand-amber',
      light: '#f59e0b',
      dark: '#b45309'
    }
  };

  const activeColor = colorPresets[chemicalColor] || colorPresets.emerald;

  // Render static markings on the beaker
  const markings = [20, 40, 60, 80, 100];

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900/40 rounded-2xl border border-slate-800/80 shadow-inner w-full max-w-sm mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-4 h-4 text-brand-cyan" />
        <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Live Mix Visualization</span>
      </div>

      {/* SVG Beaker Containment */}
      <div className="relative w-48 h-72 flex items-center justify-center">
        <svg 
          viewBox="0 0 200 280" 
          className="w-full h-full drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]"
        >
          {/* Definitions for gradients and clips */}
          <defs>
            {/* Beaker Clip Path for Liquid Inner Boundaries */}
            <clipPath id="beaker-clip">
              <path d="M 33,26 L 33,250 A 10,10 0 0 0 43,260 L 157,260 A 10,10 0 0 0 167,250 L 167,26 Z" />
            </clipPath>

            {/* Chemical Gradients */}
            <linearGradient id="grad-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            <linearGradient id="grad-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>

            <linearGradient id="grad-purple" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>

            <linearGradient id="grad-amber" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>

            {/* Diluent Gradient (Water) */}
            <linearGradient id="grad-water" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.85" />
            </linearGradient>
          </defs>

          {/* Liquid Rendering (Clipped inside Beaker) */}
          {isFilled && (
            <g clipPath="url(#beaker-clip)">
              
              {/* 1. Chemical Concentrate Layer (Bottom) */}
              <rect
                x="20"
                y={260 - (chemPercent / 100) * 234}
                width="160"
                height={(chemPercent / 100) * 234 + 10}
                fill={activeColor.liquid}
                className="transition-all duration-500 ease-out"
              />

              {/* 2. Diluent (Water) Layer (Stacked on top of Chemical) */}
              <rect
                x="20"
                y={260 - (totalPercent / 100) * 234}
                width="160"
                height={(waterPercent / 100) * 234}
                fill="url(#grad-water)"
                className="transition-all duration-500 ease-out"
              />

              {/* Liquid Interface Shadow Line */}
              {chemPercent > 0 && waterPercent > 0 && (
                <line 
                  x1="30" 
                  y1={260 - (chemPercent / 100) * 234} 
                  x2="170" 
                  y2={260 - (chemPercent / 100) * 234} 
                  stroke="rgba(255,255,255,0.15)" 
                  strokeWidth="2"
                  className="transition-all duration-500 ease-out"
                />
              )}

              {/* Rising Bubble Particles (Animated via CSS) */}
              {chemPercent > 0 && (
                <g className="opacity-70">
                  <circle cx="60" cy="220" r="3" fill="#ffffff" className="animate-bounce" style={{ animationDuration: '3s' }} />
                  <circle cx="140" cy="235" r="2" fill="#ffffff" className="animate-bounce" style={{ animationDuration: '2.2s', animationDelay: '0.4s' }} />
                  <circle cx="95" cy="200" r="4" fill="#ffffff" className="animate-pulse" style={{ animationDuration: '2.5s', animationDelay: '0.8s' }} />
                  <circle cx="75" cy="245" r="2" fill="#ffffff" className="animate-pulse" style={{ animationDuration: '1.8s', animationDelay: '1.2s' }} />
                  <circle cx="120" cy="210" r="3.5" fill="#ffffff" className="animate-bounce" style={{ animationDuration: '2.8s', animationDelay: '0.1s' }} />
                </g>
              )}
            </g>
          )}

          {/* Beaker Markings / Tick Lines */}
          <g stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5">
            {markings.map((mark) => {
              // Map 20-100 markings to y-coordinates from 215 down to 50
              const yVal = 260 - (mark / 100) * 210;
              return (
                <g key={mark}>
                  <line x1="135" y1={yVal} x2="160" y2={yVal} />
                  <text 
                    x="128" 
                    y={yVal + 4} 
                    fill="rgba(255,255,255,0.3)" 
                    fontSize="9.5" 
                    fontFamily="Outfit, sans-serif"
                    fontWeight="500"
                    textAnchor="end"
                    stroke="none"
                  >
                    {mark}%
                  </text>
                </g>
              );
            })}
          </g>

          {/* Glass Beaker Physical Outline */}
          {/* Custom path containing pouring lip, glass collar, outer walls and flat-rounded base */}
          <path 
            d="M 23,26 L 30,26 L 30,250 A 12,12 0 0 0 42,262 L 158,262 A 12,12 0 0 0 170,250 L 170,26 L 177,26 L 177,20 L 23,20 Z" 
            fill="none" 
            stroke="rgba(255, 255, 255, 0.25)" 
            strokeWidth="5.5" 
            strokeLinejoin="round" 
          />

          {/* Inner Highlights representing glass reflections */}
          <path 
            d="M 37,35 L 37,245 A 6,6 0 0 0 43,251 L 60,251" 
            fill="none" 
            stroke="rgba(255, 255, 255, 0.08)" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
          />
        </svg>

        {/* Center Overlay Floating Percentage Badge */}
        {isFilled && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-6">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Ratio</span>
            <span className="text-xl font-black text-white bg-slate-950/80 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-slate-800 shadow-md">
              {ratioText}
            </span>
          </div>
        )}
      </div>

      {/* Visual Volume Summary Label below flask */}
      {isFilled ? (
        <div className="mt-4 flex flex-col items-center gap-1.5 w-full text-xs">
          <div className="flex justify-between w-full text-slate-400 border-b border-slate-800/60 pb-1.5 px-1">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-brand-cyan inline-block"></span>
              Water
            </span>
            <span className="font-semibold text-slate-200">
              {waterVolume.toFixed(2)} unit{(waterVolume !== 1) ? 's' : ''}
            </span>
          </div>
          <div className="flex justify-between w-full text-slate-400 px-1 pt-0.5">
            <span className="flex items-center gap-1">
              <span className={`w-2.5 h-2.5 rounded inline-block`} style={{ backgroundColor: activeColor.light }}></span>
              Concentrate
            </span>
            <span className={`font-semibold ${activeColor.text}`}>
              {chemVolume.toFixed(2)} unit{(chemVolume !== 1) ? 's' : ''}
            </span>
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-500 mt-4 text-center">
          Enter amounts to see the chemical mixture composition.
        </p>
      )}
    </div>
  );
}
