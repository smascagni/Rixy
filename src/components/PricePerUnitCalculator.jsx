import { useState, useMemo } from 'react';
import { DollarSign, RefreshCw, Sparkles, Award, HelpCircle, Check, AlertTriangle } from 'lucide-react';

// Unit Categories and Conversion Factors to a base unit
const UNIT_CATEGORIES = {
  weight: {
    label: 'Weight',
    units: [
      { id: 'g', name: 'Grams (g)', factor: 1, label: 'g' },
      { id: 'kg', name: 'Kilograms (kg)', factor: 1000, label: 'kg' },
      { id: 'oz', name: 'Ounces (oz)', factor: 28.349523, label: 'oz' },
      { id: 'lb', name: 'Pounds (lb)', factor: 453.59237, label: 'lb' }
    ]
  },
  volume: {
    label: 'Volume',
    units: [
      { id: 'ml', name: 'Milliliters (mL)', factor: 1, label: 'mL' },
      { id: 'l', name: 'Liters (L)', factor: 1000, label: 'L' },
      { id: 'floz', name: 'Fluid Ounces (fl oz)', factor: 29.57353, label: 'fl oz' },
      { id: 'gal', name: 'Gallons (gal)', factor: 3785.41178, label: 'gal' }
    ]
  },
  count: {
    label: 'Count',
    units: [
      { id: 'count', name: 'Pieces / Count', factor: 1, label: 'pcs' }
    ]
  }
};

// Flatten units for easy lookup
const UNITS = {};
Object.entries(UNIT_CATEGORIES).forEach(([category, data]) => {
  data.units.forEach(u => {
    UNITS[u.id] = { ...u, category };
  });
});

// Preset Scenarios
const PRESETS = [
  {
    name: 'Soda (Cans vs Bottles)',
    items: [
      { name: '12-Pack Cans', price: '6.99', quantity: '12', size: '12', unit: 'floz' },
      { name: '24-Pack Cans', price: '12.49', quantity: '24', size: '12', unit: 'floz' },
      { name: '2L Single Bottle', price: '2.49', quantity: '1', size: '2', unit: 'l' }
    ]
  },
  {
    name: 'Toilet Paper Sheets',
    items: [
      { name: 'Brand A (Standard)', price: '7.99', quantity: '12', size: '150', unit: 'count' },
      { name: 'Brand B (Super Roll)', price: '14.99', quantity: '24', size: '220', unit: 'count' },
      { name: 'Brand C (Mega Value)', price: '18.49', quantity: '30', size: '180', unit: 'count' }
    ]
  },
  {
    name: 'Olive Oil',
    items: [
      { name: 'Gourmet Small Bottle', price: '9.99', quantity: '1', size: '250', unit: 'ml' },
      { name: 'Kitchen Medium Bottle', price: '18.99', quantity: '1', size: '750', unit: 'ml' },
      { name: 'Bulk Value Tin', price: '34.99', quantity: '1', size: '3', unit: 'l' }
    ]
  },
  {
    name: 'Dog Food Bags',
    items: [
      { name: 'Small Bag', price: '15.99', quantity: '1', size: '5', unit: 'lb' },
      { name: 'Medium Bag', price: '34.99', quantity: '1', size: '15', unit: 'lb' },
      { name: 'Large Value Bag', price: '59.99', quantity: '1', size: '30', unit: 'lb' }
    ]
  }
];

