import React, { useState } from 'react';
import { Beaker, Calculator, Menu, X, Home, Compass, ShieldAlert, Sparkles, Zap } from 'lucide-react';

export default function Layout({ children, activeTab, setActiveTab }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: Home, badge: null },
    { id: 'chemical-mixing', name: 'Chemical Mixing', icon: Beaker, badge: 'Active' },
    { id: 'ev-vs-gas', name: 'EV vs Gas Range', icon: Zap, badge: 'Active' },
    { id: 'unit-converter', name: 'Unit Converter', icon: Compass, badge: 'Soon', disabled: true },
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-slate-100 flex flex-col relative overflow-hidden selection:bg-brand-cyan/30 selection:text-brand-cyan">
      
      {/* Background Ambient Glow Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-brand-cyan/5 blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-brand-emerald/5 blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Header (Mobile & Sticky Top) */}
      <header className="sticky top-0 z-40 w-full glass-card border-b border-slate-800/80 px-4 py-3 flex items-center justify-between md:px-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-brand-cyan to-brand-emerald rounded-xl shadow-lg shadow-brand-cyan/10">
            <Beaker className="w-6 h-6 text-brand-bg stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5 leading-none">
              Rixy <span className="text-[10px] uppercase font-semibold tracking-wider bg-brand-cyan/15 text-brand-cyan px-1.5 py-0.5 rounded border border-brand-cyan/20">v1.0</span>
            </h1>
            <p className="text-[10px] text-slate-400 mt-0.5">Premium Multi-Calculator Suite</p>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-white transition-colors md:hidden"
          id="mobile-menu-open-btn"
          aria-label="Open navigation menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Desktop Quick Header Stats/Details */}
        <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-emerald animate-ping"></span>
            <span>All systems ready</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex relative">
        
        {/* Desktop Sidebar Sidebar */}
        <aside className="hidden md:flex flex-col w-64 border-r border-slate-800/80 p-6 shrink-0 bg-brand-bg/40 backdrop-blur-sm">
          <nav className="space-y-1.5 flex-1">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-3">Calculators</div>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  disabled={item.disabled}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-cyan/15 to-brand-emerald/10 text-white border border-brand-cyan/35 shadow-inner'
                      : item.disabled
                      ? 'text-slate-600 cursor-not-allowed opacity-50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-brand-cyan' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                      item.badge === 'Active' 
                        ? 'bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20' 
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Info Box in Sidebar */}
          <div className="mt-auto p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 text-xs text-slate-400 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-brand-cyan font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ratio Chemical Tip</span>
            </div>
            <p className="leading-relaxed">
              Always pour chemical concentrate into diluent (water) to prevent splashing and chemical reactions.
            </p>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" 
              onClick={() => setMobileMenuOpen(false)}
            ></div>

            {/* Sidebar content */}
            <div className="relative w-4/5 max-w-xs bg-slate-900 border-r border-slate-800 p-6 flex flex-col h-full z-50">
              <div className="flex items-center justify-between mb-8">
                <span className="text-lg font-bold text-white">Rixy Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="space-y-1.5 flex-grow">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      disabled={item.disabled}
                      onClick={() => {
                        if (!item.disabled) {
                          setActiveTab(item.id);
                          setMobileMenuOpen(false);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-slate-800 text-white border border-brand-cyan/30'
                          : item.disabled
                          ? 'text-slate-600 opacity-50 cursor-not-allowed'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                          item.badge === 'Active' 
                            ? 'bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20' 
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-400">
                <p className="font-semibold text-slate-300 mb-1">Rixy v1.0</p>
                <p>A home for professional calculations and ratios.</p>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 min-w-0 overflow-y-auto px-4 py-6 md:p-8 lg:p-10 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
