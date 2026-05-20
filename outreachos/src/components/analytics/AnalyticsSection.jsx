import {
  AlertTriangle,
  Award,
  BarChart3,
  Clock,
  Filter,
  Layers,
  Mail,
  RefreshCw,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { cn } from '../../lib/cn';

const SECTION_ICONS = {
  funnel: Filter,
  niche: Target,
  followUp: Mail,
  delay: Clock,
  time: TrendingUp,
  overview: BarChart3,
};

export function AnalyticsSection({
  title,
  description,
  icon = 'funnel',
  insight,
  children,
  className,
}) {
  const Icon = SECTION_ICONS[icon] ?? BarChart3;

  return (
    <Card className={cn('mb-6 overflow-hidden', className)}>
      <CardHeader className="bg-gradient-to-r from-background-elevated/80 to-transparent">
        <div className="flex items-start gap-3">
          <div className="rounded-lg border border-accent-primary/30 bg-accent-primary/10 p-2.5 shrink-0">
            <Icon className="h-5 w-5 text-accent-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-h3 text-text-primary">{title}</h2>
            {description && (
              <p className="text-small text-text-muted mt-1 leading-relaxed">
                {description}
              </p>
            )}
            {insight && (
              <p className="text-xs text-accent-secondary mt-2 rounded-md bg-accent-secondary/10 border border-accent-secondary/20 px-2.5 py-1.5 inline-block">
                {insight}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardBody className="pt-5">{children}</CardBody>
    </Card>
  );
}

export function ConversionBadge({ value }) {
  if (value == null || value === '—') {
    return <span className="text-text-muted">—</span>;
  }
  const num = parseInt(String(value).replace('%', ''), 10);
  const tone =
    num >= 40 ? 'good' : num >= 15 ? 'mid' : num > 0 ? 'low' : 'muted';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium tabular-nums',
        tone === 'good' &&
          'border-status-interested/40 bg-status-interested/15 text-status-interested',
        tone === 'mid' &&
          'border-accent-secondary/40 bg-accent-secondary/15 text-accent-secondary',
        tone === 'low' &&
          'border-priority-medium/40 bg-priority-medium/15 text-priority-medium',
        tone === 'muted' && 'border-border text-text-muted',
      )}
    >
      {value}
    </span>
  );
}

export function AnalyticsTable({ columns, rows, emptyMessage = 'No data yet.' }) {
  if (!rows?.length) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-background-elevated/20 px-6 py-10 text-center">
        <Layers className="h-8 w-8 text-text-muted mx-auto mb-2 opacity-50" />
        <p className="text-small text-text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-background-card/50">
      <table className="w-full min-w-[480px] text-left text-small">
        <thead>
          <tr className="border-b border-border bg-background-elevated/60">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-4 py-3 text-label uppercase text-text-muted font-medium tracking-wide',
                  col.align === 'right' && 'text-right',
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.id ?? i}
              className="border-b border-border/40 last:border-0 transition-colors hover:bg-accent-primary/5"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-text-primary',
                    col.align === 'right' && 'text-right',
                  )}
                >
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const SUMMARY_ACCENTS = [
  { ring: 'ring-accent-primary/30', bg: 'bg-accent-primary/10', icon: Users },
  { ring: 'ring-accent-secondary/30', bg: 'bg-accent-secondary/10', icon: Target },
  { ring: 'ring-status-interested/30', bg: 'bg-status-interested/10', icon: TrendingUp },
  { ring: 'ring-status-closed_won/30', bg: 'bg-status-closed_won/10', icon: BarChart3 },
  { ring: 'ring-status-contacted/30', bg: 'bg-status-contacted/10', icon: Mail },
  { ring: 'ring-status-proposal/30', bg: 'bg-status-proposal/10', icon: Filter },
];

