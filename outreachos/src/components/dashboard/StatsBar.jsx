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

export function StatsBar({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
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

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <StatCard label="Active leads" value={stats.activeLeads} sub={`${stats.total} total`} />
      <StatCard
        label="Overdue follow-ups"
        value={stats.overdue}
        accent={stats.overdue > 0}
        sub={stats.overdue > 0 ? 'Needs attention' : 'All clear'}
      />
      <StatCard label="Due today" value={stats.dueToday} sub="Scheduled for today" />
      <StatCard
        label="Pipeline value"
        value={formatCurrency(stats.pipelineValue)}
        sub="Estimated across all leads"
      />
    </div>
  );
}
