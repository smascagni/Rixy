import React, { useState, useMemo, useEffect } from 'react';
import { Zap, Flame, DollarSign, Gauge, ShieldAlert, Sparkles, Navigation, Globe, ArrowRight, TrendingUp } from 'lucide-react';
import RangeRoadVisualizer from './ui/RangeRoadVisualizer';

// Preset configurations for different vehicle classes
const VEHICLE_PRESETS = {
  imperial: [
    {
      name: "Standard Sedan",
      gasName: "Gas Sedan (28 MPG)",
      gasEff: 28,
      gasPrice: 3.50,
      evName: "Tesla Model 3 (3.8 mi/kWh)",
      evEff: 3.8,
      evPrice: 0.16,
    },
    {
      name: "Utility SUV",
      gasName: "Gas SUV (22 MPG)",
      gasEff: 22,
      gasPrice: 3.50,
      evName: "Electric SUV (3.0 mi/kWh)",
      evEff: 3.0,
      evPrice: 0.16,
    },
    {
      name: "Pickup Truck",
      gasName: "Gas Truck (17 MPG)",
      gasEff: 17,
      gasPrice: 3.80,
      evName: "F-150 Lightning (2.0 mi/kWh)",
      evEff: 2.0,
      evPrice: 0.16,
    },
    {
      name: "Commuter Hatch",
      gasName: "Prius Hybrid (52 MPG)",
      gasEff: 52,
      gasPrice: 3.50,
      evName: "Chevy Bolt EV (3.9 mi/kWh)",
      evEff: 3.9,
      evPrice: 0.16,
    }
  ],
  metric: [
    {
      name: "Standard Sedan",
      gasName: "Gas Sedan (8.4 L/100km)",
      gasEff: 8.4,
      gasPrice: 1.50,
      evName: "Tesla Model 3 (16.4 kWh/100km)",
      evEff: 16.4,
      evPrice: 0.22,
    },
    {
      name: "Utility SUV",
      gasName: "Gas SUV (10.7 L/100km)",
      gasEff: 10.7,
      gasPrice: 1.50,
      evName: "Electric SUV (20.7 kWh/100km)",
      evEff: 20.7,
      evPrice: 0.22,
    },
    {
      name: "Pickup Truck",
      gasName: "Gas Truck (13.8 L/100km)",
      gasEff: 13.8,
      gasPrice: 1.65,
      evName: "F-150 Lightning (31.1 kWh/100km)",
      evEff: 31.1,
      evPrice: 0.22,
    },
    {
      name: "Commuter Hatch",
      gasName: "Prius Hybrid (4.5 L/100km)",
      gasEff: 4.5,
      gasPrice: 1.50,
      evName: "Chevy Bolt EV (15.9 kWh/100km)",
      evEff: 15.9,
      evPrice: 0.22,
    }
  ]
};

