import { useState, useMemo } from 'react';
import { Beaker, Sliders, Settings, Info, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import FlaskVisualizer from './ui/FlaskVisualizer';

// Conversion factors relative to milliliters (mL)
const UNIT_CONVERSIONS = {
  // Metric
  ml: { name: 'Milliliters (mL)', factor: 1, type: 'metric' },
  l: { name: 'Liters (L)', factor: 1000, type: 'metric' },
  // Imperial (US standard)
  floz: { name: 'Fluid Ounces (fl oz)', factor: 29.5735, type: 'imperial' },
  pt: { name: 'Pints (pt)', factor: 473.176, type: 'imperial' },
  qt: { name: 'Quarts (qt)', factor: 946.353, type: 'imperial' },
  gal: { name: 'Gallons (gal)', factor: 3785.41, type: 'imperial' }
};

export default function RatioCalculator() {
  // Calculator States
  const [calcMode, setCalcMode] = useState('by-diluent'); // by-diluent, by-chemical, by-total
  const [inputValue, setInputValue] = useState(1);
  const [inputUnit, setInputUnit] = useState('gal');
  const [outputUnit, setOutputUnit] = useState('floz');
  const [ratioPart, setRatioPart] = useState(10); // 1 part chemical to X parts water
  const [chemicalColor, setChemicalColor] = useState('emerald'); // emerald, cyan, purple, amber

  // Preset Ratio Buttons
  const ratioPresets = [
    { label: '1:1 (Heavy)', value: 1 },
    { label: '1:4 (Degrease)', value: 4 },
    { label: '1:10 (APC)', value: 10 },
    { label: '1:32 (Detail)', value: 32 },
    { label: '1:50 (2-Stroke)', value: 50 },
    { label: '1:64 (Cleaner)', value: 64 },
    { label: '1:128 (Shampoo)', value: 128 }
  ];

  // Colors mapping for styling selector UI
  const colorOptions = [
    { id: 'emerald', name: 'Emerald', bgClass: 'bg-emerald-500', borderClass: 'border-emerald-500/30' },
    { id: 'cyan', name: 'Cyan', bgClass: 'bg-cyan-500', borderClass: 'border-cyan-500/30' },
    { id: 'purple', name: 'Purple', bgClass: 'bg-purple-500', borderClass: 'border-purple-500/30' },
    { id: 'amber', name: 'Amber', bgClass: 'bg-amber-500', borderClass: 'border-amber-500/30' }
  ];

  // Core Math Calculation Logic
  const results = useMemo(() => {
    const parsedVal = parseFloat(inputValue);
    if (isNaN(parsedVal) || parsedVal <= 0 || ratioPart <= 0) {
      return {
        chemVol: 0,
        waterVol: 0,
        totalVol: 0,
        chemPercent: 0,
        formulaExplain: 'Please input a valid volume and ratio.'
      };
    }

    // 1. Convert input value to base unit (mL)
    const inputConversion = UNIT_CONVERSIONS[inputUnit];
    const inputInML = parsedVal * inputConversion.factor;

    let chemInML;
    let waterInML;
    let totalInML;
    let formulaExplain;

    // 2. Perform dilution math based on parts (1 : ratioPart)
    // Formula: Concentrate + Diluent = Total. (e.g. 1:10 means 1 part chem, 10 parts water, 11 parts total)
    if (calcMode === 'by-diluent') {
      // Diluent (water) is known
      waterInML = inputInML;
      chemInML = waterInML / ratioPart;
      totalInML = waterInML + chemInML;
      formulaExplain = `With 1 part concentrate to ${ratioPart} parts water, you need 1/${ratioPart}th of the water's volume in chemical concentrate.`;
    } else if (calcMode === 'by-chemical') {
      // Chemical concentrate is known
      chemInML = inputInML;
      waterInML = chemInML * ratioPart;
      totalInML = chemInML + waterInML;
      formulaExplain = `With 1 part concentrate to ${ratioPart} parts water, water volume is calculated as ${ratioPart} times the chemical volume.`;
    } else {
      // Total batch volume is known
      totalInML = inputInML;
      chemInML = totalInML / (ratioPart + 1);
      waterInML = totalInML - chemInML;
      formulaExplain = `With 1 part concentrate to ${ratioPart} parts water (total ${ratioPart + 1} parts), the chemical is 1/${ratioPart + 1}th of the total batch volume.`;
    }

    // 3. Convert results from base unit (mL) back to output unit
    const outputConversion = UNIT_CONVERSIONS[outputUnit];
    const chemVol = chemInML / outputConversion.factor;
    const waterVol = waterInML / outputConversion.factor;
    const totalVol = totalInML / outputConversion.factor;

    // Calculate percentage of chemical in total mixture
    const chemPercent = (chemInML / totalInML) * 100;

    // Alternative units conversions for helpful context panel
    // If output is metric, show alternative in imperial, and vice versa
    const isMetricOutput = outputConversion.type === 'metric';
    const altUnit = isMetricOutput ? 'floz' : 'ml';
    const altConversion = UNIT_CONVERSIONS[altUnit];
    const altChemVol = chemInML / altConversion.factor;
    const altWaterVol = waterInML / altConversion.factor;

    return {
      chemVol,
      waterVol,
      totalVol,
      chemPercent,
      formulaExplain,
      altChemVol,
      altWaterVol,
      altUnit: altConversion.name
    };
  }, [calcMode, inputValue, inputUnit, outputUnit, ratioPart]);

  // Adjust output unit automatically to match input unit on mode change (unless overridden)
  const handleInputUnitChange = (val) => {
    setInputUnit(val);
    // Suggest the same output unit by default to keep calculations intuitive
    setOutputUnit(val);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Beaker className="w-6 h-6 text-brand-cyan" />
            <span>Ratio Chemical Mixer</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Determine chemical concentrate and diluent (water) volumes for exact ratio dilution.
          </p>
        </div>

        {/* Chemical Liquid Color Preset Picker */}
        <div className="flex items-center gap-2.5 bg-slate-900/50 border border-slate-800/80 px-3.5 py-1.5 rounded-xl">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Liquid Type</span>
          <div className="flex gap-1.5">
            {colorOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setChemicalColor(opt.id)}
                className={`w-4 h-4 rounded-full ${opt.bgClass} border-2 transition-all ${
                  chemicalColor === opt.id 
                    ? 'border-white scale-125 ring-2 ring-brand-cyan/20' 
                    : 'border-transparent hover:scale-110'
                }`}
                title={opt.name}
                aria-label={`Select liquid color: ${opt.name}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input Forms */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card rounded-2xl p-5 md:p-6 border border-slate-800 space-y-6">
            
            {/* 1. Mode Selection Selector Segment */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-brand-cyan" />
                <span>1. Choose Mixing Mode</span>
              </label>
              <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800/80">
                <button
                  onClick={() => setCalcMode('by-diluent')}
                  className={`py-2 px-1 text-center rounded-lg text-xs font-semibold transition-all ${
                    calcMode === 'by-diluent' 
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700/50' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  By Water Vol
                </button>
                <button
                  onClick={() => setCalcMode('by-chemical')}
                  className={`py-2 px-1 text-center rounded-lg text-xs font-semibold transition-all ${
                    calcMode === 'by-chemical' 
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700/50' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  By Chem Vol
                </button>
                <button
                  onClick={() => setCalcMode('by-total')}
                  className={`py-2 px-1 text-center rounded-lg text-xs font-semibold transition-all ${
                    calcMode === 'by-total' 
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700/50' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  By Total Batch
                </button>
              </div>
            </div>

            {/* 2. Volume Inputs & Unit Selectors */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-brand-cyan" />
                <span>
                  {calcMode === 'by-diluent' && '2. Enter Diluent (Water) Volume'}
                  {calcMode === 'by-chemical' && '2. Enter Chemical (Concentrate) Volume'}
                  {calcMode === 'by-total' && '2. Enter Desired Total Batch Volume'}
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* Numeric Input */}
                <div className="sm:col-span-7 relative">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-4 pr-20 py-3 text-white font-bold focus:outline-none focus:border-brand-cyan/60 transition-colors shadow-inner"
                    placeholder="Enter quantity"
                  />
                  <div className="absolute right-3 top-3.5 text-xs text-slate-500 font-semibold pointer-events-none">
                    Amount
                  </div>
                </div>

                {/* Input Unit Selection */}
                <div className="sm:col-span-5">
                  <select
                    value={inputUnit}
                    onChange={(e) => handleInputUnitChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-3 text-slate-300 text-xs font-bold focus:outline-none focus:border-brand-cyan/60 transition-colors"
                  >
                    <optgroup label="Metric Units" className="bg-slate-950">
                      <option value="ml">Milliliters (mL)</option>
                      <option value="l">Liters (L)</option>
                    </optgroup>
                    <optgroup label="Imperial Units" className="bg-slate-950">
                      <option value="floz">Fluid Ounces (fl oz)</option>
                      <option value="pt">Pints (pt)</option>
                      <option value="qt">Quarts (qt)</option>
                      <option value="gal">Gallons (gal)</option>
                    </optgroup>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Dilution Ratio Input */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-brand-cyan" />
                  <span>3. Set Dilution Ratio</span>
                </label>
                <div className="text-xs font-bold text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20 px-2 py-0.5 rounded">
                  1 part chemical to {ratioPart} parts water
                </div>
              </div>

              {/* Presets Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ratioPresets.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setRatioPart(preset.value)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                      ratioPart === preset.value
                        ? 'bg-brand-cyan/25 text-white border-brand-cyan/60 shadow-md shadow-brand-cyan/5 font-semibold'
                        : 'bg-slate-950 text-slate-400 border-slate-850 hover:text-slate-200 hover:border-slate-800'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Slider & Custom Input */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-850">
                <div className="w-full sm:flex-1">
                  <input
                    type="range"
                    min="1"
                    max="150"
                    value={ratioPart}
                    onChange={(e) => setRatioPart(parseInt(e.target.value))}
                    className="w-full accent-brand-cyan cursor-pointer bg-slate-800 h-1 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold mt-1 px-1">
                    <span>1:1 (Strong)</span>
                    <span>1:150 (Mild)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                  <span className="text-xs text-slate-500 font-medium">Custom Part:</span>
                  <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 w-24">
                    <span className="text-xs text-slate-500 mr-1.5 font-bold">1 :</span>
                    <input
                      type="number"
                      min="1"
                      value={ratioPart}
                      onChange={(e) => setRatioPart(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-transparent text-white text-xs font-bold focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Output Unit Settings (Conversion Feature) */}
            <div className="space-y-2 border-t border-slate-800/80 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-brand-emerald" />
                  <span>4. Output Calculation Unit</span>
                </label>
                <span className="text-[10px] text-slate-500">Allows automatic unit conversions</span>
              </div>
              
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 p-1.5 bg-slate-950 rounded-xl border border-slate-850">
                {Object.keys(UNIT_CONVERSIONS).map((key) => (
                  <button
                    key={key}
                    onClick={() => setOutputUnit(key)}
                    className={`py-1.5 text-center text-[10px] rounded-lg font-bold uppercase transition-all ${
                      outputUnit === key
                        ? 'bg-brand-emerald/20 text-brand-emerald border border-brand-emerald/30 shadow-sm'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Mixing Guidelines Alert Card */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex gap-3 text-xs leading-relaxed text-slate-300">
            <AlertTriangle className="w-5 h-5 text-brand-amber shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="font-bold text-white flex items-center gap-1">
                <span>Chemical Safety Rules</span>
              </h5>
              <p>
                <strong>Order of Mixing:</strong> Always add the chemical concentrate to water, never water to chemical. Adding water to concentrated chemical can cause heat generation and dangerous splashing.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Beaker & Calculations Output */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Beaker Component */}
          <FlaskVisualizer
            chemVolume={results.chemVol}
            waterVolume={results.waterVol}
            totalVolume={results.totalVol}
            ratioText={`1:${ratioPart}`}
            chemicalColor={chemicalColor}
          />

          {/* Results Summary Box */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800/80 pb-2">
              <CheckCircle className="w-4 h-4 text-brand-emerald" />
              <span>Mixing Output Summary</span>
            </h4>

            {/* Calculations metrics */}
            <div className="space-y-3">
              {/* Concentrate Row */}
              <div className="flex items-center justify-between bg-slate-950/40 p-2.5 rounded-xl border border-slate-850">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Concentrate Required</div>
                  <div className="text-base font-black text-white mt-0.5">
                    {results.chemVol.toFixed(3)}{' '}
                    <span className="text-xs font-bold text-slate-400 uppercase">{outputUnit}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Percentage</div>
                  <div className="text-xs font-extrabold text-brand-cyan mt-0.5">
                    {results.chemPercent.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Diluent Row */}
              <div className="flex items-center justify-between bg-slate-950/40 p-2.5 rounded-xl border border-slate-850">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Water (Diluent) Required</div>
                  <div className="text-base font-black text-white mt-0.5">
                    {results.waterVol.toFixed(3)}{' '}
                    <span className="text-xs font-bold text-slate-400 uppercase">{outputUnit}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Water Parts</div>
                  <div className="text-xs font-extrabold text-slate-300 mt-0.5">
                    {ratioPart} Parts
                  </div>
                </div>
              </div>

              {/* Total Batch Row */}
              <div className="flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-950 p-2.5 rounded-xl border border-slate-800 shadow-inner">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Yield Volume</div>
                  <div className="text-base font-black text-white mt-0.5">
                    {results.totalVol.toFixed(3)}{' '}
                    <span className="text-xs font-bold text-slate-400 uppercase">{outputUnit}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Parts</div>
                  <div className="text-xs font-extrabold text-brand-emerald mt-0.5">
                    {ratioPart + 1} Parts
                  </div>
                </div>
              </div>
            </div>

            {/* Mathematical Formula Explanation */}
            <p className="text-[11px] text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-850 leading-relaxed">
              <strong>Calculation Method:</strong> {results.formulaExplain}
            </p>

            {/* Alternative Unit conversion footer info */}
            {results.chemVol > 0 && (
              <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-850 text-[10px] text-slate-500 font-semibold">
                <span>Equivalent in {results.altUnit}:</span>
                <span className="text-slate-300">
                  {results.altChemVol.toFixed(1)} Chem / {results.altWaterVol.toFixed(1)} Water
                </span>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
