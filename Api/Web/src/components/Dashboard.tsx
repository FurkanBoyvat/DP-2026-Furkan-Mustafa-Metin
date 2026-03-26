import React from 'react';
import { StatPanel } from './StatPanel';
import { MapPanel } from './MapPanel';
import { ChartsPanel } from './ChartsPanel';

export default function Dashboard() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Top Navigation / Stats */}
      <StatPanel />

      {/* Map Visualization */}
      <div className="flex-1 min-h-[400px] p-4 flex flex-col">
        <MapPanel />
      </div>

      {/* Bottom Dashboard Charts */}
      <ChartsPanel />
    </div>
  );
}
