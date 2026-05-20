import { Check, Circle, Phone, Mail } from 'lucide-react';
import {
  CALL_OUTCOME_ACTIONS,
  EMAIL_OUTCOME_ACTIONS,
  OUTCOME_QUICK_ACTIONS,
} from '../../constants/activity';
import {
  getPlaybookState,
  presetFromStep,
  presetFromCallOutcome,
  presetFromEmailOutcome,
} from '../../lib/outreachSequence';
import { useOutreachTiming } from '../../hooks/useOutreachTiming';
import { cn } from '../../lib/cn';
import { Button } from '../ui/Button';

function TrackStepRow({
  step,
  current,
  onLogStep,
  business,
  decisionMakers,
  decisionMaker,
  timing,
}) {
  const isCurrent = current?.stage === step.stage;

  return (
    <li
      className={cn(
        'flex items-center gap-2 min-w-0 py-1 list-none',
        step.done && 'opacity-60',
        isCurrent && !step.done && 'rounded-md bg-background-elevated px-2 -mx-2',
      )}
    >
      {step.done ? (
        <Check className="h-3.5 w-3.5 text-status-interested shrink-0" aria-hidden />
      ) : (
        <Circle className="h-3.5 w-3.5 text-text-muted shrink-0" aria-hidden />
      )}
      <span
        className={cn(
          'flex-1 min-w-0 truncate text-xs',
          step.done ? 'text-text-muted line-through' : 'text-text-primary',
        )}
        title={step.label}
      >
        {step.label}
      </span>
      {!step.done && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 h-7 px-2 text-xs"
          onClick={() =>
            onLogStep?.(
              presetFromStep(step, business, decisionMakers, timing, decisionMaker),
              step,
            )
          }
        >
          Log
        </Button>
      )}
    </li>
  );
}

function TrackPanel({
  icon: Icon,
  title,
  steps,
  current,
  onLogStep,
  business,
  decisionMakers,
  decisionMaker,
  timing,
}) {
  if (!steps.length) return null;

  const done = steps.filter((s) => s.done).length;

  return (
    <div className="rounded-lg border border-border px-3 py-2">
      <div className="flex items-center justify-between gap-2 mb-1">
        <p className="text-xs font-medium text-text-secondary flex items-center gap-1.5 min-w-0">
          <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="truncate">{title}</span>
        </p>
        <span className="text-xs text-text-muted tabular-nums shrink-0">
          {done}/{steps.length}
        </span>
      </div>
      <ul className="space-y-0.5">
        {steps.map((step) => (
          <TrackStepRow
            key={step.stage}
            step={step}
            current={current}
            onLogStep={onLogStep}
            business={business}
            decisionMakers={decisionMakers}
            decisionMaker={decisionMaker}
            timing={timing}
          />
        ))}
      </ul>
    </div>
  );
}

