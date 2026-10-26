import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  BookOpen,
  Boxes,
  BriefcaseBusiness,
  Building2,
  ExternalLink,
  FolderKanban,
  GraduationCap,
  LogOut,
  Menu,
  MessageSquare,
  Quote,
  Settings,
  ShieldCheck,
  Users,
  X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';
import { Logo } from '../components/site/Logo';
import { Badge } from '../components/ui/Badge';

interface NavItem {
  to: string;
  label: string;
  icon: typeof BarChart3;
  permission: string;
  end?: boolean;
}

const NAV_GROUPS: Array<{ label: string; items: NavItem[] }> = [
  {
    label: 'Overview',
    items: [
      { to: '/admin', label: 'Dashboard', icon: BarChart3, permission: 'dashboard:read', end: true }
    ]
  },
  {
    label: 'Enquiries',
    items: [
      { to: '/admin/quotes', label: 'Quote requests', icon: Quote, permission: 'quotes:read' },
      { to: '/admin/contacts', label: 'Contact messages', icon: MessageSquare, permission: 'contacts:read' },
      {
        to: '/admin/registrations',
        label: 'Course registrations',
        icon: GraduationCap,
        permission: 'registrations:read'
      }
    ]
  },
  {
    label: 'Website content',
    items: [
      { to: '/admin/services', label: 'Services', icon: BriefcaseBusiness, permission: 'content:read' },
      { to: '/admin/courses', label: 'Courses', icon: BookOpen, permission: 'content:read' },
      { to: '/admin/projects', label: 'Projects', icon: FolderKanban, permission: 'content:read' },
      { to: '/admin/products', label: 'Products & stock', icon: Boxes, permission: 'products:read' },
      { to: '/admin/staff', label: 'Public profiles', icon: Users, permission: 'content:read' }
    ]
  },
  {
    label: 'Administration',
    items: [
      { to: '/admin/settings', label: 'Settings & content', icon: Settings, permission: 'settings:write' },
      { to: '/admin/users', label: 'Users & roles', icon: ShieldCheck, permission: 'users:manage' },
      { to: '/admin/audit', label: 'Activity log', icon: Activity, permission: 'audit:read' }
    ]
  }
];

function initials(value: string): string {
  return value
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { me, signOut } = useAuth();
  const navigate = useNavigate();
  const groups = useMemo(
    () =>
      NAV_GROUPS.map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            me?.permissions.includes(item.permission) || me?.roles.includes('admin')
        )
      })).filter((group) => group.items.length > 0),
    [me]
  );

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-full flex-col bg-navy-950 text-navy-200">
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
        <Link to="/admin" onClick={onNavigate} aria-label="KILSTA administration">
          <Logo light />
        </Link>
      </div>

      <nav className="scroll-thin flex-1 overflow-y-auto px-3 py-5" aria-label="Administration">
        {groups.map((group) => (
          <div key={group.label} className="mb-6">
            <p className="px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-navy-400">
              {group.label}
            </p>
            <div className="mt-2 space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition',
                      isActive
                        ? 'bg-teal-500/15 text-white'
                        : 'text-navy-200 hover:bg-white/5 hover:text-white'
                    )
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-xs font-bold text-teal-200">
            {initials(me?.profile?.full_name || me?.user.email || 'KILSTA')}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">
              {me?.profile?.full_name || me?.user.email}
            </p>
            <p className="truncate text-[11px] text-navy-400">{me?.user.email}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <Badge tone="teal">
            {me?.roles.includes('admin') ? 'Administrator' : 'Staff'}
          </Badge>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-semibold text-navy-300 hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            Sign out
          </button>
        </div>
        <Link
          to="/"
          className="mt-3 flex items-center justify-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-[11px] font-semibold text-navy-300 hover:bg-white/5 hover:text-white"
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          View public website
        </Link>
      </div>
    </div>
  );
}

export function AdminLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { me } = useAuth();

  const current = useMemo(() => {
    const items = NAV_GROUPS.flatMap((group) => group.items);
    return (
      items.find((item) => item.end && item.to === location.pathname) ??
      items.find((item) => !item.end && location.pathname.startsWith(item.to)) ??
      items[0]
    );
  }, [location.pathname]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
        <Sidebar />
      </aside>

      {open ? (
        <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Administration menu">
          <button
            type="button"
            className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            tabIndex={-1}
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85%] animate-fade-in shadow-lift">
            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                className="rounded-lg border border-slate-300 p-2 text-navy-800 lg:hidden"
                onClick={() => setOpen(true)}
                aria-label="Open administration menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-navy-900">{current.label}</p>
                <p className="hidden text-[11px] text-slate-500 sm:block">
                  {me?.profile?.full_name || me?.user.email} · KILSTA administration
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-medium text-slate-600 sm:inline-flex">
                <Building2 className="h-3.5 w-3.5 text-teal-600" aria-hidden="true" />
                Alotau, Milne Bay
              </span>
              <button
                type="button"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 sm:py-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      {open ? (
        <button
          type="button"
          className="fixed right-4 top-4 z-[80] rounded-lg bg-white p-2 text-navy-900 shadow-lift lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      ) : null}
    </div>
  );
}
