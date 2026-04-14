import { PlayerProvider } from './context/PlayerContext';
import { AppLayout } from './components/layout/AppLayout';

export default function App() {
  return (
    <PlayerProvider>
      <AppLayout />
    </PlayerProvider>
  );
}
