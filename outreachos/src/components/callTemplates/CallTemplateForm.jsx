import { useRef, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { newScriptId } from '../../lib/callTemplateApi';
import { insertAtCursor } from '../../lib/insertAtCursor';
import { Input, Textarea } from '../ui/Input';
import { Button } from '../ui/Button';
import { CategoryField } from '../emailTemplates/CategoryField';

const PLACEHOLDERS = [
  { key: '{{decision_maker_name}}', label: 'Contact name' },
  { key: '{{business_name}}', label: 'Business name' },
  { key: '{{niche}}', label: 'Niche' },
  { key: '{{your_name}}', label: 'Your name' },
];

export function CallTemplateForm({
  form,
  onPatch,
  onSubmit,
  onCancel,
  saving,
  categorySuggestions = [],
  submitLabel = 'Save',
}) {
  const scriptRefs = useRef({});
  const scriptsEndRef = useRef(null);
  const [activeScriptId, setActiveScriptId] = useState(
    () => form.scripts?.[0]?.id ?? null,
  );

  const scripts = form.scripts ?? [];

  const updateScripts = (nextScripts) => {
    onPatch({ scripts: nextScripts });
  };

  const updateScript = (id, patch) => {
    updateScripts(scripts.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const addScript = () => {
    const id = newScriptId();
    const nextIndex = scripts.length + 1;
    updateScripts([...scripts, { id, label: `Script ${nextIndex}`, body: '' }]);
    setActiveScriptId(id);
    requestAnimationFrame(() => {
      scriptsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  };

  const removeScript = (id) => {
    if (scripts.length <= 1) return;
    const next = scripts.filter((s) => s.id !== id);
    updateScripts(next);
    if (activeScriptId === id) setActiveScriptId(next[0]?.id ?? null);
  };

  const insertPlaceholder = (placeholder) => {
    const id = activeScriptId ?? scripts[0]?.id;
    if (!id) return;
    const el = scriptRefs.current[id];
    const script = scripts.find((s) => s.id === id);
    const current = script?.body ?? '';
    const next = insertAtCursor(el, current, placeholder);
    updateScript(id, { body: next });
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
        onChange={(e) => onPatch({ name: e.target.value })}
        placeholder="AI Voice Agent — Cold call pack"
      />
      <CategoryField
        value={form.category}
        onChange={(v) => onPatch({ category: v })}
        suggestions={categorySuggestions}
        listId="call-template-categories"
      />

      <div className="flex items-center justify-between gap-2">
        <p className="text-label uppercase text-text-muted">Scripts in this template</p>
        <Button type="button" variant="secondary" size="sm" onClick={addScript}>
          <Plus className="h-4 w-4" />
          Add script
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-background-elevated/50 p-3 space-y-2">
        <p className="text-label uppercase text-text-muted">Insert variable</p>
        <div className="flex flex-wrap gap-2">
          {PLACEHOLDERS.map((p) => (
            <button
              key={p.key}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => insertPlaceholder(p.key)}
              className="rounded-md border border-border bg-background-card px-2.5 py-1.5 text-small text-accent-secondary hover:border-accent-secondary/50 hover:bg-accent-secondary/10"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {scripts.map((script, index) => (
          <div
            key={script.id}
            className="rounded-xl border border-border bg-background-elevated/30 p-4 space-y-3"
          >
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <Input
                  label={index === 0 ? 'Script label' : 'Script label'}
                  value={script.label}
                  onChange={(e) => updateScript(script.id, { label: e.target.value })}
                  onFocus={() => setActiveScriptId(script.id)}
                  placeholder="e.g. Opening, Objection handler, Close"
                />
              </div>
              {scripts.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0 mt-7"
                  onClick={() => removeScript(script.id)}
                  title="Remove script"
                >
                  <Trash2 className="h-4 w-4 text-priority-high" />
                </Button>
              )}
            </div>
            <Textarea
              textareaRef={(el) => {
                scriptRefs.current[script.id] = el;
              }}
              label="Script text"
              value={script.body}
              onFocus={() => setActiveScriptId(script.id)}
              onChange={(e) => updateScript(script.id, { body: e.target.value })}
              rows={8}
              placeholder={
                'Hi {{decision_maker_name}}, this is {{your_name}} from Conscious Automation...\n\nI noticed {{business_name}} in the {{niche}} space...'
              }
            />
          </div>
        ))}
        <div ref={scriptsEndRef} />
      </div>

      <p className="text-small text-text-muted">
        Variables fill in automatically when you log a call. Add multiple scripts per
        template (opening, pitch, close, etc.).
      </p>

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
