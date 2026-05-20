import { useEffect, useState } from 'react';
import { Building2, Pencil, Trash2 } from 'lucide-react';
import { EMAIL_ACTIVITY_TYPES, EMPTY_ACTIVITY_FORM } from '../../constants/activity';
import { getLastEmailActivityPreset } from '../../lib/duplicateEmail';
import { activityToForm } from '../../lib/activityApi';
import { formatDateTime } from '../../lib/format';
import { useActivityStore } from '../../stores/activityStore';
import { useAuthStore } from '../../stores/authStore';
import { SlidePanel } from '../ui/SlidePanel';
import { Button } from '../ui/Button';
import { MigrationHint } from '../ui/MigrationHint';
import { ActivityForm } from './ActivityForm';
import { ActivityTypeBadge } from './ActivityTypeBadge';

function DetailField({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-label uppercase text-text-muted mb-0.5">{label}</p>
      <p className="text-body text-text-primary break-words">{value}</p>
    </div>
  );
}

export function ActivityPanel({
  open,
  mode,
  businessId,
  businessName,
  business,
  activity,
  decisionMakers = [],
  activities = [],
  onClose,
  onEdit,
  onDeleteRequest,
  onOpenBusiness,
  preset,
  onSaved,
}) {
  const { saving, error, create, update, clearError } = useActivityStore();
  const user = useAuthStore((s) => s.user);
  const [form, setForm] = useState({ ...EMPTY_ACTIVITY_FORM });
  const [stageLabel, setStageLabel] = useState(null);
  const [dirty, setDirty] = useState(false);
  const isCreate = mode === 'create';
  const isEdit = mode === 'edit';
  const isView = mode === 'view';

  useEffect(() => {
    if (!open) return;
    clearError();
    if (isCreate) {
      if (preset) {
        setForm({
          ...EMPTY_ACTIVITY_FORM,
          type: preset.type ?? 'call',
          notes: preset.notes ?? '',
          followup_at: preset.followup_at ?? '',
          decision_maker_id: preset.decision_maker_id ?? '',
          outreach_channel:
            preset.outreach_channel ??
            EMPTY_ACTIVITY_FORM.outreach_channel,
          email_subject: preset.email_subject ?? '',
          email_body: preset.email_body ?? '',
          template_id: preset.template_id ?? '',
          call_template_id: preset.call_template_id ?? '',
          call_script_id: preset.call_script_id ?? '',
        });
        setStageLabel(preset.step?.label ?? preset.reason ?? null);
      } else {
        setForm({ ...EMPTY_ACTIVITY_FORM });
        setStageLabel(null);
      }
      setDirty(false);
    } else if (activity) {
      setForm(activityToForm(activity) ?? { ...EMPTY_ACTIVITY_FORM });
      setDirty(false);
    }
  }, [open, mode, activity, isCreate, preset]);

  const handleClose = () => {
    if ((isCreate || isEdit) && dirty) {
      const leave = window.confirm('You have unsaved changes. Discard them?');
      if (!leave) return;
    }
    setForm({ ...EMPTY_ACTIVITY_FORM });
    setDirty(false);
    onClose();
  };

  const handleSave = async () => {
    if (!businessId || !form.type) return;
    if (form.type === 'closed' && !form.outreach_channel) {
      window.alert('Select the winning channel (call or email) so close rates stay accurate.');
      return;
    }
    const result = isCreate
      ? await create(businessId, form)
      : await update(activity.id, businessId, form);
    if (result.ok) {
      setDirty(false);
      onSaved?.();
      onClose();
    }
  };

  const canDuplicateLastEmail =
    isCreate &&
    EMAIL_ACTIVITY_TYPES.includes(form.type) &&
    getLastEmailActivityPreset(activities, decisionMakers, business);

  const handleDuplicateLastEmail = () => {
    const presetDup = getLastEmailActivityPreset(activities, decisionMakers, business);
    if (!presetDup) return;
    setForm({ ...EMPTY_ACTIVITY_FORM, ...presetDup });
    setStageLabel(presetDup.step?.label ?? null);
    setDirty(true);
  };

  const title =
    isCreate && preset?.isOutcome
      ? `Log: ${preset.step?.label ?? 'Outcome'}`
      : isCreate
        ? 'Log activity'
        : isEdit
          ? 'Edit activity'
          : 'Activity';

  return (
    <SlidePanel open={open} onClose={handleClose} title={title} zClass="z-[60]">
      {businessName && (
        <p className="text-small text-text-muted -mt-2 mb-4">at {businessName}</p>
      )}

      {error && (isCreate || isEdit) && (
        <div className="mb-4 rounded-lg border border-priority-high/40 bg-priority-high/10 px-3 py-2 text-small text-priority-high">
          <span>{error}</span>
          <MigrationHint error={error} />
          <button
            type="button"
            onClick={clearError}
            className="mt-2 underline text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {isCreate || isEdit ? (
        <ActivityForm
          form={form}
          onChange={(f) => {
            setForm(f);
            setDirty(true);
          }}
          onPatch={
            isCreate || isEdit
              ? (patch) => {
                  setForm((f) => ({ ...f, ...patch }));
                  setDirty(true);
                }
              : undefined
          }
          onSubmit={handleSave}
          onCancel={handleClose}
          saving={saving}
          decisionMakers={decisionMakers}
          business={business}
          user={user}
          submitLabel={isCreate ? 'Log activity' : 'Save changes'}
          stageLabel={stageLabel}
          isOutcome={preset?.isOutcome}
          outcomeHint={preset?.outcomeHint}
          canDuplicateLastEmail={!!canDuplicateLastEmail}
          onDuplicateLastEmail={handleDuplicateLastEmail}
        />
      ) : isView && activity ? (
        <div className="space-y-6">
          <ActivityTypeBadge type={activity.type} />
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDeleteRequest?.(activity)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
            {businessId && onOpenBusiness && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onOpenBusiness(businessId)}
              >
                <Building2 className="h-4 w-4" />
                Open business
              </Button>
            )}
          </div>
          <DetailField
            label="When"
            value={formatDateTime(activity.created_at)}
          />
          <DetailField label="Contact" value={activity.decision_maker_name} />
          <DetailField
            label="Channel"
            value={
              activity.outreach_channel === 'phone'
                ? 'Call / phone'
                : activity.outreach_channel === 'email'
                  ? 'Email'
                  : null
            }
          />
          <DetailField label="Notes" value={activity.notes} />
          <DetailField
            label="Follow-up scheduled"
            value={formatDateTime(activity.followup_at)}
          />
        </div>
      ) : null}
    </SlidePanel>
  );
}
