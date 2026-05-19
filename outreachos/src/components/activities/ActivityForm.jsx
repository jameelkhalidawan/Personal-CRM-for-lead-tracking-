import {
  OTHER_ACTIVITY_TYPES,
  OUTCOME_ACTIVITY_TYPES_LIST,
  PLAYBOOK_ACTIVITY_TYPES,
} from '../../constants/activity';
import { Input, Select, Textarea } from '../ui/Input';
import { Button } from '../ui/Button';

export function ActivityForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  saving,
  decisionMakers = [],
  submitLabel = 'Log activity',
  stageLabel,
  isOutcome,
  outcomeHint,
}) {
  const set = (field, value) => onChange({ ...form, [field]: value });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-4 pb-24"
    >
      {stageLabel && !isOutcome && (
        <div className="rounded-lg border border-accent-primary/30 bg-accent-primary/10 px-3 py-2 text-small text-text-secondary">
          Playbook step: <span className="text-text-primary font-medium">{stageLabel}</span>
        </div>
      )}

      {isOutcome && (
        <div className="rounded-lg border border-status-interested/30 bg-status-interested/10 px-3 py-2 text-small text-text-secondary">
          <span className="text-text-primary font-medium">{stageLabel}</span>
          {outcomeHint && <span className="block mt-1 text-text-muted">{outcomeHint}</span>}
        </div>
      )}

      {!isOutcome && (
      <Select
        label="Activity type"
        required
        value={form.type}
        onChange={(e) => set('type', e.target.value)}
      >
        <optgroup label="Outreach sequence">
          {PLAYBOOK_ACTIVITY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </optgroup>
        <optgroup label="Outcomes">
          {OUTCOME_ACTIVITY_TYPES_LIST.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </optgroup>
        <optgroup label="Other">
          {OTHER_ACTIVITY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </optgroup>
      </Select>
      )}

      {decisionMakers.length > 0 && (
        <Select
          label="Contact (optional)"
          value={form.decision_maker_id}
          onChange={(e) => set('decision_maker_id', e.target.value)}
        >
          <option value="">No specific contact</option>
          {decisionMakers.map((dm) => (
            <option key={dm.id} value={dm.id}>
              {dm.name}
              {dm.role ? ` · ${dm.role}` : ''}
            </option>
          ))}
        </Select>
      )}

      <Textarea
        label={isOutcome ? 'Notes (what happened?)' : 'Notes'}
        value={form.notes}
        onChange={(e) => set('notes', e.target.value)}
        rows={isOutcome ? 5 : 4}
        placeholder={
          isOutcome
            ? 'e.g. They replied on LinkedIn, meeting Tuesday 2pm, sent $5k proposal…'
            : 'What happened? Outcomes, objections, next steps…'
        }
      />

      <Input
        label="Next follow-up"
        type="datetime-local"
        value={form.followup_at}
        onChange={(e) => set('followup_at', e.target.value)}
      />
      <p className="text-small text-text-muted -mt-2">
        Logging updates last contacted. Follow-up date updates the business (and contact if
        selected). Outcomes update pipeline status automatically.
      </p>

      <div className="fixed bottom-0 right-0 w-full max-w-[480px] border-t border-border bg-background-card p-4 flex gap-2 z-[70]">
        <Button type="button" variant="ghost" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" loading={saving}>
          {isOutcome ? `Save ${stageLabel ?? 'outcome'}` : submitLabel}
        </Button>
      </div>
    </form>
  );
}
