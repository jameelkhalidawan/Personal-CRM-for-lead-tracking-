import { useEffect, useMemo, useState } from 'react';
import { ArchiveX, Copy, ExternalLink, MapPin, MessageSquare, Phone, Star, Target } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { SearchInput } from '../components/ui/SearchInput';
import { SlidePanel } from '../components/ui/SlidePanel';
import { Input, Select, Textarea } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { formatDateTime } from '../lib/format';
import { cn } from '../lib/cn';
import { buildTemplateContext, renderTemplate } from '../lib/templateRender';
import { useAuthStore } from '../stores/authStore';
import { useCallTemplateStore } from '../stores/callTemplateStore';
import { useScrapedLeadStore } from '../stores/scrapedLeadStore';

const STAGES = [
  { status: 'fresh', label: 'Fresh' },
  { status: 'followup_1', label: 'Follow-up 1' },
  { status: 'followup_2', label: 'Follow-up 2' },
  { status: 'discard', label: 'Discard' },
];

const NEXT_LABELS = {
  fresh: 'Move to Follow-up 1',
  followup_1: 'Move to Follow-up 2',
  followup_2: 'Move to Discard',
};

const ACTION_LABELS = {
  note: 'Note',
  move_to_next: 'Moved stage',
  captured: 'Captured',
  marked_done: 'Marked done',
};

function pretty(value) {
  return value || '—';
}

