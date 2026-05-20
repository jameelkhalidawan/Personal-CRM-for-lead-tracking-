import {
  Activity,
  BarChart3,
  Building2,
  LayoutDashboard,
  ListOrdered,
  Mail,
  Phone,
  Settings,
  Users,
} from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/work-queue', label: 'Work queue', icon: ListOrdered },
  { to: '/businesses', label: 'Businesses', icon: Building2 },
  { to: '/decision-makers', label: 'Decision Makers', icon: Users },
  { to: '/activities', label: 'Activities', icon: Activity },
  { to: '/email-templates', label: 'Email Templates', icon: Mail },
  { to: '/call-templates', label: 'Call Scripts', icon: Phone },
  { to: '/settings', label: 'Settings', icon: Settings },
];
