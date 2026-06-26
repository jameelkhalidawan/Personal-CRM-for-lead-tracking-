import {
  Activity,
  BarChart3,
  Building2,
  LayoutDashboard,
  ListOrdered,
  Mail,
  Phone,
  Radar,
  Settings,
  Trophy,
  Workflow,
  Users,
} from 'lucide-react';

export const NAV_SECTIONS = [
  {
    label: 'Core CRM',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/analytics', label: 'Analytics', icon: BarChart3 },
      { to: '/work-queue', label: 'Work queue', icon: ListOrdered },
      { to: '/businesses', label: 'Businesses', icon: Building2 },
      { to: '/decision-makers', label: 'Decision Makers', icon: Users },
      { to: '/activities', label: 'Activities', icon: Activity },
    ],
  },
  {
    label: 'Lead Scraping',
    items: [
      { to: '/scrape-leads', label: 'Scrape Leads', icon: Radar },
      { to: '/scrape-leads-processing', label: 'Scrape Processing', icon: Workflow },
      { to: '/captured-leads', label: 'Captured Leads', icon: Trophy },
    ],
  },
  {
    label: 'Templates',
    items: [
      { to: '/email-templates', label: 'Email scripts', icon: Mail },
      { to: '/call-templates', label: 'Call scripts', icon: Phone },
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export const NAV_ITEMS = NAV_SECTIONS.flatMap((section) => section.items);
