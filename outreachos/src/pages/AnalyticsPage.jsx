import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import {
  ActivityBreakdownChart,
  AnalyticsSection,
  AnalyticsTable,
  BarChartRows,
  ContactWorkloadGrid,
  ConversionBadge,
  DonutStat,
  FunnelChart,
  MonthlyChart,
  OverviewHero,
  PipelineSnapshotChart,
  QuickInsightCards,
  RateBar,
  SummaryMetric,
} from '../components/analytics/AnalyticsSection';
import { formatCurrency } from '../lib/format';
import { computeFullAnalyticsReport } from '../lib/analyticsReport';
import { useBusinessStore } from '../stores/businessStore';
import { useActivityStore } from '../stores/activityStore';
import { fetchDecisionMakersForBusinesses } from '../lib/decisionMakerApi';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export function AnalyticsPage() {
  const {
    businesses,
    loading: businessesLoading,
    loadBusinesses,
    subscribeRealtime,
    unsubscribeRealtime,
  } = useBusinessStore();
  const { items: activities, loadAll: loadActivities, loading: activitiesLoading } =
    useActivityStore();
  const [dmsByBusiness, setDmsByBusiness] = useState({});

  useEffect(() => {
    loadBusinesses();
    loadActivities();
    subscribeRealtime();
    return () => unsubscribeRealtime();
  }, [loadBusinesses, loadActivities, subscribeRealtime, unsubscribeRealtime]);

  const businessIds = useMemo(() => businesses.map((b) => b.id), [businesses]);

  useEffect(() => {
    if (!businessIds.length) {
      setDmsByBusiness({});
      return;
    }
    fetchDecisionMakersForBusinesses(businessIds)
      .then(setDmsByBusiness)
      .catch(() => setDmsByBusiness({}));
  }, [businessIds.join(',')]);

  const report = useMemo(
    () => computeFullAnalyticsReport(businesses, dmsByBusiness, activities),
    [businesses, dmsByBusiness, activities],
  );

  const loading = businessesLoading || activitiesLoading;
  const {
    summary,
    funnel,
    funnelInsights,
    topNiches,
    niches,
    followUpTouches,
    followUpDelays,
    monthlyActivity,
    activityBreakdown,
    contactWorkload,
    pipelineSnapshot,
  } = report;

  const maxFollowUpReplies = Math.max(...followUpTouches.map((r) => r.replies), 1);
  const outreachStarted = funnel.find((f) => f.stage === 'First message sent')?.count ?? 0;
  const repliesCount = funnel.find((f) => f.stage === 'Replies received')?.count ?? 0;
  const closedCount = funnel.find((f) => f.stage === 'Deals closed')?.count ?? 0;

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Funnel, niche performance, follow-up impact, and revenue — per contact lead."
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-small text-text-muted">Crunching your pipeline data…</p>
        </div>
      ) : (
        <div className="max-w-6xl">
          <OverviewHero summary={summary} formatCurrency={formatCurrency} />

          <QuickInsightCards funnelInsights={funnelInsights} topNiches={topNiches} />

          <section className="mb-8">
            <h2 className="text-h3 text-text-primary mb-1">Overview</h2>
            <p className="text-small text-text-muted mb-4">
              Headline numbers across all contacts and companies.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
              <SummaryMetric
                index={0}
                label="Total leads"
                value={summary.totalLeads}
                sub="Decision makers in CRM"
              />
              <SummaryMetric
                index={1}
                label="Active deals"
                value={summary.activeDeals}
                sub="Open companies in pipeline"
              />
              <SummaryMetric
                index={2}
                label="Monthly closes"
                value={summary.monthlyCloses}
                sub="Closed this calendar month"
              />
              <SummaryMetric
                index={3}
                label="Revenue"
                value={formatCurrency(summary.revenue)}
                sub="Total closed-won value"
              />
              <SummaryMetric
                index={4}
                label="Reply rate"
                value={summary.replyRateLabel}
                sub="Replies after first outreach"
              />
              <SummaryMetric
                index={5}
                label="Close rate"
                value={summary.closeRateLabel}
                sub="Deals closed per lead"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <DonutStat
                label="Outreach started"
                value={outreachStarted}
                total={summary.totalLeads || 1}
                strokeColor="#818cf8"
              />
              <DonutStat
                label="Got replies"
                value={repliesCount}
                total={outreachStarted || 1}
                strokeColor="#4ade80"
              />
              <DonutStat
                label="Deals closed"
                value={closedCount}
                total={summary.totalLeads || 1}
                strokeColor="#facc15"
              />
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2 mb-6">
            <AnalyticsSection
              icon="overview"
              title="Activity breakdown"
              description="What you logged — last 7 days vs all time."
              className="mb-0"
            >
              <ActivityBreakdownChart rows={activityBreakdown} />
            </AnalyticsSection>

            <AnalyticsSection
              icon="funnel"
              title="Pipeline snapshot"
              description="Companies by current status."
              className="mb-0"
            >
              <PipelineSnapshotChart rows={pipelineSnapshot} />
            </AnalyticsSection>
          </div>

          <AnalyticsSection
            icon="overview"
            title="Contact workload"
            description="Where each lead sits in your outreach process right now."
          >
            <ContactWorkloadGrid rows={contactWorkload} />
          </AnalyticsSection>

          <AnalyticsSection
            icon="funnel"
            title="Core funnel"
            description="Main conversion funnel per contact. Each stage shows count and conversion from the previous step."
            insight="Low replies → fix pitch. High replies, low calls → improve conversations. Proposals but no closes → offer or trust."
          >
            <div className="grid gap-6 xl:grid-cols-2">
              <FunnelChart rows={funnel} />
              <AnalyticsTable
                columns={[
                  { key: 'stage', label: 'Stage' },
                  { key: 'count', label: 'Count', align: 'right' },
                  {
                    key: 'conversionLabel',
                    label: 'Conversion',
                    align: 'right',
                    render: (row) => <ConversionBadge value={row.conversionLabel} />,
                  },
                ]}
                rows={funnel}
              />
            </div>
          </AnalyticsSection>

          <AnalyticsSection
            icon="niche"
            title="Niche conversion"
            description="Compare industries — double down on niches with strong reply and close rates."
          >
            <AnalyticsTable
              columns={[
                {
                  key: 'niche',
                  label: 'Niche',
                  render: (row) => (
                    <span className="font-medium text-text-primary">{row.niche}</span>
                  ),
                },
                { key: 'leads', label: 'Leads', align: 'right' },
                {
                  key: 'replyRate',
                  label: 'Reply rate',
                  align: 'right',
                  render: (row) => <RateBar value={row.replyRate} />,
                },
                {
                  key: 'closeRate',
                  label: 'Close rate',
                  align: 'right',
                  render: (row) => <RateBar value={row.closeRate} />,
                },
                {
                  key: 'avgDealSize',
                  label: 'Avg deal',
                  align: 'right',
                  render: (row) => (
                    <span className="font-medium">
                      {row.avgDealSize != null ? formatCurrency(row.avgDealSize) : '—'}
                    </span>
                  ),
                },
              ]}
              rows={niches}
              emptyMessage="Add a niche on each business to unlock industry breakdown."
            />
          </AnalyticsSection>

          <div className="grid gap-6 lg:grid-cols-2">
            <AnalyticsSection
              icon="followUp"
              title="Follow-up touches"
              description="Which message touch produced a reply."
              className="mb-0 h-full"
            >
              <BarChartRows
                rows={followUpTouches}
                valueKey="replies"
                labelKey="touch"
                max={maxFollowUpReplies}
                colorClass="bg-accent-secondary"
              />
              <div className="mt-4 pt-4 border-t border-border">
                <AnalyticsTable
                  columns={[
                    { key: 'touch', label: 'Touch' },
                    { key: 'replies', label: 'Replies', align: 'right' },
                  ]}
                  rows={followUpTouches}
                  emptyMessage="Log outreach and mark replies to see data."
                />
              </div>
            </AnalyticsSection>

            <AnalyticsSection
              icon="delay"
              title="Delay after last contact"
              description="Wait time between last outreach and reply, then conversion to call or close."
              className="mb-0 h-full"
            >
              <AnalyticsTable
                columns={[
                  { key: 'delay', label: 'Delay' },
                  { key: 'total', label: 'Replies', align: 'right' },
                  {
                    key: 'conversionLabel',
                    label: '→ Call / close',
                    align: 'right',
                    render: (row) => <ConversionBadge value={row.conversionLabel} />,
                  },
                ]}
                rows={followUpDelays}
                emptyMessage="Log timed outreach before replies to see delay impact."
              />
            </AnalyticsSection>
          </div>

          <AnalyticsSection
            icon="time"
            title="Time vs activity & revenue"
            description="Six-month view of outreach effort, outcomes, and closed revenue."
          >
            <MonthlyChart rows={monthlyActivity} />
            <div className="mt-6 pt-6 border-t border-border">
              <AnalyticsTable
                columns={[
                  { key: 'label', label: 'Month' },
                  { key: 'outreach', label: 'Outreach', align: 'right' },
                  { key: 'outcomes', label: 'Outcomes', align: 'right' },
                  { key: 'closes', label: 'Closes', align: 'right' },
                  {
                    key: 'revenue',
                    label: 'Revenue',
                    align: 'right',
                    render: (row) => (
                      <span className="font-medium text-status-closed_won">
                        {formatCurrency(row.revenue)}
                      </span>
                    ),
                  },
                ]}
                rows={monthlyActivity}
              />
            </div>
          </AnalyticsSection>
        </div>
      )}
    </>
  );
}
