import { formatCurrency } from '../../lib/format';
import { Card, CardBody } from '../ui/Card';

function StatCard({ label, value, sub, accent }) {
  return (
    <Card>
      <CardBody className="py-4">
        <p className="text-label uppercase text-text-muted mb-1">{label}</p>
        <p
          className={`text-h2 ${accent ? 'text-accent-secondary' : 'text-text-primary'}`}
        >
          {value}
        </p>
        {sub && <p className="text-small text-text-muted mt-1">{sub}</p>}
      </CardBody>
    </Card>
  );
}

export function StatsBar({ metrics, loading }) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardBody className="py-4">
              <div className="h-4 w-24 animate-pulse rounded bg-background-elevated mb-2" />
              <div className="h-8 w-16 animate-pulse rounded bg-background-elevated" />
            </CardBody>
          </Card>
        ))}
      </div>
    );
  }

  const m = metrics ?? {};

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
      <StatCard
        label="Total leads"
        value={m.totalLeads ?? 0}
        sub="Contacts in your pipeline"
      />
      <StatCard
        label="Won deals"
        value={m.wonDeals ?? m.activeDeals ?? 0}
        sub="Contacts closed as win"
        accent={(m.wonDeals ?? m.activeDeals ?? 0) > 0}
      />
      <StatCard
        label="Call close rate"
        value={m.callCloseRateLabel ?? '—'}
        sub={m.callCloseSub}
      />
      <StatCard
        label="Email close rate"
        value={m.emailCloseRateLabel ?? '—'}
        sub={m.emailCloseSub}
      />
      <StatCard
        label="Conversion rate"
        value={m.conversionRateLabel ?? '—'}
        sub={m.conversionSub}
      />
      <StatCard
        label="Active projects value"
        value={formatCurrency(m.activeProjectsValue ?? 0)}
        sub={
          m.wonBusinessCount
            ? `${m.wonBusinessCount} won ${m.wonBusinessCount === 1 ? 'company' : 'companies'}`
            : 'Won deal value'
        }
        accent={(m.activeProjectsValue ?? 0) > 0}
      />
    </div>
  );
}
