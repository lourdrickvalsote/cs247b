import { useRef, useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Timer, Leaf, BarChart3, Settings } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import ConfirmDialog from './ui/ConfirmDialog';

const links = [
  { to: '/timer', label: 'Timer', icon: Timer },
  { to: '/activities', label: 'Activities', icon: Leaf },
  { to: '/history', label: 'History', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { phase } = useSession();
  const navRef = useRef<HTMLDivElement>(null);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });
  const [pendingNav, setPendingNav] = useState<string | null>(null);

  const isActiveSession = phase === 'working' || phase === 'breaking';

  useEffect(() => {
    const activeIndex = links.findIndex((l) =>
      location.pathname.startsWith(l.to),
    );
    if (activeIndex === -1 || !navRef.current) return;

    const el = navRef.current.children[activeIndex + 1] as HTMLElement;
    if (!el) return;

    setPillStyle({
      left: el.offsetLeft + el.offsetWidth / 2 - 20,
      width: 40,
    });
  }, [location.pathname]);

  return (
    <nav aria-label="Main navigation" className="fixed bottom-0 inset-x-0 z-30 bg-white/90 dark:bg-jet-950/90 backdrop-blur-md border-t border-powder-200 dark:border-jet-700">
      <div
        ref={navRef}
        className="max-w-lg mx-auto flex items-center justify-around h-[4.5rem] px-2 relative"
      >
        <div
          className="absolute top-2 h-10 rounded-xl bg-forest/15 transition-all duration-300 pointer-events-none"
          style={{ left: pillStyle.left, width: pillStyle.width, transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        />

        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            aria-label={label}
            onClick={(e) => {
              if (isActiveSession && to !== '/timer') {
                e.preventDefault();
                setPendingNav(to);
              }
            }}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-200 relative z-10 active:scale-95 ${
                isActive
                  ? 'text-forest'
                  : 'text-lilac-400 hover:text-jet-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-forest absolute -top-0.5 animate-scale-in" aria-hidden="true" />
                )}
                <Icon
                  className={`w-5 h-5 transition-all duration-200 ${
                    isActive ? 'scale-110 -translate-y-[1px]' : ''
                  }`}
                />
                <span
                  className={`text-[10px] font-semibold transition-all duration-200 ${
                    isActive ? 'text-forest' : ''
                  }`}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />

      <ConfirmDialog
        open={!!pendingNav}
        title="Leave active session?"
        message="Your timer is still running. You can come back anytime."
        confirmLabel="Leave"
        cancelLabel="Stay"
        onConfirm={() => {
          const target = pendingNav;
          setPendingNav(null);
          if (target) navigate(target);
        }}
        onCancel={() => setPendingNav(null)}
      />
    </nav>
  );
}