export function OutreachPlaybook({
  business,
  decisionMakers = [],
  decisionMaker = null,
  activities = [],
  saving,
  onLogStep,
  onLogOutcome,
  onLogCallOutcome,
  onLogEmailOutcome,
  onCustomLog,
}) {
  const timing = useOutreachTiming();
  const state = getPlaybookState(
    business,
    decisionMakers,
    activities,
    timing,
    decisionMaker,
  );
  const { channels, tracks, currentSteps, engaged, allDone, completedCount, totalSteps } =
    state;

  if (!business) return null;

  const hasTracks = channels.phone || channels.email;

  return (
    <div className="rounded-xl border border-border bg-background-elevated/30 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-label uppercase text-text-muted">Outreach playbook</p>
          {decisionMaker?.name && (
            <p className="text-xs text-text-secondary truncate">
              For {decisionMaker.name}
              {decisionMakers.length > 1 ? ' — separate from other contacts' : ''}
            </p>
          )}
        </div>
        {totalSteps > 0 && (
          <span className="text-xs text-text-muted tabular-nums shrink-0">
            {completedCount}/{totalSteps}
          </span>
        )}
      </div>

      {engaged && (
        <p className="text-xs text-status-interested rounded-md bg-status-interested/10 px-2 py-1.5">
          Engaged — cold sequences paused. Log outcomes below or finish open steps.
        </p>
      )}

      {allDone && !engaged && totalSteps > 0 && (
        <p className="text-xs text-accent-secondary rounded-md bg-accent-secondary/10 px-2 py-1.5">
          Tracks complete. Log an outcome if they responded.
        </p>
      )}

      {!engaged && currentSteps.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-text-muted w-full sm:w-auto">Next up</span>
          {currentSteps.map((step) => (
            <Button
              key={step.stage}
              size="sm"
              loading={saving}
              onClick={() =>
                onLogStep?.(
                  presetFromStep(step, business, decisionMakers, timing, decisionMaker),
                  step,
                )
              }
            >
              {step.channel === 'phone' ? (
                <Phone className="h-3.5 w-3.5" />
              ) : (
                <Mail className="h-3.5 w-3.5" />
              )}
              {step.label}
            </Button>
          ))}
          <Button size="sm" variant="secondary" onClick={onCustomLog}>
            Other…
          </Button>
        </div>
      )}

      {hasTracks && (
        <div className="space-y-2">
          {channels.phone && (
            <TrackPanel
              icon={Phone}
              title="Calls"
              steps={tracks.phone.steps}
              current={tracks.phone.current}
            onLogStep={onLogStep}
            business={business}
            decisionMakers={decisionMakers}
            decisionMaker={decisionMaker}
            timing={timing}
          />
        )}
        {channels.email && (
          <TrackPanel
            icon={Mail}
            title="Emails"
            steps={tracks.email.steps}
            current={tracks.email.current}
            onLogStep={onLogStep}
            business={business}
            decisionMakers={decisionMakers}
            decisionMaker={decisionMaker}
            timing={timing}
          />
          )}
        </div>
      )}

      {!hasTracks && (
        <p className="text-xs text-text-muted">Add a phone number or email to start outreach.</p>
      )}

      {channels.phone && (
        <details className="group">
          <summary className="text-xs text-text-muted cursor-pointer list-none flex items-center gap-1 [&::-webkit-details-marker]:hidden">
            <span className="group-open:rotate-90 transition-transform inline-block">›</span>
            Call results
          </summary>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {CALL_OUTCOME_ACTIONS.map((action) => (
              <Button
                key={action.id}
                variant="secondary"
                size="sm"
                loading={saving}
                onClick={() =>
                  onLogCallOutcome?.(
                    presetFromCallOutcome(
                      action,
                      business,
                      decisionMakers,
                      timing,
                      decisionMaker,
                    ),
                    action,
                  )
                }
              >
                {action.label}
              </Button>
            ))}
          </div>
        </details>
      )}

      {channels.email && (
        <details className="group">
          <summary className="text-xs text-text-muted cursor-pointer list-none flex items-center gap-1 [&::-webkit-details-marker]:hidden">
            <span className="group-open:rotate-90 transition-transform inline-block">›</span>
            Email results
          </summary>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {EMAIL_OUTCOME_ACTIONS.map((action) => (
              <Button
                key={action.id}
                variant="secondary"
                size="sm"
                loading={saving}
                onClick={() =>
                  onLogEmailOutcome?.(
                    presetFromEmailOutcome(
                      action,
                      business,
                      decisionMakers,
                      timing,
                      decisionMaker,
                    ),
                    action,
                  )
                }
              >
                {action.label}
              </Button>
            ))}
          </div>
        </details>
      )}

      <details className="group">
        <summary className="text-xs text-text-muted cursor-pointer list-none flex items-center gap-1 [&::-webkit-details-marker]:hidden">
          <span className="group-open:rotate-90 transition-transform inline-block">›</span>
          Engagement outcomes
        </summary>
        <div className="space-y-3 mt-2">
          {channels.phone && (
            <div>
              <p className="text-xs text-text-muted mb-1.5 flex items-center gap-1">
                <Phone className="h-3 w-3" aria-hidden />
                Via call
              </p>
              <div className="flex flex-wrap gap-1.5">
                {OUTCOME_QUICK_ACTIONS.map((action) => (
                  <Button
                    key={`phone-${action.type}`}
                    variant="secondary"
                    size="sm"
                    title={action.description}
                    loading={saving}
                    onClick={() => onLogOutcome?.(action, 'phone')}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
          {channels.email && (
            <div>
              <p className="text-xs text-text-muted mb-1.5 flex items-center gap-1">
                <Mail className="h-3 w-3" aria-hidden />
                Via email
              </p>
              <div className="flex flex-wrap gap-1.5">
                {OUTCOME_QUICK_ACTIONS.map((action) => (
                  <Button
                    key={`email-${action.type}`}
                    variant="secondary"
                    size="sm"
                    title={action.description}
                    loading={saving}
                    onClick={() => onLogOutcome?.(action, 'email')}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
          {!channels.phone && !channels.email && (
            <div className="flex flex-wrap gap-1.5">
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
          )}
        </div>
      </details>
    </div>
  );
}
