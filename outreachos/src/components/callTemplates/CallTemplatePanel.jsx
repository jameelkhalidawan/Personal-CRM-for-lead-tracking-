import { useEffect, useRef, useState } from 'react';
import { Copy, Pencil, Trash2 } from 'lucide-react';
import { createEmptyCallTemplateForm } from '../../constants/callTemplate';
import { templateToForm } from '../../lib/callTemplateApi';
import { useCallTemplateStore } from '../../stores/callTemplateStore';
import { SlidePanel } from '../ui/SlidePanel';
import { Button } from '../ui/Button';
import { CallTemplateForm } from './CallTemplateForm';

export function CallTemplatePanel({
  open,
  mode,
  template,
  onClose,
  onEdit,
  onDeleteRequest,
}) {
  const { saving, error, create, update, getCategories, clearError } =
    useCallTemplateStore();
  const categorySuggestions = getCategories();
  const [form, setForm] = useState(createEmptyCallTemplateForm);
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
      setForm(createEmptyCallTemplateForm());
    } else if (template) {
      setForm(templateToForm(template) ?? createEmptyCallTemplateForm());
    }
  }, [open, mode, template?.id, isCreate, clearError]);

  const handleSave = async () => {
    setValidationError('');
    if (!form.name.trim()) {
      setValidationError('Enter a template name.');
      return;
    }
    const hasScript = (form.scripts ?? []).some((s) => s.body?.trim());
    if (!hasScript) {
      setValidationError('Add at least one script with some text.');
      return;
    }
    const result = isCreate ? await create(form) : await update(template.id, form);
    if (result.ok) onClose();
  };

  const copyAllScripts = () => {
    const text = (template?.scripts ?? [])
      .map((s) => `## ${s.label}\n\n${s.body}`)
      .join('\n\n---\n\n');
    navigator.clipboard?.writeText(text);
  };

  const title = isCreate
    ? 'Add call template'
    : isEdit
      ? 'Edit call template'
      : template?.name ?? 'Call template';

  return (
    <SlidePanel open={open} onClose={onClose} title={title}>
      {isCreate || isEdit ? (
        <>
          {(validationError || error) && (
            <div className="mb-4 rounded-lg border border-priority-high/40 bg-priority-high/10 px-3 py-2 text-small text-priority-high">
              {validationError || error}
            </div>
          )}
          <CallTemplateForm
            form={form}
            onPatch={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
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
            <Button variant="secondary" size="sm" onClick={copyAllScripts}>
              <Copy className="h-4 w-4" />
              Copy all
            </Button>
            <Button variant="danger" size="sm" onClick={() => onDeleteRequest?.(template)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
          <div className="space-y-4">
            {(template.scripts ?? []).map((script) => (
              <div key={script.id} className="rounded-lg border border-border p-3">
                <p className="text-label uppercase text-text-muted mb-1">{script.label}</p>
                <pre className="text-small text-text-secondary whitespace-pre-wrap font-sans max-h-40 overflow-y-auto">
                  {script.body || '—'}
                </pre>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </SlidePanel>
  );
}
