import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ExternalLink, MapPin, MessageSquare, Phone, Star, Trophy, Workflow } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { SearchInput } from '../components/ui/SearchInput';
import { SlidePanel } from '../components/ui/SlidePanel';
import { Textarea } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { formatDateTime } from '../lib/format';
import { cn } from '../lib/cn';
import { useCapturedLeadStore } from '../stores/capturedLeadStore';

const TABS = [
  { status: 'captured_processing', label: 'Processing' },
  { status: 'captured_done', label: 'Done' },
];

const ACTION_LABELS = {
  note: 'Note',
  move_to_next: 'Moved stage',
  captured: 'Captured',
  marked_done: 'Marked done',
};

function pretty(value) {
  return value || '—';
}

function CapturedLeadCard({ lead, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(lead)}
      className="w-full rounded-xl border border-border bg-background-card p-4 text-left transition-colors hover:border-border-hover hover:bg-background-elevated/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-body font-semibold text-text-primary">
            {lead.business_name}
          </h3>
          <p className="mt-1 text-small text-text-secondary">
            {pretty(lead.search_keyword)} · {pretty(lead.search_city)}
          </p>
        </div>
        {lead.status === 'captured_done' ? (
          <span className="inline-flex items-center gap-1 rounded-md border border-status-closed_won/40 bg-status-closed_won/10 px-2 py-0.5 text-small text-status-closed_won">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Done
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-md border border-accent-primary/40 bg-accent-primary/10 px-2 py-0.5 text-small text-accent-primary">
            <Trophy className="h-3.5 w-3.5" />
            Captured
          </span>
        )}
      </div>

      <div className="mt-3 space-y-1 text-small text-text-secondary">
        {lead.phone_number && (
          <p className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-text-muted" />
            {lead.phone_number}
          </p>
        )}
        {lead.address && (
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-muted" />
            <span className="line-clamp-2">{lead.address}</span>
          </p>
        )}
        {lead.website && <p className="truncate text-accent-primary">{lead.website}</p>}
        {lead.email && <p className="truncate">{lead.email}</p>}
      </div>
    </button>
  );
}

function NoteTimeline({ notes }) {
  if (!notes?.length) {
    return (
      <div className="rounded-lg border border-border bg-background-elevated/30 px-3 py-3 text-small text-text-muted">
        No notes yet.
      </div>
    );
  }

  return (
    <ol className="space-y-3">
      {notes.map((note) => (
        <li key={note.id} className="rounded-lg border border-border bg-background-elevated/30 p-3">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-border px-2 py-0.5 text-[11px] uppercase tracking-wide text-text-secondary">
              {ACTION_LABELS[note.action] ?? note.action ?? 'Note'}
            </span>
            <span className="text-small text-text-muted">
              {formatDateTime(note.created_at)}
            </span>
          </div>
          <p className="whitespace-pre-wrap text-small text-text-secondary">{note.note}</p>
        </li>
      ))}
    </ol>
  );
}

