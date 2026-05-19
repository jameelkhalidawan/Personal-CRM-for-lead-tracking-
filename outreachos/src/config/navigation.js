import {
  Activity,
  Building2,
  LayoutDashboard,
  Mail,
  Settings,
  Users,
} from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/businesses', label: 'Businesses', icon: Building2 },
  { to: '/decision-makers', label: 'Decision Makers', icon: Users },
  { to: '/activities', label: 'Activities', icon: Activity },
  { to: '/email-templates', label: 'Email Templates', icon: Mail },
  { to: '/settings', label: 'Settings', icon: Settings },
];