export default function PricePerUnitCalculator() {
  const [items, setItems] = useState([
    { id: '1', name: 'Item A', price: '4.99', quantity: '1', size: '16', unit: 'oz' },
    { id: '2', name: 'Item B', price: '8.99', quantity: '1', size: '32', unit: 'oz' },
    { id: '3', name: 'Item C', price: '', quantity: '', size: '', unit: 'oz' }
  ]);

  // Load a preset
  const handleLoadPreset = (preset) => {
    setItems(preset.items.map((item, idx) => ({
      id: (idx + 1).toString(),
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      size: item.size,
      unit: item.unit
    })));
  };

  // Clear all fields
  const handleClear = () => {
    setItems([
      { id: '1', name: 'Item A', price: '', quantity: '1', size: '', unit: 'oz' },
      { id: '2', name: 'Item B', price: '', quantity: '1', size: '', unit: 'oz' },
      { id: '3', name: 'Item C', price: '', quantity: '1', size: '', unit: 'oz' }
    ]);
  };

  // Change handlers for fields
  const handleFieldChange = (itemId, field, value) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  // Math Calculations using useMemo
  const calculationResults = useMemo(() => {
    // 1. Process valid items
    const processed = items.map(item => {
      const price = parseFloat(item.price);
      const qty = parseFloat(item.quantity) || 1;
      const size = parseFloat(item.size);
      const unitData = UNITS[item.unit];

      if (isNaN(price) || price <= 0 || isNaN(size) || size <= 0) {
        return { ...item, isValid: false };
      }

      const totalQty = qty * size;
      const totalBaseQty = totalQty * unitData.factor;
      const pricePerBase = price / totalBaseQty;

      return {
        ...item,
        isValid: true,
        priceNum: price,
        qtyNum: qty,
        sizeNum: size,
        totalQty,
        totalBaseQty,
        pricePerBase,
        unitData
      };
    });

    const validItems = processed.filter(item => item.isValid);

    if (validItems.length === 0) {
      return { items: processed, bestId: null, hasCategoryMismatch: false };
    }

    // 2. Check for category mismatches
    const categories = new Set(validItems.map(item => item.unitData.category));
    const hasCategoryMismatch = categories.size > 1;

    // 3. Find the best value (cheapest price per base unit)
    let bestItem = validItems[0];
    validItems.forEach(item => {
      if (item.pricePerBase < bestItem.pricePerBase) {
        bestItem = item;
      }
    });

    // 4. Enrich calculated metrics (percentages, normalized values)
    const enrichedItems = processed.map(item => {
      if (!item.isValid) return item;

      const isBest = item.id === bestItem.id;
      const pctPenalty = isBest 
        ? 0 
        : ((item.pricePerBase - bestItem.pricePerBase) / bestItem.pricePerBase) * 100;

      // Price per single typed unit (e.g. Price / (Qty * Size))
      const pricePerSelected = item.priceNum / item.totalQty;

      // Normalized price in terms of the Best Item's unit (for fair unit category comparison)
      let priceNormalized = item.priceNum / item.totalQty;
      let normalizedUnitLabel = item.unitData.label;

      if (!hasCategoryMismatch) {
        // Convert base unit price back to the best item's unit size
        const bestUnitData = UNITS[bestItem.unit];
        priceNormalized = item.pricePerBase * bestUnitData.factor;
        normalizedUnitLabel = bestUnitData.label;
      }

      // Calculate Value Score (relative efficiency where best value is 100%)
      const valueScore = (bestItem.pricePerBase / item.pricePerBase) * 100;

      return {
        ...item,
        isBest,
        pctPenalty,
        pricePerSelected,
        priceNormalized,
        normalizedUnitLabel,
        valueScore
      };
    });

    return {
      items: enrichedItems,
      bestId: bestItem.id,
      hasCategoryMismatch
    };
  }, [items]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-brand-rose animate-pulse" />
            <span>Price per Unit Calculator</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Compare packages of different sizes, prices, and unit measurements to find the most cost-effective option.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-350 border border-slate-800 transition-colors shadow-inner"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Clear Fields</span>
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Preset Selector and Inputs */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Presets Card */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-rose" />
              <span>Select Comparison Preset</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleLoadPreset(preset)}
                  className="py-2.5 px-3 rounded-xl text-xs font-semibold border text-center transition-all bg-slate-950 text-slate-400 border-slate-850 hover:text-slate-200 hover:border-slate-800"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Side-by-Side Comparison Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {calculationResults.items.map((item, idx) => {
              const borderGlowClass = item.isBest 
                ? 'border-brand-emerald shadow-[0_0_15px_rgba(16,185,129,0.08)]' 
                : 'border-slate-800/80';

              return (
                <div 
                  key={item.id} 
                  className={`glass-card rounded-2xl p-5 border flex flex-col justify-between space-y-4 relative transition-all duration-300 ${borderGlowClass}`}
                >
                  {/* Badge Label */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      Option {item.id}
                    </span>
                    {item.isBest && (
                      <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/25 shadow-sm">
                        <Award className="w-3 h-3" />
                        <span>Best Value</span>
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 flex-1">
                    {/* Item Name */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Item Label</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleFieldChange(item.id, 'name', e.target.value)}
                        placeholder={`e.g. Brand ${String.fromCharCode(65 + idx)}`}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-white font-semibold focus:outline-none focus:border-brand-rose/60 transition-colors shadow-inner"
                      />
                    </div>

                    {/* Price Input */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Price ($)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-extrabold">$</span>
                        <input
                          type="number"
                          min="0.01"
                          step="any"
                          value={item.price}
                          onChange={(e) => handleFieldChange(item.id, 'price', e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-7 pr-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-brand-rose/60 transition-colors shadow-inner"
                        />
                      </div>
                    </div>

                    {/* Pack Quantity */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pack Quantity (Count)</label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(e) => handleFieldChange(item.id, 'quantity', e.target.value)}
                        placeholder="1 (default)"
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-white font-bold focus:outline-none focus:border-brand-rose/60 transition-colors shadow-inner"
                      />
                    </div>

                    {/* Size per Unit */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Size per Item</label>
                      <input
                        type="number"
                        min="0.01"
                        step="any"
                        value={item.size}
                        onChange={(e) => handleFieldChange(item.id, 'size', e.target.value)}
                        placeholder="e.g. 16"
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-white font-bold focus:outline-none focus:border-brand-rose/60 transition-colors shadow-inner"
                      />
                    </div>

                    {/* Unit Select */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Measurement Unit</label>
                      <select
                        value={item.unit}
                        onChange={(e) => handleFieldChange(item.id, 'unit', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 font-semibold focus:outline-none focus:border-brand-rose/60 transition-colors shadow-inner cursor-pointer"
                      >
                        {Object.entries(UNIT_CATEGORIES).map(([catId, cat]) => (
                          <optgroup key={catId} label={cat.label} className="bg-slate-950 text-slate-350">
                            {cat.units.map(u => (
                              <option key={u.id} value={u.id}>
                                {u.name}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Individual Output metrics if valid */}
                  {item.isValid ? (
                    <div className="mt-4 pt-4 border-t border-slate-850 text-center space-y-1">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        Price per unit
                      </div>
                      <div className="text-lg font-extrabold text-white">
                        ${item.pricePerSelected.toFixed(4)}
                        <span className="text-[10px] font-semibold text-slate-400">/{item.unitData.label}</span>
                      </div>
                      
                      {!item.isBest && (
                        <div className="text-[10px] font-semibold text-brand-rose">
                          +{item.pctPenalty.toFixed(1)}% cost penalty
                        </div>
                      )}
                      {item.isBest && (
                        <div className="text-[10px] font-bold text-brand-emerald flex items-center justify-center gap-0.5">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>100% Value Efficiency</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-4 pt-4 border-t border-slate-850 text-center py-2">
                      <div className="text-[10px] text-slate-650 font-bold uppercase tracking-wider">
                        Enter details to compare
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Category mismatch warning if applicable */}
          {calculationResults.hasCategoryMismatch && (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-brand-amber/20 bg-brand-amber/5 text-xs text-brand-amber leading-relaxed">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div>
                <strong className="font-bold text-white block mb-0.5">Mismatched Unit Categories Selected</strong>
                You are comparing items across different dimensions (e.g. Weight vs Volume vs Count). Double-check that your unit types represent the same category for an accurate value calculation.
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Comparative Visualizer */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card rounded-2xl p-5 md:p-6 border border-slate-800 flex flex-col h-full justify-between">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-brand-rose" />
                <span>Value Comparison Summary</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                A visual representation of price efficiency. The item with 100% value score offers the most product per dollar. Lower scores mean you pay more per unit.
              </p>

              {/* Chart Bars */}
              <div className="space-y-5 pt-2">
                {calculationResults.items.map((item) => {
                  if (!item.isValid) {
                    return (
                      <div key={item.id} className="space-y-1.5 opacity-30">
                        <div className="text-[10px] text-slate-500 font-bold">Option {item.id} (Incomplete)</div>
                        <div className="w-full h-3 bg-slate-950 rounded-full border border-slate-850"></div>
                      </div>
                    );
                  }

                  const glowColor = item.isBest 
                    ? 'bg-brand-emerald shadow-[0_0_10px_rgba(16,185,129,0.5)]' 
                    : item.valueScore > 75 
                    ? 'bg-brand-cyan shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                    : 'bg-brand-rose shadow-[0_0_10px_rgba(244,63,94,0.4)]';

                  return (
                    <div key={item.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-slate-300 font-bold">{item.name || `Option ${item.id}`}</span>
                        <span className={`font-extrabold ${item.isBest ? 'text-brand-emerald' : 'text-slate-400'}`}>
                          {item.valueScore.toFixed(0)}% Value
                        </span>
                      </div>
                      
                      {/* Progress Bar Container */}
                      <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden border border-slate-850 p-[2px]">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ${glowColor}`}
                          style={{ width: `${item.valueScore}%` }}
                        ></div>
                      </div>

                      {/* Normalization Readout */}
                      <div className="flex justify-between text-[10px] text-slate-500 font-semibold px-0.5">
                        <span>Price per basis:</span>
                        <span className={item.isBest ? 'text-brand-emerald' : 'text-slate-350'}>
                          ${item.priceNormalized.toFixed(4)} / {item.normalizedUnitLabel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Helper Tips */}
            <div className="pt-6 border-t border-slate-850 mt-6 space-y-3">
              <h4 className="text-xs font-bold text-white">Smart Shopping Tips</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Supermarkets often display a "Unit Price" on shelf tags, but they frequently use different unit sizes (e.g. price per lb on one brand, price per oz on another) to confuse comparisons. 
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Always normalize sizes to find true savings. Buying in bulk isn't always cheaper—especially during promotional sales on smaller packs!
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
