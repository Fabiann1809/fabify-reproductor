import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { PlayerCenter } from './PlayerCenter';
import { RightPanel } from './RightPanel';

// 'queue' = default cola view in right panel
export type ActiveView = 'queue' | 'library' | 'search' | 'history';

export function AppLayout() {
  const [activeView, setActiveView] = useState<ActiveView>('queue');

  const handleViewChange = (view: ActiveView) => {
    // clicking the active nav item returns to queue
    setActiveView((prev) => (prev === view ? 'queue' : view));
  };

  return (
    <div className="app-layout">
      <Sidebar activeView={activeView} onViewChange={handleViewChange} />
      <PlayerCenter />
      <RightPanel activeView={activeView} onViewChange={setActiveView} />
    </div>
  );
}
