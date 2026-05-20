import { Activity, Pencil, Trash2, UserPlus } from 'lucide-react';
import { ActivityPanel } from '../activities/ActivityPanel';
import { ActivityTimeline } from '../activities/ActivityTimeline';
import { OutreachPlaybook } from '../activities/OutreachPlaybook';
import { getSuggestedPreset, presetFromOutcome } from '../../lib/outreachSequence';
import { DecisionMakerPanel } from '../decisionMakers/DecisionMakerPanel';
import { PreferredContactIcon } from '../decisionMakers/PreferredContactIcon';
import { useDecisionMakerStore } from '../../stores/decisionMakerStore';
import { useActivityStore } from '../../stores/activityStore';
import { Modal } from '../ui/Modal';
import { formatCurrency, formatDateTime } from '../../lib/format';
import { useBusinessStore } from '../../stores/businessStore';
import { SlidePanel } from '../ui/SlidePanel';
import { Button } from '../ui/Button';
import { StatusBadge, PriorityBadge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import {
  BusinessForm,
  businessToForm,
  formToPayload,
} from './BusinessForm';
import { useEffect, useState } from 'react';
import { EMPTY_BUSINESS_FORM } from '../../constants/business';

function DetailField({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-label uppercase text-text-muted mb-0.5">{label}</p>
      <p className="text-body text-text-primary break-words">{value}</p>
    </div>
  );
}

export function BusinessDetailPanel({
  open,
  businessId,
  mode,
  onClose,
  onEdit,
  onCancelEdit,
  onDeleteRequest,
}) {
  const {
    detail,
    detailLoading,
    services,
    saving,
    updateBusiness,
    clearError,
    loadBusinessDetail,
  } = useBusinessStore();
  const { remove: removeDecisionMaker } = useDecisionMakerStore();
  const { remove: removeActivity, saving: activitySaving } = useActivityStore();
  const [form, setForm] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [dmPanel, setDmPanel] = useState(null);
  const [dmDelete, setDmDelete] = useState(null);
  const [activityPanel, setActivityPanel] = useState(null);
  const [activityDelete, setActivityDelete] = useState(null);

  useEffect(() => {
    if (open && businessId && (mode === 'view' || mode === 'edit')) {
      loadBusinessDetail(businessId);
    }
  }, [open, businessId, mode, loadBusinessDetail]);

  const business =
    businessId && detail?.business?.id === businessId ? detail.business : null;
  const isEdit = mode === 'edit';

  const startEdit = () => {
    if (!business) return;
    setForm(businessToForm(business));
    setDirty(false);
    onEdit();
  };

  const handleClose = () => {
    if (isEdit && dirty) {
      const leave = window.confirm('You have unsaved changes. Discard them?');
      if (!leave) return;
    }
    setForm(null);
    setDirty(false);
    clearError();
    onClose();
  };

  const handleCancelEdit = () => {
    if (dirty) {
      const leave = window.confirm('You have unsaved changes. Discard them?');
      if (!leave) return;
    }
    setForm(null);
    setDirty(false);
    onCancelEdit?.();
  };

  const handleSave = async () => {
    if (!business || !form) return;
    if (!form.business_name.trim()) return;
    const result = await updateBusiness(business.id, formToPayload(form));
    if (result.ok) {
      setForm(null);
      setDirty(false);
      onClose();
    }
  };

  const title =
    mode === 'create'
      ? 'Add business'
      : isEdit
        ? 'Edit business'
        : business?.business_name ?? 'Business';

  return (
    <SlidePanel open={open} onClose={handleClose} title={title}>
      {mode === 'create' ? null : detailLoading ||
        (businessId && !business && mode === 'view') ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : isEdit && form ? (
        <BusinessForm
          form={form}
          onChange={(f) => {
            setForm(f);
            setDirty(true);
          }}
          services={services}
          onSubmit={handleSave}
          onCancel={handleCancelEdit}
          saving={saving}
          submitLabel="Save changes"
        />
      ) : business ? (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={business.status} />
            <PriorityBadge priority={business.priority} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={startEdit}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const suggested = getSuggestedPreset(
                  business,
                  detail?.decisionMakers,
                  detail?.activities,
                );
                setActivityPanel({
                  mode: 'create',
                  preset: suggested
                    ? { ...suggested, step: suggested.step }
                    : undefined,
                });
              }}
            >
              <Activity className="h-4 w-4" />
              Log suggested
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDmPanel({ mode: 'create' })}
            >
              <UserPlus className="h-4 w-4" />
              Add decision maker
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDeleteRequest(business.id)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
          <DetailField label="Niche" value={business.niche} />
          <DetailField label="Email" value={business.business_email} />
          <DetailField label="Website" value={business.website_url} />
          <DetailField label="LinkedIn" value={business.linkedin_url} />
          <DetailField label="Phone" value={business.phone_number} />
          <DetailField
            label="Location"
            value={[business.city, business.state, business.country]
              .filter(Boolean)
              .join(', ')}
          />
          <DetailField label="Lead source" value={business.lead_source} />
          <DetailField
            label="Estimated value"
            value={formatCurrency(business.estimated_value)}
          />
          <DetailField label="Problem notes" value={business.problem_notes} />
          <DetailField
            label="Last contacted"
            value={formatDateTime(business.last_contacted_at)}
          />
          <DetailField
            label="Next follow-up"
            value={formatDateTime(business.next_followup_at)}
          />
          {business.services?.length > 0 && (
            <div>
              <p className="text-label uppercase text-text-muted mb-2">Services</p>
              <div className="flex flex-wrap gap-2">
                {business.services.map((s) => (
                  <span
                    key={s.id}
                    className="rounded-md border border-border bg-background-elevated px-2 py-1 text-small text-text-secondary"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="text-label uppercase text-text-muted mb-2">
              Decision makers
            </p>
            {detail.decisionMakers?.length ? (
              <ul className="space-y-2">
                {detail.decisionMakers.map((dm) => (
                  <li key={dm.id}>
                    <button
                      type="button"
                      onClick={() => setDmPanel({ mode: 'view', dm })}
                      className="w-full rounded-lg border border-border px-3 py-2 text-small text-left transition-colors hover:bg-background-elevated/50 flex items-center justify-between gap-2"
                    >
                      <span>
                        <span className="text-text-primary font-medium">{dm.name}</span>
                        {dm.role && (
                          <span className="text-text-muted"> · {dm.role}</span>
                        )}
                        {dm.email && (
                          <span className="block text-text-muted text-xs mt-0.5">
                            {dm.email}
                          </span>
                        )}
                      </span>
                      <PreferredContactIcon method={dm.preferred_contact} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-small text-text-muted">None yet</p>
            )}
          </div>
          <OutreachPlaybook
            business={business}
            decisionMakers={detail.decisionMakers}
            activities={detail.activities}
            saving={activitySaving}
            onLogStep={(preset, step) =>
              setActivityPanel({ mode: 'create', preset: { ...preset, step } })
            }
            onLogOutcome={(action) =>
              setActivityPanel({
                mode: 'create',
                preset: presetFromOutcome(action),
              })
            }
            onCustomLog={() => setActivityPanel({ mode: 'create' })}
          />
          <div>
            <p className="text-label uppercase text-text-muted mb-2">
              Activity timeline
            </p>
            <ActivityTimeline
              activities={detail.activities}
              onSelect={(a) => setActivityPanel({ mode: 'view', activity: a })}
            />
          </div>
        </div>
      ) : (
        <p className="text-text-muted text-body">Business not found.</p>
      )}

      <DecisionMakerPanel
        open={!!dmPanel}
        mode={dmPanel?.mode ?? 'view'}
        businessId={business?.id}
        businessName={business?.business_name}
        decisionMaker={dmPanel?.dm}
        onClose={() => setDmPanel(null)}
        onEdit={() => setDmPanel((p) => (p ? { ...p, mode: 'edit' } : p))}
        onDeleteRequest={(dm) => setDmDelete(dm)}
      />

      <ActivityPanel
        open={!!activityPanel}
        mode={activityPanel?.mode ?? 'view'}
        businessId={business?.id}
        businessName={business?.business_name}
        business={business}
        activity={activityPanel?.activity}
        preset={activityPanel?.preset}
        decisionMakers={detail?.decisionMakers ?? []}
        onClose={() => setActivityPanel(null)}
        onEdit={() => setActivityPanel((p) => (p ? { ...p, mode: 'edit' } : p))}
        onDeleteRequest={(a) => setActivityDelete(a)}
      />

      <Modal
        open={!!activityDelete}
        onClose={() => setActivityDelete(null)}
        title="Delete this activity?"
        description="This removes the log entry only. It does not undo last-contacted dates already saved."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={async () => {
          if (!activityDelete || !business) return;
          const result = await removeActivity(activityDelete.id, business.id);
          if (result.ok) {
            setActivityDelete(null);
            setActivityPanel(null);
          }
        }}
      />

      <Modal
        open={!!dmDelete}
        onClose={() => setDmDelete(null)}
        title="Delete this contact?"
        description="This will permanently remove the decision maker. This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={async () => {
          if (!dmDelete || !business) return;
          const result = await removeDecisionMaker(dmDelete.id, business.id);
          if (result.ok) {
            setDmDelete(null);
            setDmPanel(null);
          }
        }}
      />
    </SlidePanel>
  );
}

export function BusinessCreatePanel({ open, onClose, onCreated }) {
  const { services, saving, createBusiness, clearError } = useBusinessStore();
  const [form, setForm] = useState({ ...EMPTY_BUSINESS_FORM });

  const handleClose = () => {
    setForm({ ...EMPTY_BUSINESS_FORM });
    clearError();
    onClose();
  };

  const handleSubmit = async () => {
    if (!form.business_name.trim()) return;
    const result = await createBusiness(formToPayload(form));
    if (result.ok) {
      setForm({ ...EMPTY_BUSINESS_FORM });
      onCreated();
    }
  };

  return (
    <SlidePanel open={open} onClose={handleClose} title="Add business">
      <BusinessForm
        form={form}
        onChange={setForm}
        services={services}
        onSubmit={handleSubmit}
        onCancel={handleClose}
        saving={saving}
        submitLabel="Add business"
      />
    </SlidePanel>
  );
}
