import { useState, useMemo } from 'react';
import { Compass, Sparkles, Battery, RefreshCw, Zap, Lightbulb } from 'lucide-react';
import BatteryVisualizer from './ui/BatteryVisualizer';

// Presets for EV Models
const EV_PRESETS = [
  { name: 'Lucid Air (Efficiency King)', miKwh: 4.6, desc: 'Ultra-aerodynamic sedan' },
  { name: 'Tesla Model Y (Standard)', miKwh: 3.6, desc: 'Popular mid-size crossover' },
  { name: 'Audi Q8 e-tron (Premium)', miKwh: 2.6, desc: 'Heavy luxury SUV' },
  { name: 'Ford F-150 Lightning', miKwh: 2.0, desc: 'Full-size electric pickup' }
];

export default function EvUnitConverter() {
  // Input states as raw strings to allow seamless decimal typing
  const [miKwhInput, setMiKwhInput] = useState('3.6');
  const [kwhMiInput, setKwhMiInput] = useState((1 / 3.6).toFixed(3));
  const [kmKwhInput, setKmKwhInput] = useState((3.6 * 1.609344).toFixed(3));
  const [kwh100kmInput, setKwh100kmInput] = useState((62.137119 / 3.6).toFixed(3));

  // Battery capacity slider state
  const [batteryCapacity, setBatteryCapacity] = useState(75); // kWh

  // Track the active preset to highlight it if matching
  const activePresetIndex = useMemo(() => {
    const currentVal = parseFloat(miKwhInput);
    if (isNaN(currentVal)) return -1;
    return EV_PRESETS.findIndex(preset => Math.abs(preset.miKwh - currentVal) < 0.01);
  }, [miKwhInput]);

  // Clean values for visualizer integration
  const { currentMiKwh, currentKmKwh } = useMemo(() => {
    const miKwh = parseFloat(miKwhInput);
    const kmKwh = parseFloat(kmKwhInput);
    return {
      currentMiKwh: isNaN(miKwh) || miKwh <= 0 ? 3.6 : miKwh,
      currentKmKwh: isNaN(kmKwh) || kmKwh <= 0 ? 5.793 : kmKwh
    };
  }, [miKwhInput, kmKwhInput]);

  // Recalculations when typing in specific fields
  const handleMiKwhChange = (text) => {
    setMiKwhInput(text);
    const val = parseFloat(text);
    if (!isNaN(val) && val > 0) {
      setKwhMiInput((1 / val).toFixed(3));
      setKmKwhInput((val * 1.609344).toFixed(3));
      setKwh100kmInput((62.137119 / val).toFixed(3));
    } else {
      setKwhMiInput('');
      setKmKwhInput('');
      setKwh100kmInput('');
    }
  };

  const handleKwhMiChange = (text) => {
    setKwhMiInput(text);
    const val = parseFloat(text);
    if (!isNaN(val) && val > 0) {
      const miKwh = 1 / val;
      setMiKwhInput(miKwh.toFixed(3));
      setKmKwhInput((miKwh * 1.609344).toFixed(3));
      setKwh100kmInput((62.137119 * val).toFixed(3));
    } else {
      setMiKwhInput('');
      setKmKwhInput('');
      setKwh100kmInput('');
    }
  };

  const handleKmKwhChange = (text) => {
    setKmKwhInput(text);
    const val = parseFloat(text);
    if (!isNaN(val) && val > 0) {
      const miKwh = val / 1.609344;
      setMiKwhInput(miKwh.toFixed(3));
      setKwhMiInput((1.609344 / val).toFixed(3));
      setKwh100kmInput((100 / val).toFixed(3));
    } else {
      setMiKwhInput('');
      setKwhMiInput('');
      setKwh100kmInput('');
    }
  };

  const handleKwh100kmChange = (text) => {
    setKwh100kmInput(text);
    const val = parseFloat(text);
    if (!isNaN(val) && val > 0) {
      const kmKwh = 100 / val;
      const miKwh = 62.137119 / val;
      setMiKwhInput(miKwh.toFixed(3));
      setKwhMiInput((val / 62.137119).toFixed(3));
      setKmKwhInput(kmKwh.toFixed(3));
    } else {
      setMiKwhInput('');
      setKwhMiInput('');
      setKmKwhInput('');
    }
  };

  // Reset helper
  const handleReset = () => {
    setMiKwhInput('3.6');
    setKwhMiInput((1 / 3.6).toFixed(3));
    setKmKwhInput((3.6 * 1.609344).toFixed(3));
    setKwh100kmInput((62.137119 / 3.6).toFixed(3));
    setBatteryCapacity(75);
  };

  // Load a preset
  const loadPreset = (preset) => {
    const miKwh = preset.miKwh;
    setMiKwhInput(miKwh.toString());
    setKwhMiInput((1 / miKwh).toFixed(3));
    setKmKwhInput((miKwh * 1.609344).toFixed(3));
    setKwh100kmInput((62.137119 / miKwh).toFixed(3));
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Compass className="w-6 h-6 text-brand-cyan" />
            <span>EV Efficiency Converter</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Convert bidirectionally between energy efficacy (distance per kWh) and consumption (kWh per distance) metrics.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors shadow-inner"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Calculator</span>
        </button>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form and Inputs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card rounded-2xl p-5 md:p-6 border border-slate-800 space-y-6">
            
            {/* Presets Grid */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
                <span>Select EV Preset Template</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {EV_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => loadPreset(preset)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-medium border text-center transition-all ${
                      activePresetIndex === idx
                        ? 'bg-brand-cyan/20 text-white border-brand-cyan/50 shadow-md shadow-brand-cyan/5 font-semibold'
                        : 'bg-slate-950 text-slate-400 border-slate-850 hover:text-slate-200 hover:border-slate-800'
                    }`}
                  >
                    <div className="truncate font-semibold">{preset.name.split(' ')[0]}</div>
                    <div className="text-[10px] opacity-60 mt-0.5">{preset.miKwh} mi/kWh</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Bidirectional Grid of Inputs */}
            <div className="space-y-4 pt-4 border-t border-slate-850">
              <h3 className="text-xs font-bold text-brand-cyan uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Zap className="w-4 h-4" />
                <span>Bidirectional Efficiency Inputs</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Miles per kWh */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400">Miles per kWh (Efficacy)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0.1"
                      step="any"
                      value={miKwhInput}
                      onChange={(e) => handleMiKwhChange(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-4 pr-20 py-3 text-white font-bold focus:outline-none focus:border-brand-cyan/60 transition-colors shadow-inner"
                      placeholder="3.6"
                    />
                    <div className="absolute right-3 top-3.5 text-xs text-slate-500 font-semibold pointer-events-none">
                      mi/kWh
                    </div>
                  </div>
                </div>

                {/* kWh per Mile */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400">kWh per Mile (Consumption)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      value={kwhMiInput}
                      onChange={(e) => handleKwhMiChange(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-4 pr-20 py-3 text-white font-bold focus:outline-none focus:border-brand-cyan/60 transition-colors shadow-inner"
                      placeholder="0.278"
                    />
                    <div className="absolute right-3 top-3.5 text-xs text-slate-500 font-semibold pointer-events-none">
                      kWh/mi
                    </div>
                  </div>
                </div>

                {/* Kilometers per kWh */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400">Kilometers per kWh (Efficacy)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0.1"
                      step="any"
                      value={kmKwhInput}
                      onChange={(e) => handleKmKwhChange(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-4 pr-20 py-3 text-white font-bold focus:outline-none focus:border-brand-cyan/60 transition-colors shadow-inner"
                      placeholder="5.793"
                    />
                    <div className="absolute right-3 top-3.5 text-xs text-slate-500 font-semibold pointer-events-none">
                      km/kWh
                    </div>
                  </div>
                </div>

                {/* kWh per 100 km */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400">kWh per 100 km (Consumption)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1.0"
                      step="any"
                      value={kwh100kmInput}
                      onChange={(e) => handleKwh100kmChange(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-4 pr-20 py-3 text-white font-bold focus:outline-none focus:border-brand-cyan/60 transition-colors shadow-inner"
                      placeholder="17.260"
                    />
                    <div className="absolute right-3 top-3.5 text-xs text-slate-500 font-semibold pointer-events-none">
                      kWh/100km
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Battery Capacity Slider */}
            <div className="space-y-4 pt-5 border-t border-slate-850">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Battery className="w-4 h-4 text-brand-emerald" />
                  <span>Interactive Battery Capacity</span>
                </h3>
                <span className="text-sm font-extrabold text-brand-emerald bg-brand-emerald/10 px-2 py-0.5 rounded border border-brand-emerald/15">
                  {batteryCapacity} kWh
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Adjust the battery capacity slider to compute the estimated range for this vehicle profile.
              </p>
              <input
                type="range"
                min="10"
                max="150"
                step="5"
                value={batteryCapacity}
                onChange={(e) => setBatteryCapacity(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-brand-emerald border border-slate-850"
              />
              <div className="flex justify-between text-[10px] text-slate-600 font-medium">
                <span>10 kWh (Tiny Hybrid)</span>
                <span>80 kWh (Standard Long Range)</span>
                <span>150 kWh (Hummer/Max Pack)</span>
              </div>
            </div>

          </div>

          {/* Educational Info Card */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800/80 bg-slate-900/10 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-brand-amber" />
              <span>Efficacy vs. Consumption Metrics</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Efficiency is measured in two ways:
            </p>
            <ul className="text-xs text-slate-400 list-disc pl-5 space-y-1.5 leading-relaxed">
              <li>
                <strong className="text-brand-cyan">Distance per Unit of Energy (mi/kWh, km/kWh):</strong> Larger numbers mean <strong className="text-white">better</strong> efficiency. Similar to Miles per Gallon (MPG).
              </li>
              <li>
                <strong className="text-brand-emerald">Energy consumed per distance (kWh/mi, kWh/100km):</strong> Smaller numbers mean <strong className="text-white">better</strong> efficiency. Shows how heavy the energy draw is (like Liters/100km).
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Battery Visualizer */}
        <div className="lg:col-span-5 flex items-start justify-center">
          <BatteryVisualizer
            capacity={batteryCapacity}
            efficiency={currentMiKwh}
            kmEfficiency={currentKmKwh}
          />
        </div>

      </div>

    </div>
  );
}
