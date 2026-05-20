import { useRef, useState } from 'react';
import { insertAtCursor } from '../../lib/insertAtCursor';
import { Input, Textarea } from '../ui/Input';
import { Button } from '../ui/Button';
import { CategoryField } from './CategoryField';
import { PlaceholderInsertBar } from './PlaceholderInsertBar';

export function EmailTemplateForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  saving,
  categorySuggestions = [],
  submitLabel = 'Save',
}) {
  const subjectRef = useRef(null);
  const bodyRef = useRef(null);
  const [activeField, setActiveField] = useState('body');

  const set = (field, value) => onChange({ ...form, [field]: value });

  const insertPlaceholder = (placeholder) => {
    const field = activeField;
    const ref = field === 'subject' ? subjectRef : bodyRef;
    const el = ref.current;
    const current = form[field] ?? '';
    const next = insertAtCursor(el, current, placeholder);
    set(field, next);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-4 pb-24"
    >
      <Input
        label="Template name"
        required
        value={form.name}
        onChange={(e) => set('name', e.target.value)}
        placeholder="AI Voice Agent — Initial Pitch"
      />
      <CategoryField
        value={form.category}
        onChange={(v) => set('category', v)}
        suggestions={categorySuggestions}
      />

      <PlaceholderInsertBar activeField={activeField} onInsert={insertPlaceholder} />

      <Input
        inputRef={subjectRef}
        label="Subject"
        value={form.subject}
        onFocus={() => setActiveField('subject')}
        onChange={(e) => set('subject', e.target.value)}
        placeholder="Quick idea for {{business_name}}"
      />
      <Textarea
        textareaRef={bodyRef}
        label="Body"
        value={form.body}
        onFocus={() => setActiveField('body')}
        onChange={(e) => set('body', e.target.value)}
        rows={12}
        placeholder={'Hey {{decision_maker_name}},\n\nI was looking at {{business_name}}...'}
      />

      <div className="fixed bottom-0 right-0 w-full max-w-[480px] border-t border-border bg-background-card p-4 flex gap-2 z-[70]">
        <Button type="button" variant="ghost" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" loading={saving}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