function LeadCard({ lead, onClick }) {
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
        {lead.rating != null && (
          <span className="inline-flex items-center gap-1 rounded-md border border-priority-medium/40 bg-priority-medium/10 px-2 py-0.5 text-small text-priority-medium">
            <Star className="h-3.5 w-3.5" />
            {lead.rating}
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
        {lead.website && (
          <p className="truncate text-accent-primary">{lead.website}</p>
        )}
        {lead.email && <p className="truncate">{lead.email}</p>}
      </div>
    </button>
  );
}

function NoteTimeline({ notes }) {
  if (!notes?.length) {
    return (
      <div className="rounded-lg border border-border bg-background-elevated/30 px-3 py-3 text-small text-text-muted">
        No notes yet. The first stage action will create the call record.
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
          {note.created_by && (
            <p className="mt-2 text-[11px] text-text-muted">
              User: {String(note.created_by).slice(0, 8)}…
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}

function leadToTemplateBusiness(lead) {
  return {
    business_name: lead.business_name ?? '',
    niche: lead.area_served || lead.search_keyword || '',
    business_email: lead.email ?? '',
    website_url: lead.website ?? '',
    phone_number: lead.phone_number ?? '',
    city: lead.search_city ?? '',
    lead_source: lead.search_keyword ? `Google Maps: ${lead.search_keyword}` : 'Google Maps',
  };
}

function CallScriptReader({ lead, contactName }) {
  const user = useAuthStore((s) => s.user);
  const { templates, loadAll, subscribeRealtime, unsubscribeRealtime } = useCallTemplateStore();
  const [templateId, setTemplateId] = useState('');

  useEffect(() => {
    loadAll();
    subscribeRealtime();
    return () => unsubscribeRealtime();
  }, [loadAll, subscribeRealtime, unsubscribeRealtime]);

  const selectedTemplate = templates.find((template) => template.id === templateId);
  const scripts = selectedTemplate?.scripts ?? [];

  const context = buildTemplateContext({
    business: leadToTemplateBusiness(lead),
    decisionMaker: {
      name: contactName,
      email: lead.email ?? '',
      phone_number: lead.phone_number ?? '',
      role: '',
    },
    user,
  });

  const renderedSections = scripts.map((script) => ({
    ...script,
    renderedBody: renderTemplate(script.body, context),
  }));
  const renderedFullScript = renderedSections
    .map((script) => `${script.label}\n\n${script.renderedBody}`)
    .join('\n\n');

  const copyScript = async () => {
    if (!renderedFullScript) return;
    await navigator.clipboard?.writeText(renderedFullScript);
  };

  return (
    <section className="rounded-xl border border-accent-primary/30 bg-accent-primary/10 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Phone className="h-4 w-4 text-accent-primary" />
        <div>
          <h3 className="text-small font-medium text-text-primary">Call script</h3>
          <p className="text-small text-text-muted">
            Shows your saved script exactly as written, with placeholders filled.
          </p>
        </div>
      </div>

      <Select
        label="Choose script template"
        value={templateId}
        onChange={(e) => setTemplateId(e.target.value)}
      >
        <option value="">- Select a template -</option>
        {templates.map((template) => (
          <option key={template.id} value={template.id}>
            {template.name}
            {template.category ? ` (${template.category})` : ''}
          </option>
        ))}
      </Select>

      {renderedSections.length > 0 ? (
        <div>
          <div className="mb-1 flex items-center justify-between gap-2">
            <p className="text-label uppercase text-text-muted">Full script ready to read</p>
            <Button type="button" variant="ghost" size="sm" onClick={copyScript}>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </Button>
          </div>
          <div className="max-h-80 space-y-3 overflow-y-auto rounded-lg border border-border bg-background-card p-3">
            {renderedSections.map((script) => (
              <section key={script.id} className="space-y-2">
                <h4 className="text-label uppercase text-accent-primary">
                  {script.label}
                </h4>
                <pre className="whitespace-pre-wrap font-sans text-small text-text-primary">
                  {script.renderedBody || '-'}
                </pre>
              </section>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-background-card px-3 py-3 text-small text-text-muted">
          Select a call template to show the full saved script for this lead.
        </div>
      )}

      <div className="rounded-lg border border-border/70 bg-background-card/60 px-3 py-2 text-small text-text-muted">
        Available placeholders include {'{{contact_name}}'}, {'{{business_name}}'}, {'{{niche}}'}, and {'{{your_name}}'}.
      </div>
    </section>
  );
}

function LeadDetailPanel({ lead, open, activeStage, onClose }) {
  const {
    notesByLeadId,
    detailLoading,
    saving,
    loadNotes,
    moveToNext,
    captureLead,
    addPlainNote,
  } = useScrapedLeadStore();
  const [note, setNote] = useState('');
  const [contactName, setContactName] = useState('');

  useEffect(() => {
    if (open && lead?.id) {
      loadNotes(lead.id);
      setNote('');
      setContactName('');
    }
  }, [open, lead?.id, loadNotes]);

  if (!lead) return null;

  const notes = notesByLeadId[lead.id] ?? [];
  const noteReady = note.trim().length > 0;
  const isDiscard = activeStage === 'discard';

  const closeIfOk = async (runner) => {
    const result = await runner();
    if (result.ok) {
      setNote('');
      onClose();
    }
  };

  const addNoteAndStayOpen = async () => {
    const result = await addPlainNote(lead, note);
    if (result.ok) setNote('');
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

        <section className="space-y-3">
          <Input
            label="Contact name for script"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Owner, manager, or decision maker name"
          />
          <CallScriptReader lead={lead} contactName={contactName} />
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-subtitle font-semibold text-text-primary">Notes</h3>
            {detailLoading && <LoadingSpinner size="sm" />}
          </div>
          <NoteTimeline notes={notes} />
        </section>

        <section className="space-y-3">
          <Textarea
            label={isDiscard ? 'Add reference note' : 'Call note'}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              isDiscard
                ? 'Add a note for future reference...'
                : 'Required: what happened on the call?'
            }
          />

          {isDiscard ? (
            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-background-elevated/40 px-3 py-2 text-small text-text-muted">
                Discard is terminal. You can still add notes, but stage actions are disabled.
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
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                loading={saving}
                disabled={!noteReady}
                onClick={() => closeIfOk(() => moveToNext(lead, note))}
              >
                {NEXT_LABELS[activeStage] ?? 'Move to next'}
              </Button>
              <Button
                loading={saving}
                disabled={!noteReady}
                onClick={() => closeIfOk(() => captureLead(lead, note))}
              >
                Captured
              </Button>
            </div>
          )}
        </section>
      </div>
    </SlidePanel>
  );
}

export function ScrapeLeadsProcessingPage() {
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
  } = useScrapedLeadStore();
  const [activeStage, setActiveStage] = useState('fresh');
  const [panelLead, setPanelLead] = useState(null);

  useEffect(() => {
    loadLeads();
    subscribeRealtime();
    return () => unsubscribeRealtime();
  }, [loadLeads, subscribeRealtime, unsubscribeRealtime]);

  const counts = getCounts();
  const leads = getLeadsByStatus(activeStage);

  return (
    <>
      <PageHeader
        title="Scrape Leads Processing"
        description="Work scraped leads from Fresh through follow-ups, discard, or capture them into the captured pipeline."
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
        {STAGES.map((stage) => (
          <Button
            key={stage.status}
            variant={activeStage === stage.status ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveStage(stage.status)}
          >
            {stage.label}
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[11px]',
                activeStage === stage.status
                  ? 'bg-white/20 text-white'
                  : 'bg-background-card text-text-secondary',
              )}
            >
              {counts[stage.status] ?? 0}
            </span>
          </Button>
        ))}
        <div className="ml-auto min-w-[220px] max-w-md flex-1">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search business, city, keyword..."
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
            icon={activeStage === 'discard' ? ArchiveX : Target}
            title={`No leads in ${STAGES.find((s) => s.status === activeStage)?.label}`}
            description={
              search.trim()
                ? 'Try a different search.'
                : 'Leads will appear here as they move through the scraped lead pipeline.'
            }
          />
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onClick={setPanelLead} />
          ))}
        </div>
      )}

      <LeadDetailPanel
        open={!!panelLead}
        lead={panelLead}
        activeStage={activeStage}
        onClose={() => setPanelLead(null)}
      />
    </>
  );
}