export function SummaryMetric({ label, value, sub, index = 0 }) {
  const accent = SUMMARY_ACCENTS[index % SUMMARY_ACCENTS.length];
  const Icon = accent.icon;

  return (
    <div
      className={cn(
        'rounded-xl border border-border p-4 transition-shadow hover:shadow-md hover:border-border-hover',
        'bg-gradient-to-br from-background-card to-background-elevated/40',
        accent.ring,
        'ring-1 ring-inset',
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-label uppercase text-text-muted tracking-wide">{label}</p>
        <div className={cn('rounded-md p-1.5', accent.bg)}>
          <Icon className="h-3.5 w-3.5 text-text-secondary" />
        </div>
      </div>
      <p className="text-h2 text-text-primary tabular-nums font-semibold tracking-tight">
        {value}
      </p>
      {sub && <p className="text-xs text-text-muted mt-1.5">{sub}</p>}
    </div>
  );
}

const FUNNEL_COLORS = [
  'bg-accent-primary',
  'bg-accent-secondary',
  'bg-status-contacted',
  'bg-status-interested',
  'bg-status-proposal',
  'bg-status-closed_won',
];

export function FunnelChart({ rows }) {
  if (!rows?.length) return null;

  const maxCount = Math.max(...rows.map((r) => r.count), 1);

  return (
    <div className="space-y-3">
      {rows.map((row, i) => {
        const width = Math.max(8, Math.round((row.count / maxCount) * 100));
        return (
          <div key={row.stage} className="group">
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-background-elevated text-xs font-medium text-text-muted border border-border">
                  {i + 1}
                </span>
                <span className="text-small font-medium text-text-primary truncate">
                  {row.stage}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-small font-semibold text-text-primary tabular-nums">
                  {row.count}
                </span>
                <ConversionBadge value={row.conversionLabel} />
              </div>
            </div>
            <div className="ml-8 h-2.5 rounded-full bg-background-elevated overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  FUNNEL_COLORS[i % FUNNEL_COLORS.length],
                )}
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function BarChartRows({ rows, valueKey, labelKey, max: maxProp, colorClass }) {
  if (!rows?.length) return null;
  const max = maxProp ?? Math.max(...rows.map((r) => r[valueKey]), 1);

  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const val = row[valueKey] ?? 0;
        const width = max > 0 ? Math.max(val > 0 ? 6 : 0, (val / max) * 100) : 0;
        return (
          <div key={row[labelKey]}>
            <div className="flex justify-between text-small mb-1">
              <span className="text-text-secondary">{row[labelKey]}</span>
              <span className="font-medium text-text-primary tabular-nums">{val}</span>
            </div>
            <div className="h-2 rounded-full bg-background-elevated overflow-hidden">
              <div
                className={cn('h-full rounded-full', colorClass ?? 'bg-accent-primary')}
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function RateBar({ value, label }) {
  const num = typeof value === 'number' ? value : parseInt(String(value), 10);
  const display = Number.isNaN(num) ? '—' : `${num}%`;
  const width = Number.isNaN(num) ? 0 : Math.min(100, num);

  return (
    <div className="flex items-center gap-2 justify-end min-w-[100px]">
      <div className="flex-1 max-w-[72px] h-1.5 rounded-full bg-background-elevated overflow-hidden">
        <div
          className="h-full rounded-full bg-accent-secondary"
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="text-small tabular-nums text-text-primary w-10 text-right">
        {display}
      </span>
    </div>
  );
}

export function MonthlyChart({ rows }) {
  if (!rows?.length) return null;
  const maxOutreach = Math.max(...rows.map((r) => r.outreach), 1);
  const maxRevenue = Math.max(...rows.map((r) => r.revenue), 1);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <p className="text-label uppercase text-text-muted mb-3">Outreach volume</p>
        <div className="flex items-end gap-2 h-36">
          {rows.map((m) => {
            const h = Math.max(4, (m.outreach / maxOutreach) * 100);
            return (
              <div
                key={`o-${m.key}`}
                className="flex-1 flex flex-col items-center gap-1 min-w-0"
                title={`${m.label}: ${m.outreach} outreach`}
              >
                <span className="text-[10px] text-text-muted tabular-nums">{m.outreach}</span>
                <div
                  className="w-full rounded-t-md bg-accent-primary/90 min-h-[4px] transition-all"
                  style={{ height: `${h}%` }}
                />
                <span className="text-[9px] text-text-muted truncate w-full text-center">
                  {m.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <p className="text-label uppercase text-text-muted mb-3">Revenue</p>
        <div className="flex items-end gap-2 h-36">
          {rows.map((m) => {
            const h = Math.max(4, (m.revenue / maxRevenue) * 100);
            return (
              <div
                key={`r-${m.key}`}
                className="flex-1 flex flex-col items-center gap-1 min-w-0"
                title={`${m.label}: revenue`}
              >
                <div
                  className="w-full rounded-t-md bg-status-closed_won/90 min-h-[4px] transition-all"
                  style={{ height: `${h}%` }}
                />
                <span className="text-[9px] text-text-muted truncate w-full text-center">
                  {m.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function OverviewHero({ summary, formatCurrency }) {
  return (
    <Card className="mb-8 overflow-hidden border-accent-primary/20">
      <div className="relative px-6 py-5 bg-gradient-to-br from-accent-primary/15 via-background-card to-background-elevated/30">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <RefreshCw className="h-4 w-4 text-accent-primary" />
              <span className="text-label uppercase text-accent-primary tracking-wide">
                Live from your CRM data
              </span>
            </div>
            <p className="text-small text-text-secondary max-w-xl">
              Metrics update from logged activities and contact records. Log replies,
              meetings, and closes for accurate insights.
            </p>
          </div>
          {summary && (
            <div className="flex flex-wrap gap-4 text-right">
              <div>
                <p className="text-[10px] uppercase text-text-muted">Pipeline</p>
                <p className="text-h3 font-semibold text-text-primary tabular-nums">
                  {summary.pipelineValue != null && formatCurrency
                    ? formatCurrency(summary.pipelineValue)
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-text-muted">Leads</p>
                <p className="text-h3 font-semibold text-text-primary tabular-nums">
                  {summary.totalLeads}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export function QuickInsightCards({ funnelInsights, topNiches }) {
  const cards = [];

  if (funnelInsights?.bottleneck) {
    cards.push({
      key: 'bottleneck',
      icon: AlertTriangle,
      tone: 'warning',
      title: 'Biggest drop-off',
      value: funnelInsights.bottleneck.stage,
      sub: `${funnelInsights.bottleneck.conversion} conversion · ${funnelInsights.bottleneck.hint}`,
    });
  }
  if (funnelInsights?.strongest) {
    cards.push({
      key: 'strong',
      icon: Zap,
      tone: 'good',
      title: 'Strongest step',
      value: funnelInsights.strongest.stage,
      sub: `${funnelInsights.strongest.conversion} conversion — keep doing this`,
    });
  }
  if (topNiches?.bestReply) {
    cards.push({
      key: 'niche',
      icon: Award,
      tone: 'accent',
      title: 'Top niche (replies)',
      value: topNiches.bestReply.niche,
      sub: `${topNiches.bestReply.replyRateLabel} reply rate · ${topNiches.bestReply.leads} leads`,
    });
  }
  if (topNiches?.needsWork) {
    cards.push({
      key: 'avoid',
      icon: Target,
      tone: 'muted',
      title: 'Review niche',
      value: topNiches.needsWork.niche,
      sub: `Low reply rate — consider less focus here`,
    });
  }

  if (!cards.length) return null;

  const toneClass = {
    warning: 'border-priority-high/30 bg-priority-high/5',
    good: 'border-status-interested/30 bg-status-interested/5',
    accent: 'border-accent-secondary/30 bg-accent-secondary/5',
    muted: 'border-border bg-background-elevated/30',
  };

  const iconClass = {
    warning: 'text-priority-high bg-priority-high/15',
    good: 'text-status-interested bg-status-interested/15',
    accent: 'text-accent-secondary bg-accent-secondary/15',
    muted: 'text-text-muted bg-background-elevated',
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 mb-8">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.key}
            className={cn(
              'rounded-xl border p-4 flex gap-3',
              toneClass[c.tone],
            )}
          >
            <div className={cn('rounded-lg p-2 h-fit shrink-0', iconClass[c.tone])}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-label uppercase text-text-muted">{c.title}</p>
              <p className="text-body font-semibold text-text-primary mt-0.5 truncate">
                {c.value}
              </p>
              <p className="text-xs text-text-muted mt-1 leading-snug">{c.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const ACTIVITY_COLORS = {
  call: 'bg-status-contacted',
  email: 'bg-accent-secondary',
  outcome: 'bg-status-interested',
  note: 'bg-text-muted/50',
};

const WORKLOAD_COLORS = {
  cold: 'border-accent-secondary/40 bg-accent-secondary/10',
  engaged: 'border-status-interested/40 bg-status-interested/10',
  awaiting: 'border-accent-primary/40 bg-accent-primary/10',
  noOutreach: 'border-border bg-background-elevated/50',
  closed: 'border-status-closed_won/40 bg-status-closed_won/10',
};

export function ActivityBreakdownChart({ rows }) {
  if (!rows?.length) return null;
  const maxTotal = Math.max(...rows.map((r) => r.total), 1);

  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <div key={row.label}>
          <div className="flex justify-between text-small mb-1.5">
            <span className="text-text-primary font-medium">{row.label}</span>
            <span className="text-text-muted tabular-nums">
              <span className="text-accent-secondary font-medium">{row.week}</span>
              <span className="mx-1">/</span>
              {row.total} total
            </span>
          </div>
          <div className="h-3 rounded-full bg-background-elevated overflow-hidden flex">
            <div
              className={cn('h-full', ACTIVITY_COLORS[row.color] ?? 'bg-accent-primary')}
              style={{
                width: `${Math.max(row.total ? 4 : 0, (row.total / maxTotal) * 100)}%`,
              }}
              title={`${row.total} all time`}
            />
          </div>
          <p className="text-[10px] text-text-muted mt-0.5">
            {row.week} logged in the last 7 days
          </p>
        </div>
      ))}
    </div>
  );
}

export function ContactWorkloadGrid({ rows }) {
  if (!rows?.length) return null;
  const total = rows.reduce((s, r) => s + r.count, 0) || 1;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((row) => (
        <div
          key={row.key}
          className={cn(
            'rounded-xl border p-4 transition-transform hover:scale-[1.02]',
            WORKLOAD_COLORS[row.key] ?? WORKLOAD_COLORS.noOutreach,
          )}
        >
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-small font-medium text-text-primary">{row.label}</p>
            <p className="text-h2 font-bold tabular-nums text-text-primary">{row.count}</p>
          </div>
          <p className="text-xs text-text-muted mt-1">{row.desc}</p>
          <div className="mt-2 h-1 rounded-full bg-background-elevated overflow-hidden">
            <div
              className="h-full bg-accent-primary/60 rounded-full"
              style={{ width: `${Math.round((row.count / total) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

const STATUS_BAR = {
  new: 'bg-status-new',
  contacted: 'bg-status-contacted',
  interested: 'bg-status-interested',
  proposal_sent: 'bg-status-proposal',
  closed_won: 'bg-status-closed_won',
  closed_lost: 'bg-status-closed_lost',
  not_interested: 'bg-status-not_interested',
};

export function PipelineSnapshotChart({ rows }) {
  if (!rows?.length) {
    return (
      <p className="text-small text-text-muted">Add businesses to see pipeline spread.</p>
    );
  }
  const max = Math.max(...rows.map((r) => r.count), 1);

  return (
    <div className="space-y-2.5">
      {rows.map((row) => (
        <div key={row.status} className="flex items-center gap-3">
          <span className="text-small text-text-secondary w-28 shrink-0 truncate">
            {row.label}
          </span>
          <div className="flex-1 h-2.5 rounded-full bg-background-elevated overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full',
                STATUS_BAR[row.status] ?? 'bg-accent-primary',
              )}
              style={{ width: `${Math.max(6, (row.count / max) * 100)}%` }}
            />
          </div>
          <span className="text-small font-medium tabular-nums w-8 text-right">
            {row.count}
          </span>
        </div>
      ))}
    </div>
  );
}

export function DonutStat({ label, value, total, strokeColor = '#6366f1' }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const r = 36;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <div className="flex flex-col items-center p-4 rounded-xl border border-border bg-background-elevated/20 hover:border-border-hover transition-colors">
      <svg width="88" height="88" className="mb-2 -rotate-90">
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-background-elevated"
        />
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke={strokeColor}
          strokeWidth="8"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <span className="text-h3 font-bold tabular-nums text-text-primary -mt-14 mb-6 relative z-10">
        {pct}%
      </span>
      <p className="text-xs text-text-muted text-center leading-tight">{label}</p>
      <p className="text-small font-medium text-text-primary tabular-nums mt-0.5">
        {value} / {total}
      </p>
    </div>
  );
}
