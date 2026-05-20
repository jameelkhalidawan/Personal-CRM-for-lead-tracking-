import { Check, Circle, Sparkles } from 'lucide-react';
import { CALL_OUTCOME_ACTIONS, OUTCOME_QUICK_ACTIONS } from '../../constants/activity';
import { getPlaybookState, presetFromStep, presetFromCallOutcome } from '../../lib/outreachSequence';
import { cn } from '../../lib/cn';
import { Button } from '../ui/Button';
import { ActivityTypeBadge } from './ActivityTypeBadge';

export function OutreachPlaybook({
  business,
  decisionMakers = [],
  activities = [],
  saving,
  onLogStep,
  onLogOutcome,
  onLogCallOutcome,
  onCustomLog,
}) {
  const state = getPlaybookState(business, decisionMakers, activities);
  const { channels, steps, current, engaged, allDone, completedCount, totalSteps } =
    state;

  if (!business) return null;

  return (
    <div className="rounded-xl border border-border bg-background-elevated/30 p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-label uppercase text-text-muted mb-1">Outreach playbook</p>
          <p className="text-small text-text-secondary">
            {channels.phone && channels.email
              ? 'Phone first (2 calls), then email (1 cold + 2 follow-ups).'
              : channels.phone
                ? 'Phone sequence: first call, then follow-up call.'
                : channels.email
                  ? 'Email sequence: first email, then 2 follow-ups.'
                  : 'Add a phone or email to unlock the sequence.'}
          </p>
        </div>
        {totalSteps > 0 && (
          <span className="text-small text-text-muted whitespace-nowrap">
            {completedCount}/{totalSteps}
          </span>
        )}
      </div>

      {engaged && (
        <div className="rounded-lg border border-status-interested/30 bg-status-interested/10 px-3 py-2 text-small text-status-interested">
          Lead engaged — sequence paused. Log outcomes below or continue remaining steps.
        </div>
      )}

      {allDone && !engaged && totalSteps > 0 && (
        <div className="rounded-lg border border-accent-secondary/30 bg-accent-secondary/10 px-3 py-2 text-small text-accent-secondary">
          Playbook complete for this lead. Use outcomes if they replied or closed.
        </div>
      )}

      {current && (
        <div className="rounded-lg border border-accent-primary/40 bg-accent-primary/10 p-3 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent-primary shrink-0" />
            <div>
              <p className="text-small font-medium text-text-primary">Suggested next</p>
              <p className="text-small text-text-secondary">{current.label}</p>
            </div>
            </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() =>
                onLogStep?.(presetFromStep(current, business, decisionMakers), current)
              }
              loading={saving}
            >
              Log {current.label}
            </Button>
            <Button size="sm" variant="secondary" onClick={onCustomLog}>
              Other activity…
            </Button>
          </div>
        </div>
      )}

      <ul className="space-y-1.5">
        {steps.map((step) => (
          <li
            key={step.stage}
            className={cn(
              'flex items-center gap-2 rounded-md px-2 py-1.5 text-small',
              step.done && 'opacity-70',
              current?.stage === step.stage && 'bg-background-elevated',
            )}
          >
            {step.done ? (
              <Check className="h-4 w-4 text-status-interested shrink-0" />
            ) : (
              <Circle className="h-4 w-4 text-text-muted shrink-0" />
            )}
            <ActivityTypeBadge type={step.type} className="shrink-0" />
            <span className={cn('flex-1', step.done ? 'text-text-muted line-through' : 'text-text-primary')}>
              {step.label}
            </span>
            {!step.done && step.channel !== 'none' && (
              <button
                type="button"
                className="text-accent-secondary hover:underline text-xs"
                onClick={() =>
                  onLogStep?.(presetFromStep(step, business, decisionMakers), step)
                }
              >
                Log
              </button>
            )}
          </li>
        ))}
      </ul>

      {(channels.phone || current?.channel === 'phone') && (
        <div>
          <p className="text-label uppercase text-text-muted mb-2">Call results</p>
          <div className="flex flex-wrap gap-2">
            {CALL_OUTCOME_ACTIONS.map((action) => (
              <Button
                key={action.id}
                variant="secondary"
                size="sm"
                loading={saving}
                onClick={() =>
                  onLogCallOutcome?.(presetFromCallOutcome(action, business, decisionMakers), action)
                }
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-label uppercase text-text-muted mb-2">Quick outcomes</p>
        <div className="flex flex-wrap gap-2">
          {OUTCOME_QUICK_ACTIONS.map((action) => (
            <Button
              key={action.type}
              variant="secondary"
              size="sm"
              title={action.description}
              loading={saving}
              onClick={() => onLogOutcome?.(action)}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
