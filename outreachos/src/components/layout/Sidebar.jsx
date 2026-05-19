import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/cn';
import { NAV_ITEMS } from '../../config/navigation';
import { useAuthStore } from '../../stores/authStore';

function getInitials(user) {
  const name =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.display_name ||
    user?.email ||
    '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.display_name ||
    user?.email?.split('@')[0] ||
    'User';

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-border bg-background-card">
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-primary text-sm font-bold text-white">
          O
        </div>
        <div>
          <p className="text-body font-semibold text-text-primary leading-tight">
            OutreachOS
          </p>
          <p className="text-small text-text-muted">Sales CRM</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-body transition-colors',
                isActive
                  ? 'bg-accent-primary/15 text-text-primary border border-accent-primary/30'
                  : 'text-text-secondary hover:bg-background-elevated hover:text-text-primary border border-transparent',
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background-elevated border border-border text-small font-semibold text-accent-primary">
            {getInitials(user)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-body font-medium text-text-primary">
              {displayName}
            </p>
            <p className="truncate text-small text-text-muted">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
