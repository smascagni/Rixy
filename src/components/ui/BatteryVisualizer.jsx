import { useMemo } from 'react';
import { Zap, Compass } from 'lucide-react';

export default function BatteryVisualizer({ 
  capacity = 75, // kWh
  efficiency = 3.5, // mi/kWh
  kmEfficiency = 5.6 // km/kWh
}) {
  const { rangeMi, rangeKm, filledSegments } = useMemo(() => {
    const mi = capacity * efficiency;
    const km = capacity * kmEfficiency;
    // Map capacity (10 to 150 kWh) to 10 visual segments (1 to 10)
    const segments = Math.max(1, Math.min(10, Math.round((capacity / 150) * 10)));
    return {
      rangeMi: mi.toFixed(1),
      rangeKm: km.toFixed(1),
      filledSegments: segments
    };
  }, [capacity, efficiency, kmEfficiency]);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900/40 rounded-2xl border border-slate-800/80 shadow-inner w-full max-w-sm mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="w-4 h-4 text-brand-amber animate-pulse" />
        <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Battery Pack Range Simulator</span>
      </div>

      {/* SVG Battery Visualization */}
      <div className="relative w-44 h-64 flex items-center justify-center mb-6">
        <svg 
          viewBox="0 0 160 240" 
          className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
        >
          <defs>
            {/* Core battery fill gradient */}
            <linearGradient id="battery-grad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="60%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
            
            {/* Glow filter for segments */}
            <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Battery Cap/Positive Terminal */}
          <path 
            d="M 65,15 L 95,15 A 3,3 0 0 1 98,18 L 98,24 L 62,24 L 62,18 A 3,3 0 0 1 65,15 Z" 
            fill="#1e293b" 
            stroke="#475569" 
            strokeWidth="1.5"
          />

          {/* Battery Glass Body */}
          <rect 
            x="20" 
            y="24" 
            width="120" 
            height="200" 
            rx="12" 
            fill="rgba(15, 23, 42, 0.6)" 
            stroke="#334155" 
            strokeWidth="2" 
          />

          {/* Glass glare effect */}
          <path 
            d="M 23,36 L 23,212 C 23,218 26,220 28,212 L 34,44 C 34,36 30,30 23,36 Z" 
            fill="rgba(255, 255, 255, 0.08)" 
          />

          {/* Battery Segments */}
          {Array.from({ length: 10 }).map((_, idx) => {
            // Visual indices are bottom-up
            const isFilled = idx < filledSegments;
            const segmentY = 202 - (idx * 17); // spacing
            
            return (
              <rect
                key={idx}
                x="30"
                y={segmentY}
                width="100"
                height="12"
                rx="3"
                fill={isFilled ? 'url(#battery-grad)' : '#0f172a'}
                stroke={isFilled ? 'none' : '#1e293b'}
                strokeWidth={isFilled ? 0 : 1}
                className="transition-all duration-500"
                style={{
                  filter: isFilled ? 'url(#neon-glow)' : 'none',
                  opacity: isFilled ? 0.9 : 0.4
                }}
              />
            );
          })}

          {/* Lightning bolt indicator in center */}
          <path
            d="M 85,95 L 68,125 L 81,125 L 75,150 L 92,120 L 79,120 Z"
            fill="rgba(255, 255, 255, 0.15)"
            stroke="rgba(255, 255, 255, 0.25)"
            strokeWidth="1"
          />
        </svg>

        {/* Center overlay showing active capacity */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mt-2">
          <div className="text-2xl font-extrabold text-white tracking-tight">{capacity}</div>
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">kWh</div>
        </div>
      </div>

      {/* Range Statistics Panel */}
      <div className="w-full space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Est. Range (Imperial)</span>
          </span>
          <span className="text-white font-bold text-sm tracking-wide">
            {rangeMi} <span className="text-[10px] text-brand-cyan font-semibold">mi</span>
          </span>
        </div>
        <div className="w-full h-[1px] bg-slate-800/50"></div>
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-brand-emerald" />
            <span>Est. Range (Metric)</span>
          </span>
          <span className="text-white font-bold text-sm tracking-wide">
            {rangeKm} <span className="text-[10px] text-brand-emerald font-semibold">km</span>
          </span>
        </div>
      </div>
    </div>
  );
}