function CapturedLeadPanel({ lead, open, activeStatus, onClose }) {
  const {
    notesByLeadId,
    detailLoading,
    saving,
    loadNotes,
    markDone,
    addPlainNote,
  } = useCapturedLeadStore();
  const [note, setNote] = useState('');

  useEffect(() => {
    if (open && lead?.id) {
      loadNotes(lead.id);
      setNote('');
    }
  }, [open, lead?.id, loadNotes]);

  if (!lead) return null;

  const notes = notesByLeadId[lead.id] ?? [];
  const noteReady = note.trim().length > 0;
  const isDone = activeStatus === 'captured_done';

  const addNoteAndStayOpen = async () => {
    const result = await addPlainNote(lead, note);
    if (result.ok) setNote('');
  };

  const markDoneAndClose = async () => {
    const result = await markDone(lead, note);
    if (result.ok) {
      setNote('');
      onClose();
    }
  };

  return (
    <SlidePanel
      open={open}
      onClose={onClose}
      title={lead.business_name}
      width="w-[560px]"
    >
      <div className="space-y-5">
        <section className="space-y-2">
          <p className="text-small text-text-muted">
            {pretty(lead.search_keyword)} · {pretty(lead.search_city)}, {pretty(lead.search_state)}
          </p>
          <div className="grid gap-2 text-small text-text-secondary">
            <p><span className="text-text-muted">Email:</span> {pretty(lead.email)}</p>
            <p><span className="text-text-muted">Phone:</span> {pretty(lead.phone_number)}</p>
            <p><span className="text-text-muted">Website:</span> {pretty(lead.website)}</p>
            <p><span className="text-text-muted">Address:</span> {pretty(lead.address)}</p>
            <p><span className="text-text-muted">Area served:</span> {pretty(lead.area_served)}</p>
            <p>
              <span className="text-text-muted">Rating:</span>{' '}
              {lead.rating != null ? `${lead.rating} (${lead.total_reviews ?? 0} reviews)` : '—'}
            </p>
          </div>
          {lead.website && (
            <a
              href={lead.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-small text-accent-primary hover:underline"
            >
              Open website
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-subtitle font-semibold text-text-primary">Full note history</h3>
            {detailLoading && <LoadingSpinner size="sm" />}
          </div>
          <NoteTimeline notes={notes} />
        </section>

        <section className="space-y-3">
          <Textarea
            label={isDone ? 'Add reference note' : 'Completion note'}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              isDone
                ? 'Add an extra note without changing status...'
                : 'Required: what happened before marking done?'
            }
          />

          {isDone ? (
            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-background-elevated/40 px-3 py-2 text-small text-text-muted">
                Done is terminal. You can still add notes, but the status will not change.
              </div>
              <Button
                variant="secondary"
                loading={saving}
                disabled={!noteReady}
                onClick={addNoteAndStayOpen}
              >
                <MessageSquare className="h-4 w-4" />
                Add note
              </Button>
            </div>
          ) : (
            <Button loading={saving} disabled={!noteReady} onClick={markDoneAndClose}>
              <CheckCircle2 className="h-4 w-4" />
              Mark Done
            </Button>
          )}
        </section>
      </div>
    </SlidePanel>
  );
}

export function CapturedLeadsPage() {
  const navigate = useNavigate();
  const {
    loading,
    error,
    success,
    search,
    setSearch,
    getLeadsByStatus,
    getCounts,
    loadLeads,
    subscribeRealtime,
    unsubscribeRealtime,
    clearMessage,
  } = useCapturedLeadStore();
  const [activeStatus, setActiveStatus] = useState('captured_processing');
  const [panelLead, setPanelLead] = useState(null);

  useEffect(() => {
    loadLeads();
    subscribeRealtime();
    return () => unsubscribeRealtime();
  }, [loadLeads, subscribeRealtime, unsubscribeRealtime]);

  const counts = getCounts();
  const leads = getLeadsByStatus(activeStatus);

  return (
    <>
      <PageHeader
        title="Captured Leads"
        description="Track scraped leads that converted out of the call funnel, then mark them done when the handoff is complete."
        actions={
          <Button variant="secondary" onClick={() => navigate('/scrape-leads-processing')}>
            <Workflow className="h-4 w-4" />
            Processing
          </Button>
        }
      />

      {error && (
        <div className="mb-4 rounded-lg border border-priority-high/40 bg-priority-high/10 px-4 py-3 text-small text-priority-high flex justify-between gap-4">
          <span>{error}</span>
          <button type="button" onClick={clearMessage} className="underline">
            Dismiss
          </button>
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-status-closed_won/40 bg-status-closed_won/10 px-4 py-3 text-small text-status-closed_won flex justify-between gap-4">
          <span>{success}</span>
          <button type="button" onClick={clearMessage} className="underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        {TABS.map((tab) => (
          <Button
            key={tab.status}
            variant={activeStatus === tab.status ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveStatus(tab.status)}
          >
            {tab.label}
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[11px]',
                activeStatus === tab.status
                  ? 'bg-white/20 text-white'
                  : 'bg-background-card text-text-secondary',
              )}
            >
              {counts[tab.status] ?? 0}
            </span>
          </Button>
        ))}
        <div className="ml-auto min-w-[220px] max-w-md flex-1">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search captured leads..."
          />
        </div>
      </div>

      {loading ? (
        <Card>
          <CardBody className="flex items-center justify-center py-16">
            <LoadingSpinner />
          </CardBody>
        </Card>
      ) : leads.length === 0 ? (
        <Card>
          <EmptyState
            icon={activeStatus === 'captured_done' ? CheckCircle2 : Trophy}
            title={`No captured leads in ${TABS.find((t) => t.status === activeStatus)?.label}`}
            description={
              search.trim()
                ? 'Try a different search.'
                : 'Captured leads will appear here after you capture them from Scrape Processing.'
            }
          />
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {leads.map((lead) => (
            <CapturedLeadCard key={lead.id} lead={lead} onClick={setPanelLead} />
          ))}
        </div>
      )}

      <CapturedLeadPanel
        open={!!panelLead}
        lead={panelLead}
        activeStatus={activeStatus}
        onClose={() => setPanelLead(null)}
      />
    </>
  );
}
