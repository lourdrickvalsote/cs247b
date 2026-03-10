import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';
import { useSession } from '../contexts/SessionContext';

export default function AppLayout() {
  const { phase } = useSession();
  const location = useLocation();
  const hideNav = phase === 'break_alert' || phase === 'breaking';

  return (
    <div className="min-h-screen bg-alice dark:bg-jet-950">
      <div key={location.pathname} className="animate-fade-in">
        <Outlet />
      </div>
      {!hideNav && <BottomNav />}
    </div>
  );
}
