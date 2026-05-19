import { useEffect, useState } from 'react';
import { Building2, Pencil, Trash2 } from 'lucide-react';
import { EMPTY_ACTIVITY_FORM } from '../../constants/activity';
import { activityToForm } from '../../lib/activityApi';
import { formatDateTime } from '../../lib/format';
import { useActivityStore } from '../../stores/activityStore';
import { SlidePanel } from '../ui/SlidePanel';
import { Button } from '../ui/Button';
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
  activity,
  decisionMakers = [],
  onClose,
  onEdit,
  onDeleteRequest,
  onOpenBusiness,
  preset,
}) {
  const { saving, create, update } = useActivityStore();
  const [form, setForm] = useState({ ...EMPTY_ACTIVITY_FORM });
  const [stageLabel, setStageLabel] = useState(null);
  const [dirty, setDirty] = useState(false);
  const isCreate = mode === 'create';
  const isEdit = mode === 'edit';
  const isView = mode === 'view';

  useEffect(() => {
    if (!open) return;
    if (isCreate) {
      if (preset) {
        setForm({
          ...EMPTY_ACTIVITY_FORM,
          type: preset.type ?? 'call',
          notes: preset.notes ?? '',
          followup_at: preset.followup_at ?? '',
          decision_maker_id: preset.decision_maker_id ?? '',
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
    const result = isCreate
      ? await create(businessId, form)
      : await update(activity.id, businessId, form);
    if (result.ok) {
      setDirty(false);
      onClose();
    }
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

      {isCreate || isEdit ? (
        <ActivityForm
          form={form}
          onChange={(f) => {
            setForm(f);
            setDirty(true);
          }}
          onSubmit={handleSave}
          onCancel={handleClose}
          saving={saving}
          decisionMakers={decisionMakers}
          submitLabel={isCreate ? 'Log activity' : 'Save changes'}
          stageLabel={stageLabel}
          isOutcome={preset?.isOutcome}
          outcomeHint={preset?.outcomeHint}
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
