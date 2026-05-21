import React, { useMemo } from 'react';
import { Zap, Flame, Flag, Sparkles } from 'lucide-react';

export default function RangeRoadVisualizer({ 
  gasRange = 0, 
  evRange = 0, 
  unit = 'mi'
}) {
  
  // Calculate relative positions (0% to 100% of track length)
  const { gasPercent, evPercent, maxRange, evLeadMultiplier } = useMemo(() => {
    const max = Math.max(gasRange, evRange, 1);
    
    // Scale position between 10% (start) and 88% (end) to keep cars fully inside the container
    const startOffset = 10;
    const endOffset = 88;
    const trackWidth = endOffset - startOffset;

    const gasPct = startOffset + (gasRange / max) * trackWidth;
    const evPct = startOffset + (evRange / max) * trackWidth;

    const multiplier = gasRange > 0 ? (evRange / gasRange) : 0;

    return {
      gasPercent: gasPct,
      evPercent: evPct,
      maxRange: max,
      evLeadMultiplier: multiplier
    };
  }, [gasRange, evRange]);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900/40 rounded-2xl border border-slate-800/80 shadow-inner w-full mx-auto space-y-6">
      
      <div className="flex items-center justify-between w-full border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-cyan" />
          <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Visual Range comparison</span>
        </div>
        {evLeadMultiplier > 1 && (
          <span className="text-[10px] font-bold text-brand-cyan bg-brand-cyan/15 px-2 py-0.5 rounded border border-brand-cyan/25">
            EV drives {evLeadMultiplier.toFixed(1)}x further
          </span>
        )}
      </div>

      {/* SVG Highway Container */}
      <div className="relative w-full h-56 bg-slate-950/60 rounded-xl border border-slate-850 p-2 overflow-hidden">
        
        {/* Sky Background Glow */}
        <div className="absolute top-0 left-1/4 w-32 h-32 rounded-full bg-brand-amber/5 blur-[40px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-32 h-32 rounded-full bg-brand-cyan/5 blur-[40px] pointer-events-none"></div>

        <svg viewBox="0 0 600 200" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            {/* Ambient car glows */}
            <filter id="glow-gas" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-ev" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Road 1: Gas Car Lane (Top) */}
          {/* Main Road Bed */}
          <rect x="0" y="30" width="600" height="60" fill="#1e293b" opacity="0.3" />
          {/* Top Shoulder border */}
          <line x1="0" y1="30" x2="600" y2="30" stroke="#334155" strokeWidth="2" />
          {/* Bottom Shoulder border */}
          <line x1="0" y1="90" x2="600" y2="90" stroke="#475569" strokeWidth="3" />
          {/* Dash Road Divider */}
          <line x1="0" y1="60" x2="600" y2="60" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="1.5" strokeDasharray="12, 16" />

          {/* Road 2: EV Lane (Bottom) */}
          {/* Main Road Bed */}
          <rect x="0" y="110" width="600" height="60" fill="#1e293b" opacity="0.3" />
          {/* Top Shoulder border */}
          <line x1="0" y1="110" x2="600" y2="110" stroke="#334155" strokeWidth="2" />
          {/* Bottom Shoulder border */}
          <line x1="0" y1="170" x2="600" y2="170" stroke="#475569" strokeWidth="3" />
          {/* Dash Road Divider */}
          <line x1="0" y1="140" x2="600" y2="140" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="1.5" strokeDasharray="12, 16" />

          {/* Milepost Flags & Grid Markers */}
          <g stroke="rgba(255,255,255,0.06)" strokeWidth="1">
            <line x1="100" y1="20" x2="100" y2="180" />
            <line x1="200" y1="20" x2="200" y2="180" />
            <line x1="300" y1="20" x2="300" y2="180" />
            <line x1="400" y1="20" x2="400" y2="180" />
            <line x1="500" y1="20" x2="500" y2="180" />
          </g>

          {/* Start Finish Flags */}
          {/* Start Line */}
          <line x1="60" y1="20" x2="60" y2="180" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="4,4" />
          
          {/* Finish Flag Icon at Max Range (Right side, scaled) */}
          <g transform="translate(530, 85)" fill="rgba(255, 255, 255, 0.25)">
            <path d="M 0,0 L 25,0 L 25,18 L 0,18 Z" stroke="#334155" strokeWidth="1.5" fill="none" />
            <path d="M 0,0 L 5,0 L 5,5 L 0,5 Z M 10,0 L 15,0 L 15,5 L 10,5 Z M 20,0 L 25,0 L 25,5 L 20,5 Z M 5,5 L 10,5 L 10,10 L 5,10 Z M 15,5 L 20,5 L 20,10 L 15,10 Z M 0,10 L 5,10 L 5,15 L 0,15 Z M 10,10 L 15,10 L 15,15 L 10,15 Z M 20,10 L 25,10 L 25,15 L 20,15 Z" fill="#475569" />
            <line x1="0" y1="0" x2="0" y2="35" stroke="#475569" strokeWidth="2" />
          </g>

          {/* Distances Labels at top and bottom */}
          <text x="60" y="18" fill="rgba(255,255,255,0.3)" fontSize="8.5" fontFamily="Outfit" textAnchor="middle">START</text>
          <text x="530" y="18" fill="rgba(255,255,255,0.4)" fontSize="8.5" fontFamily="Outfit" textAnchor="middle" fontWeight="bold">
            MAX ({maxRange.toFixed(0)} {unit})
          </text>
        </svg>

        {/* --- CAR 1: GAS CAR OVERLAY (Html absolute layer for smoother transitions) --- */}
        <div 
          className="absolute flex flex-col items-center transition-all duration-700 ease-out"
          style={{ 
            left: `${gasPercent}%`, 
            top: '32px',
            transform: 'translateX(-50%)',
            width: '76px'
          }}
        >
          {/* Label Card */}
          <div className="bg-slate-900/90 text-[10px] text-brand-amber font-bold border border-brand-amber/35 px-1.5 py-0.5 rounded shadow shadow-black mb-1.5 flex items-center gap-1 shrink-0 whitespace-nowrap">
            <Flame className="w-2.5 h-2.5 fill-brand-amber" />
            <span>{gasRange.toFixed(0)} {unit}</span>
          </div>

          {/* Gas Car SVG */}
          <svg viewBox="0 0 64 32" className="w-14 h-7 filter drop-shadow-[0_2px_4px_rgba(245,158,11,0.35)]" style={{ filter: 'drop-shadow(0 4px 8px rgba(245,158,11,0.25))' }}>
            <g fill="#f59e0b">
              {/* Car Body (Sedan shape) */}
              <path d="M 4,20 C 4,20 6,14 12,13 C 18,12 20,8 28,8 C 36,8 39,12 48,13 C 57,14 60,19 60,22 L 60,26 C 60,27.5 58.5,28 57,28 L 7,28 C 5,28 4,26.5 4,25 Z" />
              {/* Windows */}
              <path d="M 21,11 C 21,11 22.5,9.5 28,9.5 C 33.5,9.5 35.5,12 35.5,12 L 44,13 C 44,13 41.5,10 38,10 C 34.5,10 30,10.5 29,11 Z" fill="#0f172a" />
              <path d="M 19,13 L 26,13 L 26,11.5 Z" fill="#0f172a" />
              {/* Wheels */}
              <circle cx="16" cy="27" r="5" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />
              <circle cx="16" cy="27" r="2.5" fill="#64748b" />
              <circle cx="48" cy="27" r="5" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />
              <circle cx="48" cy="27" r="2.5" fill="#64748b" />
              {/* Exhaust Plume (Smoke lines) */}
              <path d="M 1,22 Q -3,20 -5,22 M 2,24 Q -2,25 -4,23" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.6" className="animate-pulse" />
            </g>
          </svg>
        </div>

        {/* --- CAR 2: EV CAR OVERLAY (Html absolute layer for smoother transitions) --- */}
        <div 
          className="absolute flex flex-col items-center transition-all duration-700 ease-out"
          style={{ 
            left: `${evPercent}%`, 
            top: '112px',
            transform: 'translateX(-50%)',
            width: '76px'
          }}
        >
          {/* Label Card */}
          <div className="bg-slate-900/90 text-[10px] text-brand-cyan font-bold border border-brand-cyan/35 px-1.5 py-0.5 rounded shadow shadow-black mb-1.5 flex items-center gap-1 shrink-0 whitespace-nowrap">
            <Zap className="w-2.5 h-2.5 fill-brand-cyan text-brand-cyan stroke-[2.5]" />
            <span>{evRange.toFixed(0)} {unit}</span>
          </div>

          {/* EV Car SVG */}
          <svg viewBox="0 0 64 32" className="w-14 h-7 filter drop-shadow-[0_2px_4px_rgba(6,182,212,0.35)]" style={{ filter: 'drop-shadow(0 4px 8px rgba(6,182,212,0.25))' }}>
            <g fill="#06b6d4">
              {/* Car Body (Futuristic aerocar) */}
              <path d="M 3,21 C 3,21 8,11 18,9 C 28,7 39,8 46,11 C 53,14 61,18 61,22 L 61,25 C 61,26.5 59.5,27.5 58,27.5 L 6,27.5 C 4,27.5 3,26.5 3,25 Z" />
              {/* Glass Canopy (Single dome glass) */}
              <path d="M 21,11 C 26,9 33,9 41,12 L 45,13.5 C 41,13.5 28,12 21,11.5 Z" fill="#0f172a" opacity="0.9" />
              {/* Wheels */}
              <circle cx="16" cy="26.5" r="5" fill="#1e293b" stroke="#06b6d4" strokeWidth="1.5" />
              <circle cx="16" cy="26.5" r="2.5" fill="#38bdf8" />
              <circle cx="47" cy="26.5" r="5" fill="#1e293b" stroke="#06b6d4" strokeWidth="1.5" />
              <circle cx="47" cy="26.5" r="2.5" fill="#38bdf8" />
              {/* Glow lightning tail trail */}
              <path d="M -1,22 L -4,20 L -3,23 L -6,22" stroke="#06b6d4" strokeWidth="1" strokeLinejoin="round" fill="none" opacity="0.75" />
            </g>
          </svg>
        </div>

      </div>

      {/* Numerical comparison summary below tracks */}
      <div className="grid grid-cols-2 gap-4 w-full text-xs pt-2">
        <div className="flex flex-col items-center bg-slate-950/40 p-3 rounded-xl border border-slate-850 text-center">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Gasoline Range</span>
          <span className="text-lg font-black text-brand-amber">{gasRange.toFixed(1)} {unit}</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Budget Exhausted</span>
        </div>

        <div className="flex flex-col items-center bg-slate-950/40 p-3 rounded-xl border border-slate-850 text-center">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Electric Range</span>
          <span className="text-lg font-black text-brand-cyan">{evRange.toFixed(1)} {unit}</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Budget Exhausted</span>
        </div>
      </div>
      
    </div>
  );
}
