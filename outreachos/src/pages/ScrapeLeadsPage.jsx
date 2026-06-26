import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, History, Radar, Search } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { TableSkeleton } from '../components/ui/TableSkeleton';
import { cn } from '../lib/cn';
import { useScrapeJobStore } from '../stores/scrapeJobStore';

const JOB_STATUS_STYLES = {
  queued: 'bg-text-muted/15 text-text-secondary border-text-muted/40',
  running: 'bg-accent-primary/20 text-accent-primary border-accent-primary/40',
  completed: 'bg-status-closed_won/20 text-status-closed_won border-status-closed_won/40',
  failed: 'bg-priority-high/15 text-priority-high border-priority-high/40',
};

function JobStatusBadge({ status }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-small font-medium capitalize',
        JOB_STATUS_STYLES[status] ?? JOB_STATUS_STYLES.queued,
      )}
    >
      {status}
    </span>
  );
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function ProgressLine({ progress }) {
  if (!progress) return null;
  const stats = [
    { label: 'Found', value: progress.found },
    { label: 'Opened', value: progress.processed },
    { label: 'Saved', value: progress.inserted },
    { label: 'Duplicates', value: progress.duplicates },
  ].filter((item) => item.value != null);

  return (
    <div className="rounded-lg border border-accent-primary/30 bg-accent-primary/10 px-4 py-3">
      <p className="text-small font-medium text-accent-primary">
        {progress.message ?? 'Scraping...'}
      </p>
      {stats.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-md border border-border/70 bg-background-card/70 px-3 py-2"
            >
              <p className="text-[10px] uppercase tracking-wide text-text-muted">
                {item.label}
              </p>
              <p className="text-lg font-semibold text-text-primary">{item.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ScrapeLeadsPage() {
  const {
    jobs,
    loading,
    running,
    error,
    success,
    progress,
    loadJobs,
    subscribeRealtime,
    unsubscribeRealtime,
    startScrape,
    clearMessage,
  } = useScrapeJobStore();

  const [form, setForm] = useState({
    keyword: '',
    city: '',
    state: '',
    maxResults: '30',
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    loadJobs();
    subscribeRealtime();
    return () => unsubscribeRealtime();
  }, [loadJobs, subscribeRealtime, unsubscribeRealtime]);

  const trimmed = {
    keyword: form.keyword.trim(),
    city: form.city.trim(),
    state: form.state.trim(),
  };
  const maxResults = Number(form.maxResults);

  const queryPreview = useMemo(() => {
    if (!trimmed.keyword && !trimmed.city && !trimmed.state) {
      return 'Enter a keyword, city, and state to preview the search.';
    }
    return `Will search: ${trimmed.keyword || '[keyword]'} in ${trimmed.city || '[city]'}, ${trimmed.state || '[state]'}`;
  }, [trimmed.keyword, trimmed.city, trimmed.state]);

  const formValid = Boolean(
    trimmed.keyword &&
      trimmed.city &&
      trimmed.state &&
      Number.isInteger(maxResults) &&
      maxResults >= 1 &&
      maxResults <= 100,
  );

  const setField = (key, value) => {
    clearMessage();
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleStart = async () => {
    setSubmitted(true);
    if (!formValid || running) return;
    await startScrape({ ...trimmed, maxResults });
  };

  return (
    <>
      <PageHeader
        title="Scrape Leads"
        description="Run a Google Maps search and send newly discovered businesses into the Fresh lead queue."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,520px)_1fr]">
        <section className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-primary/15 text-accent-primary">
                  <Radar className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-subtitle font-semibold text-text-primary">
                    Start a scrape
                  </h2>
                  <p className="text-small text-text-secondary">
                    Example: dentist in Dallas, Texas
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Keyword"
                  value={form.keyword}
                  onChange={(e) => setField('keyword', e.target.value)}
                  placeholder="dentist"
                  required
                  className="sm:col-span-2"
                />
                <Input
                  label="City"
                  value={form.city}
                  onChange={(e) => setField('city', e.target.value)}
                  placeholder="Dallas"
                  required
                />
                <Input
                  label="State"
                  value={form.state}
                  onChange={(e) => setField('state', e.target.value)}
                  placeholder="Texas"
                  required
                />
                <Input
                  label="Max leads"
                  type="number"
                  min="1"
                  max="100"
                  value={form.maxResults}
                  onChange={(e) => setField('maxResults', e.target.value)}
                  required
                  className="sm:col-span-2"
                />
              </div>

              <div className="rounded-lg border border-border bg-background-elevated px-4 py-3 text-small text-text-secondary">
                {queryPreview}
              </div>

              {submitted && !formValid && (
                <div className="rounded-lg border border-priority-high/40 bg-priority-high/10 px-4 py-3 text-small text-priority-high">
                  Keyword, city, state, and a max lead count from 1 to 100 are required.
                </div>
              )}

              {error && (
                <div className="rounded-lg border border-priority-high/40 bg-priority-high/10 px-4 py-3 text-small text-priority-high flex justify-between gap-4">
                  <span>{error}</span>
                  <button type="button" onClick={clearMessage} className="underline">
                    Dismiss
                  </button>
                </div>
              )}

              {success && (
                <div className="rounded-lg border border-status-closed_won/40 bg-status-closed_won/10 px-4 py-3 text-small text-status-closed_won flex justify-between gap-4">
                  <span>{success}</span>
                  <button type="button" onClick={clearMessage} className="underline">
                    Dismiss
                  </button>
                </div>
              )}

              <ProgressLine progress={progress} />

              <Button
                onClick={handleStart}
                loading={running}
                disabled={running || !formValid}
                className="w-full"
              >
                <Search className="h-4 w-4" />
                {running ? 'Scraping...' : 'Start scraping'}
              </Button>

              <p className="text-small text-text-muted">
                Only one scrape can run at a time. Google may occasionally block direct scraping;
                if that happens, the job will be marked failed instead of crashing the app. Max
                leads controls how many Google Maps listings the scraper will try to open.
              </p>
            </CardBody>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-subtitle font-semibold text-text-primary">
                    Job history
                  </h2>
                  <p className="text-small text-text-secondary">
                    Latest 50 scrape runs from Supabase.
                  </p>
                </div>
                <History className="h-5 w-5 text-text-muted" />
              </div>
            </CardHeader>
            <CardBody className="p-0">
              {loading ? (
                <div className="p-6">
                  <TableSkeleton rows={6} cols={5} />
                </div>
              ) : jobs.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    icon={History}
                    title="No scrape jobs yet"
                    description="Run your first search to start filling the Fresh lead queue."
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-background-elevated/40">
                      <tr>
                        <th className="px-4 py-3 text-left text-label uppercase text-text-muted">
                          Search
                        </th>
                        <th className="px-4 py-3 text-left text-label uppercase text-text-muted">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-label uppercase text-text-muted">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-label uppercase text-text-muted">
                          Results
                        </th>
                        <th className="px-4 py-3 text-right text-label uppercase text-text-muted">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {jobs.map((job) => (
                        <tr key={job.id} className="hover:bg-background-elevated/30">
                          <td className="px-4 py-3">
                            <p className="text-body font-medium text-text-primary">
                              {job.keyword}
                            </p>
                            <p className="text-small text-text-secondary">
                              {job.city}, {job.state}
                            </p>
                            {job.error_message && (
                              <p className="mt-1 max-w-[320px] text-small text-priority-high">
                                {job.error_message}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-small text-text-secondary">
                            {formatDate(job.created_at)}
                          </td>
                          <td className="px-4 py-3">
                            <JobStatusBadge status={job.status} />
                          </td>
                          <td className="px-4 py-3 text-body text-text-primary">
                            {job.results_count ?? 0}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled
                              title="Scrape Leads Processing is added in Phase 15."
                            >
                              View results
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>
        </section>
      </div>
    </>
  );
}
