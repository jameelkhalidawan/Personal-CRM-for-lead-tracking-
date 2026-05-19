import { useEffect, useState } from 'react';
import { Building2, Pencil, Trash2 } from 'lucide-react';
import { EMPTY_DECISION_MAKER_FORM } from '../../constants/decisionMaker';
import { decisionMakerToForm } from '../../lib/decisionMakerApi';
import { formatDateTime } from '../../lib/format';
import { useDecisionMakerStore } from '../../stores/decisionMakerStore';
import { SlidePanel } from '../ui/SlidePanel';
import { Button } from '../ui/Button';
import { DecisionMakerForm } from './DecisionMakerForm';
import { PreferredContactIcon } from './PreferredContactIcon';

function DetailField({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-label uppercase text-text-muted mb-0.5">{label}</p>
      <p className="text-body text-text-primary break-words">{value}</p>
    </div>
  );
}

export function DecisionMakerPanel({
  open,
  mode,
  businessId,
  businessName,
  decisionMaker,
  onClose,
  onEdit,
  onDeleteRequest,
  onOpenBusiness,
}) {
  const { saving, create, update } = useDecisionMakerStore();
  const [form, setForm] = useState({ ...EMPTY_DECISION_MAKER_FORM });
  const [dirty, setDirty] = useState(false);
  const isEdit = mode === 'edit';
  const isCreate = mode === 'create';
  const isView = mode === 'view';

  useEffect(() => {
    if (!open) return;
    if (isCreate) {
      setForm({ ...EMPTY_DECISION_MAKER_FORM });
      setDirty(false);
    } else if (decisionMaker) {
      setForm(decisionMakerToForm(decisionMaker) ?? { ...EMPTY_DECISION_MAKER_FORM });
      setDirty(false);
    }
  }, [open, mode, decisionMaker, isCreate]);

  const handleClose = () => {
    if ((isCreate || isEdit) && dirty) {
      const leave = window.confirm('You have unsaved changes. Discard them?');
      if (!leave) return;
    }
    setForm({ ...EMPTY_DECISION_MAKER_FORM });
    setDirty(false);
    onClose();
  };

  const handleSave = async () => {
    if (!form.name.trim() || !businessId) return;
    const result = isCreate
      ? await create(businessId, form)
      : await update(decisionMaker.id, businessId, form);
    if (result.ok) {
      setDirty(false);
      onClose();
    }
  };

  const title = isCreate
    ? 'Add decision maker'
    : isEdit
      ? 'Edit decision maker'
      : decisionMaker?.name ?? 'Decision maker';

  return (
    <SlidePanel open={open} onClose={handleClose} title={title} zClass="z-[60]">
      {businessName && (
        <p className="text-small text-text-muted -mt-2 mb-4">at {businessName}</p>
      )}

      {isCreate || isEdit ? (
        <DecisionMakerForm
          form={form}
          onChange={(f) => {
            setForm(f);
            setDirty(true);
          }}
          onSubmit={handleSave}
          onCancel={handleClose}
          saving={saving}
          submitLabel={isCreate ? 'Add contact' : 'Save changes'}
        />
      ) : isView && decisionMaker ? (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDeleteRequest?.(decisionMaker)}
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
          <div>
            <p className="text-label uppercase text-text-muted mb-1">Preferred contact</p>
            <PreferredContactIcon method={decisionMaker.preferred_contact} showLabel />
          </div>
          <DetailField label="Role" value={decisionMaker.role} />
          <DetailField label="Email" value={decisionMaker.email} />
          <DetailField label="Phone" value={decisionMaker.phone_number} />
          <DetailField label="LinkedIn" value={decisionMaker.linkedin_url} />
          <DetailField label="Instagram" value={decisionMaker.instagram_handle} />
          <DetailField label="Facebook" value={decisionMaker.facebook_url} />
          <DetailField label="Twitter / X" value={decisionMaker.twitter_handle} />
          <DetailField label="Notes" value={decisionMaker.notes} />
          <DetailField label="Problem notes" value={decisionMaker.problem_notes} />
          <DetailField
            label="Last contacted"
            value={formatDateTime(decisionMaker.last_contacted_at)}
          />
          <DetailField
            label="Next follow-up"
            value={formatDateTime(decisionMaker.next_followup_at)}
          />
        </div>
      ) : null}
    </SlidePanel>
  );
}
