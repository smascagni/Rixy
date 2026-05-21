import React, { useState } from 'react';
import Layout from './components/common/Layout';
import Dashboard from './components/Dashboard';
import RatioCalculator from './components/RatioCalculator';
import EvVsGasCalculator from './components/EvVsGasCalculator';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && (
        <Dashboard setActiveTab={setActiveTab} />
      )}
      {activeTab === 'chemical-mixing' && (
        <RatioCalculator />
      )}
      {activeTab === 'ev-vs-gas' && (
        <EvVsGasCalculator />
      )}
    </Layout>
  );
}
