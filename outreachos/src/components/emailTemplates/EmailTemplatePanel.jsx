import { useEffect, useRef, useState } from 'react';
import { Copy, Pencil, Trash2 } from 'lucide-react';
import { EMPTY_EMAIL_TEMPLATE_FORM } from '../../constants/emailTemplate';
import { templateToForm } from '../../lib/emailTemplateApi';
import { useEmailTemplateStore } from '../../stores/emailTemplateStore';
import { SlidePanel } from '../ui/SlidePanel';
import { Button } from '../ui/Button';
import { MigrationHint } from '../ui/MigrationHint';
import { EmailTemplateForm } from './EmailTemplateForm';

export function EmailTemplatePanel({
  open,
  mode,
  template,
  onClose,
  onEdit,
  onDeleteRequest,
}) {
  const { saving, error, create, update, getCategories, clearError } =
    useEmailTemplateStore();
  const categorySuggestions = getCategories();
  const [form, setForm] = useState({ ...EMPTY_EMAIL_TEMPLATE_FORM });
  const [validationError, setValidationError] = useState('');
  const wasOpenRef = useRef(false);
  const isCreate = mode === 'create';
  const isEdit = mode === 'edit';

  useEffect(() => {
    if (!open) {
      wasOpenRef.current = false;
      return;
    }
    const justOpened = !wasOpenRef.current;
    wasOpenRef.current = true;
    if (!justOpened) return;

    setValidationError('');
    clearError();
    if (isCreate) {
      setForm({ ...EMPTY_EMAIL_TEMPLATE_FORM });
    } else if (template) {
      setForm(templateToForm(template) ?? { ...EMPTY_EMAIL_TEMPLATE_FORM });
    }
  }, [open, mode, template?.id, isCreate, clearError]);

  const handleSave = async () => {
    setValidationError('');
    if (!form.name.trim()) {
      setValidationError('Enter a template name.');
      return;
    }
    if (!form.subject?.trim() && !form.body?.trim()) {
      setValidationError('Add a subject or body for this template.');
      return;
    }
    const result = isCreate ? await create(form) : await update(template.id, form);
    if (result.ok) onClose();
  };

  const copyToClipboard = () => {
    const text = `Subject: ${template?.subject ?? ''}\n\n${template?.body ?? ''}`;
    navigator.clipboard?.writeText(text);
  };

  const title = isCreate
    ? 'Add template'
    : isEdit
      ? 'Edit template'
      : template?.name ?? 'Template';

  return (
    <SlidePanel open={open} onClose={onClose} title={title}>
      {isCreate || isEdit ? (
        <>
          {(validationError || error) && (
            <div className="mb-4 rounded-lg border border-priority-high/40 bg-priority-high/10 px-3 py-2 text-small text-priority-high">
              <span>{validationError || error}</span>
              <MigrationHint error={error} />
            </div>
          )}
          <EmailTemplateForm
            form={form}
            onChange={setForm}
            onSubmit={handleSave}
            onCancel={onClose}
            saving={saving}
            categorySuggestions={categorySuggestions}
            submitLabel={isCreate ? 'Add template' : 'Save changes'}
          />
        </>
      ) : template ? (
        <div className="space-y-4">
          <p className="text-small text-text-muted">
            Category: <span className="text-text-secondary">{template.category || '—'}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="secondary" size="sm" onClick={copyToClipboard}>
              <Copy className="h-4 w-4" />
              Copy
            </Button>
            <Button variant="danger" size="sm" onClick={() => onDeleteRequest?.(template)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
          <div>
            <p className="text-label uppercase text-text-muted mb-1">Subject</p>
            <p className="text-body text-text-primary">{template.subject || '—'}</p>
          </div>
          <div>
            <p className="text-label uppercase text-text-muted mb-1">Body</p>
            <pre className="text-small text-text-secondary whitespace-pre-wrap font-sans rounded-lg border border-border bg-background-elevated p-3 max-h-[50vh] overflow-y-auto">
              {template.body || '—'}
            </pre>
          </div>
        </div>
      ) : null}
    </SlidePanel>
  );
}
