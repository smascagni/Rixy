import { Beaker, ShieldAlert, Sparkles, ArrowRight, Compass, Flame, Info, Layers, Zap } from 'lucide-react';

export default function Dashboard({ setActiveTab }) {
  const calculators = [
    {
      id: 'chemical-mixing',
      title: 'Chemical Mixing Ratio Calculator',
      description: 'Calculate dilute chemical mixtures for cleaning, sanitizing, gardening, and detailing. Support for metric and imperial systems.',
      icon: Beaker,
      badge: 'Active',
      color: 'from-brand-cyan to-brand-emerald',
      bgColor: 'bg-brand-cyan/5',
      borderColor: 'group-hover:border-brand-cyan/50',
    },
    {
      id: 'ev-vs-gas',
      title: 'EV vs Gas Range Comparison',
      description: 'Compare how far you can drive a gasoline-powered vehicle vs. an electric vehicle on the exact same budget.',
      icon: Zap,
      badge: 'Active',
      color: 'from-brand-amber to-brand-cyan',
      bgColor: 'bg-brand-cyan/5',
      borderColor: 'group-hover:border-brand-cyan/50',
    },
    {
      id: 'unit-converter',
      title: 'Advanced Dilution Converter',
      description: 'Convert between dilution ratios, percentages, parts per million (PPM), and standard fluid units in real-time.',
      icon: Compass,
      badge: 'Coming Soon',
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'bg-indigo-500/5',
      borderColor: 'border-transparent opacity-60',
      disabled: true
    }
  ];

  const quickRatios = [
    { ratio: '1:1', pct: '50.0%', ozGal: '128 fl oz', use: 'Heavy stripping, industrial glue removal' },
    { ratio: '1:4', pct: '20.0%', ozGal: '32 fl oz', use: 'Heavy duty degreasing, deep carpet cleaning' },
    { ratio: '1:10', pct: '9.09%', ozGal: '11.6 fl oz', use: 'General disinfection, wheel cleaning, APC' },
    { ratio: '1:32', pct: '3.03%', ozGal: '4.0 fl oz', use: 'Glass cleaning, spray-and-wipe, light soils' },
    { ratio: '1:50', pct: '1.96%', ozGal: '2.5 fl oz', use: '2-Stroke gas engines (50:1 oil-gas mix)' },
    { ratio: '1:128', pct: '0.78%', ozGal: '1.0 fl oz', use: 'Car wash shampoo, window cleaning, rinse aid' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-2">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl p-6 md:p-10 overflow-hidden border border-slate-800 bg-gradient-to-br from-slate-900 to-brand-bg shadow-xl">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-brand-cyan/5 blur-[80px] pointer-events-none"></div>
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome to Rixy Ratios</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Simplify complex chemical <span className="gradient-text-cyan-emerald">dilution ratios</span>.
          </h2>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Eliminate mixing guesswork. Rixy provides precise, error-free ratio calculations across imperial and metric units, paired with real-time chemical volume visualizations.
          </p>
        </div>
      </div>

      {/* Grid of Calculators */}
      <div>
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Layers className="w-5 h-5 text-brand-cyan" />
          <span>Available Calculators</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {calculators.map((calc) => {
            const Icon = calc.icon;
            return (
              <div
                key={calc.id}
                onClick={() => !calc.disabled && setActiveTab(calc.id)}
                className={`group glass-card glass-card-hover rounded-2xl p-6 border flex flex-col justify-between ${
                  calc.disabled ? 'cursor-not-allowed border-slate-800' : 'cursor-pointer'
                } ${calc.borderColor}`}
              >
                <div>
                  {/* Icon Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className={`p-3 rounded-xl bg-gradient-to-tr ${calc.color} shadow-lg shadow-black/20`}>
                      <Icon className="w-6 h-6 text-brand-bg stroke-[2]" />
                    </div>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                      calc.badge === 'Active' 
                        ? 'bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/25' 
                        : 'bg-slate-800 text-slate-500 border border-slate-700/50'
                    }`}>
                      {calc.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h4 className="text-lg font-bold text-white mb-2 group-hover:text-brand-cyan transition-colors">
                    {calc.title}
                  </h4>
                  <p className="text-slate-400 text-xs leading-relaxed mb-6">
                    {calc.description}
                  </p>
                </div>

                {/* Footer Link */}
                <div className="flex items-center text-xs font-semibold text-brand-cyan gap-1.5 mt-auto pt-2">
                  {!calc.disabled ? (
                    <>
                      <span>Open Calculator</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  ) : (
                    <span className="text-slate-500">Feature Lock</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Ratio Chart (Cheat Sheet) */}
      <div className="glass-card rounded-2xl p-6 md:p-8 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Info className="w-5 h-5 text-brand-emerald" />
              <span>Common Dilution Cheat Sheet</span>
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              Standard references for chemical mixing ratios based on 1 Gallon (128 fl oz) of water.
            </p>
          </div>
          <div className="text-slate-500 text-xs flex items-center gap-1.5 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800/80">
            <ShieldAlert className="w-3.5 h-3.5 text-brand-amber" />
            <span>Always consult product instructions.</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Ratio (Chem:Water)</th>
                <th className="py-3 px-4">Percentage</th>
                <th className="py-3 px-4">Concentrate per Gallon</th>
                <th className="py-3 px-4">Primary Application</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {quickRatios.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-brand-cyan">{item.ratio}</td>
                  <td className="py-3.5 px-4 text-slate-300">{item.pct}</td>
                  <td className="py-3.5 px-4 text-brand-emerald font-medium">{item.ozGal}</td>
                  <td className="py-3.5 px-4 text-slate-400">{item.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