export default function EvVsGasCalculator() {
  const [unitSystem, setUnitSystem] = useState('imperial'); // 'imperial' or 'metric'
  
  // State for numerical inputs
  const [budget, setBudget] = useState(50);
  const [gasPrice, setGasPrice] = useState(3.50);
  const [gasEfficiency, setGasEfficiency] = useState(28);
  const [elecPrice, setElecPrice] = useState(0.16);
  const [elecEfficiency, setElecEfficiency] = useState(3.5);
  const [annualMileage, setAnnualMileage] = useState(12000);

  // Keep track of preset selection (for highlighting active preset if matching)
  const [activePresetIndex, setActivePresetIndex] = useState(0);

  // Conversion functions when unit system toggles
  const handleUnitSystemChange = (newSystem) => {
    if (newSystem === unitSystem) return;

    if (newSystem === 'metric') {
      // Imperial -> Metric
      setGasPrice(prev => parseFloat((prev / 3.78541).toFixed(2)));
      setGasEfficiency(prev => {
        const converted = 235.215 / prev;
        return isFinite(converted) && converted > 0 ? parseFloat(converted.toFixed(1)) : 8.4;
      });
      setElecEfficiency(prev => {
        const converted = 62.1371 / prev;
        return isFinite(converted) && converted > 0 ? parseFloat(converted.toFixed(1)) : 17.7;
      });
      setAnnualMileage(prev => Math.round(prev * 1.60934));
    } else {
      // Metric -> Imperial
      setGasPrice(prev => parseFloat((prev * 3.78541).toFixed(2)));
      setGasEfficiency(prev => {
        const converted = 235.215 / prev;
        return isFinite(converted) && converted > 0 ? parseFloat(converted.toFixed(1)) : 28;
      });
      setElecEfficiency(prev => {
        const converted = 62.1371 / prev;
        return isFinite(converted) && converted > 0 ? parseFloat(converted.toFixed(1)) : 3.5;
      });
      setAnnualMileage(prev => Math.round(prev / 1.60934));
    }
    setUnitSystem(newSystem);
    setActivePresetIndex(-1); // Custom after conversion
  };

  // Load a preset
  const loadPreset = (preset, idx) => {
    setGasPrice(preset.gasPrice);
    setGasEfficiency(preset.gasEff);
    setElecPrice(preset.evPrice);
    setElecEfficiency(preset.evEff);
    setActivePresetIndex(idx);
  };

  // Perform Calculations
  const results = useMemo(() => {
    const budgetVal = parseFloat(budget) || 0;
    const gasPriceVal = parseFloat(gasPrice) || 0;
    const gasEffVal = parseFloat(gasEfficiency) || 0;
    const elecPriceVal = parseFloat(elecPrice) || 0;
    const elecEffVal = parseFloat(elecEfficiency) || 0;
    const mileageVal = parseFloat(annualMileage) || 0;

    let gasRange = 0;
    let evRange = 0;
    let gasCostPerUnitDistance = 0;
    let evCostPerUnitDistance = 0;
    let annualGasCost = 0;
    let annualEvCost = 0;
    let annualGasCO2 = 0;
    let annualEvCO2 = 0;

    if (unitSystem === 'imperial') {
      // Gas Range: (Budget / Price per Gal) * MPG
      if (gasPriceVal > 0 && gasEffVal > 0) {
        gasRange = (budgetVal / gasPriceVal) * gasEffVal;
        gasCostPerUnitDistance = gasPriceVal / gasEffVal;
        annualGasCost = mileageVal * gasCostPerUnitDistance;
        // 8.887 kg CO2 per gallon of gasoline
        annualGasCO2 = (mileageVal / gasEffVal) * 8.887;
      }
      
      // EV Range: (Budget / Price per kWh) * mi/kWh
      if (elecPriceVal > 0 && elecEffVal > 0) {
        evRange = (budgetVal / elecPriceVal) * elecEffVal;
        evCostPerUnitDistance = elecPriceVal / elecEffVal;
        annualEvCost = mileageVal * evCostPerUnitDistance;
        // 0.38 kg CO2 per kWh of grid electricity
        annualEvCO2 = (mileageVal / elecEffVal) * 0.38;
      }
    } else {
      // Metric Range: (Budget / Price per L) / (L/100km / 100) = Budget / Price * 100 / L/100km
      if (gasPriceVal > 0 && gasEffVal > 0) {
        gasRange = (budgetVal / gasPriceVal) / (gasEffVal / 100);
        gasCostPerUnitDistance = gasPriceVal * (gasEffVal / 100);
        annualGasCost = mileageVal * (gasPriceVal * (gasEffVal / 100));
        // 2.35 kg CO2 per liter of gasoline
        const annualLiters = mileageVal * (gasEffVal / 100);
        annualGasCO2 = annualLiters * 2.35;
      }

      if (elecPriceVal > 0 && elecEffVal > 0) {
        // EV Range: (Budget / Price per kWh) / (kWh/100km / 100)
        evRange = (budgetVal / elecPriceVal) / (elecEffVal / 100);
        evCostPerUnitDistance = elecPriceVal * (elecEffVal / 100);
        annualEvCost = mileageVal * (elecPriceVal * (elecEffVal / 100));
        // 0.38 kg CO2 per kWh of grid electricity
        const annualKwh = mileageVal * (elecEffVal / 100);
        annualEvCO2 = annualKwh * 0.38;
      }
    }

    const efficiencyMultiplier = gasCostPerUnitDistance > 0 ? (evCostPerUnitDistance > 0 ? (gasCostPerUnitDistance / evCostPerUnitDistance) : 0) : 0;
    const annualSavings = annualGasCost - annualEvCost;
    const annualCO2Savings = annualGasCO2 - annualEvCO2;

    return {
      gasRange,
      evRange,
      gasCostPerUnitDistance,
      evCostPerUnitDistance,
      efficiencyMultiplier,
      annualGasCost,
      annualEvCost,
      annualSavings,
      annualGasCO2,
      annualEvCO2,
      annualCO2Savings,
      unitLabel: unitSystem === 'imperial' ? 'mi' : 'km',
      efficiencyUnit: unitSystem === 'imperial' ? 'MPG' : 'L/100km',
      evEfficiencyUnit: unitSystem === 'imperial' ? 'mi/kWh' : 'kWh/100km',
      volumeUnit: unitSystem === 'imperial' ? 'gallon' : 'liter',
      volumeUnitShort: unitSystem === 'imperial' ? 'gal' : 'L'
    };
  }, [unitSystem, budget, gasPrice, gasEfficiency, elecPrice, elecEfficiency, annualMileage]);

  // Load standard default preset on mount or unit toggle reset
  useEffect(() => {
    const presets = VEHICLE_PRESETS[unitSystem];
    if (presets && presets[0]) {
      loadPreset(presets[0], 0);
    }
  }, [unitSystem]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Title Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-brand-cyan fill-brand-cyan/20" />
            <span>EV vs Gas Range Comparison</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Compare driving ranges, fuel efficiency costs, and annual carbon outputs on equivalent budgets.
          </p>
        </div>

        {/* Unit Toggle Switch */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => handleUnitSystemChange('imperial')}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
              unitSystem === 'imperial'
                ? 'bg-slate-850 text-white border border-slate-700/50 shadow-sm'
                : 'text-slate-500 hover:text-slate-350'
            }`}
          >
            Imperial (US)
          </button>
          <button
            onClick={() => handleUnitSystemChange('metric')}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
              unitSystem === 'metric'
                ? 'bg-slate-850 text-white border border-slate-700/50 shadow-sm'
                : 'text-slate-500 hover:text-slate-350'
            }`}
          >
            Metric (EU)
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Preset and Inputs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
            
            {/* Presets Grid */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
                <span>Select Vehicle Preset Template</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {VEHICLE_PRESETS[unitSystem]?.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => loadPreset(preset, idx)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-medium border text-center transition-all ${
                      activePresetIndex === idx
                        ? 'bg-brand-cyan/20 text-white border-brand-cyan/50 shadow-md shadow-brand-cyan/5 font-semibold'
                        : 'bg-slate-950 text-slate-400 border-slate-850 hover:text-slate-200 hover:border-slate-800'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget Input & Core Calculations */}
            <div className="space-y-4 pt-4 border-t border-slate-850">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                
                {/* Budget input */}
                <div className="w-full sm:w-1/2 space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-brand-emerald" />
                    <span>Travel Budget</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-xs text-slate-500 font-extrabold">$</span>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={budget}
                      onChange={(e) => {
                        setBudget(e.target.value);
                        setActivePresetIndex(-1);
                      }}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-8 pr-20 py-3 text-white font-bold focus:outline-none focus:border-brand-cyan/60 transition-colors shadow-inner"
                      placeholder="50"
                    />
                    <div className="absolute right-3 top-3.5 text-xs text-slate-500 font-semibold pointer-events-none">
                      Amount
                    </div>
                  </div>
                </div>

                {/* Annual Mileage */}
                <div className="w-full sm:w-1/2 space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-brand-cyan" />
                    <span>Annual Mileage ({results.unitLabel})</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      step="100"
                      value={annualMileage}
                      onChange={(e) => setAnnualMileage(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-4 pr-20 py-3 text-white font-bold focus:outline-none focus:border-brand-cyan/60 transition-colors shadow-inner"
                      placeholder="12000"
                    />
                    <div className="absolute right-3 top-3.5 text-xs text-slate-500 font-semibold pointer-events-none">
                      {results.unitLabel}/yr
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Gasoline Vehicle settings */}
            <div className="space-y-4 pt-4 border-t border-slate-850">
              <h3 className="text-xs font-bold text-brand-amber uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 fill-brand-amber/10" />
                <span>Gasoline Car Configuration</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Fuel Price */}
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase">
                    Fuel Cost per {results.volumeUnit}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-xs text-slate-500 font-extrabold">$</span>
                    <input
                      type="number"
                      min="0.1"
                      step="0.01"
                      value={gasPrice}
                      onChange={(e) => {
                        setGasPrice(e.target.value);
                        setActivePresetIndex(-1);
                      }}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-8 pr-20 py-3 text-white font-bold focus:outline-none focus:border-brand-amber/60 transition-colors shadow-inner"
                      placeholder="3.50"
                    />
                    <div className="absolute right-3 top-3.5 text-xs text-slate-500 font-semibold pointer-events-none">
                      per {results.volumeUnitShort}
                    </div>
                  </div>
                </div>

                {/* Efficiency */}
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase">
                    Fuel Consumption Rate
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      step="0.1"
                      value={gasEfficiency}
                      onChange={(e) => {
                        setGasEfficiency(e.target.value);
                        setActivePresetIndex(-1);
                      }}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-4 pr-20 py-3 text-white font-bold focus:outline-none focus:border-brand-amber/60 transition-colors shadow-inner"
                      placeholder="28"
                    />
                    <div className="absolute right-3 top-3.5 text-xs text-slate-500 font-semibold pointer-events-none">
                      {results.efficiencyUnit}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Electric Vehicle settings */}
            <div className="space-y-4 pt-4 border-t border-slate-850">
              <h3 className="text-xs font-bold text-brand-cyan uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 fill-brand-cyan/10" />
                <span>Electric Vehicle Configuration</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Electricity Price */}
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase">
                    Electricity Cost per kWh
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-xs text-slate-500 font-extrabold">$</span>
                    <input
                      type="number"
                      min="0.01"
                      step="0.005"
                      value={elecPrice}
                      onChange={(e) => {
                        setElecPrice(e.target.value);
                        setActivePresetIndex(-1);
                      }}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-8 pr-20 py-3 text-white font-bold focus:outline-none focus:border-brand-cyan/60 transition-colors shadow-inner"
                      placeholder="0.16"
                    />
                    <div className="absolute right-3 top-3.5 text-xs text-slate-500 font-semibold pointer-events-none">
                      per kWh
                    </div>
                  </div>
                </div>

                {/* Electric Efficiency */}
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase">
                    Electricity Consumption Rate
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={elecEfficiency}
                      onChange={(e) => {
                        setElecEfficiency(e.target.value);
                        setActivePresetIndex(-1);
                      }}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-4 pr-20 py-3 text-white font-bold focus:outline-none focus:border-brand-cyan/60 transition-colors shadow-inner"
                      placeholder="3.5"
                    />
                    <div className="absolute right-3 top-3.5 text-xs text-slate-500 font-semibold pointer-events-none">
                      {results.evEfficiencyUnit}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Quick Informational Notice */}
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 flex gap-3 text-xs leading-relaxed text-slate-400">
            <Globe className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="font-bold text-slate-350 flex items-center gap-1">
                <span>Grid Generation & CO2 Context</span>
              </h5>
              <p>
                Calculations are based on average carbon output metrics (US average power grid emissions of 0.38 kg/kWh and standard gasoline combustion coefficients). EV emissions vary depending on how clean your local utility grid is.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Comparison, Metrics & Annual Savings */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Visual Track Roadmap Component */}
          <RangeRoadVisualizer 
            gasRange={results.gasRange} 
            evRange={results.evRange} 
            unit={results.unitLabel}
          />

          {/* Comparison breakdown box */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800/80 pb-2">
              <TrendingUp className="w-4 h-4 text-brand-emerald" />
              <span>Comparative Cost Analysis</span>
            </h4>

            <div className="space-y-3">
              {/* Cost per unit of distance row */}
              <div className="flex items-center justify-between bg-slate-950/30 p-3 rounded-xl border border-slate-850">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Gasoline Mileage Cost</span>
                  <span className="text-sm font-extrabold text-brand-amber mt-0.5">
                    ${results.gasCostPerUnitDistance.toFixed(3)} <span className="text-[10px] text-slate-400 uppercase">/ {results.unitLabel}</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Electric Mileage Cost</span>
                  <span className="text-sm font-extrabold text-brand-cyan mt-0.5">
                    ${results.evCostPerUnitDistance.toFixed(3)} <span className="text-[10px] text-slate-400 uppercase">/ {results.unitLabel}</span>
                  </span>
                </div>
              </div>

              {/* Annual cost comparison */}
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-850/80 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Annual Fuel Cost (Gas):</span>
                  <span className="font-bold text-slate-200">${Math.round(results.annualGasCost).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Annual Charging Cost (EV):</span>
                  <span className="font-bold text-slate-200">${Math.round(results.annualEvCost).toLocaleString()}</span>
                </div>
                
                <div className="border-t border-slate-800/80 pt-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Annual Net Savings:</span>
                  </div>
                  <span className={`text-base font-black ${results.annualSavings >= 0 ? 'text-brand-emerald' : 'text-brand-rose'}`}>
                    {results.annualSavings >= 0 ? '+' : ''}${Math.round(results.annualSavings).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* CO2 Emissions comparison */}
              <div className="bg-slate-950/30 p-3 rounded-xl border border-slate-850 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Annual CO2 generated (Gas):</span>
                  <span className="font-bold text-slate-400">
                    {Math.round(results.annualGasCO2).toLocaleString()} kg
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Annual CO2 generated (EV):</span>
                  <span className="font-bold text-slate-400">
                    {Math.round(results.annualEvCO2).toLocaleString()} kg
                  </span>
                </div>
                <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between font-semibold">
                  <span className="text-slate-450">CO2 Emissions Reduced:</span>
                  <span className="font-black text-brand-emerald">
                    {results.annualCO2Savings > 0 ? `${Math.round(results.annualCO2Savings).toLocaleString()} kg` : '0 kg'}
                  </span>
                </div>
              </div>

              {/* Cost efficacy factor summary badge */}
              {results.efficiencyMultiplier > 1 && (
                <div className="text-center p-2.5 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 text-xs font-bold text-brand-cyan flex items-center justify-center gap-1.5">
                  <TrendingUp className="w-4 h-4 stroke-[2.5]" />
                  <span>EV is {results.efficiencyMultiplier.toFixed(1)}x cheaper to operate than Gas</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
