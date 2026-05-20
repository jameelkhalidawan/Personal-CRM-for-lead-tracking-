import { useEffect, useMemo, useRef, useState } from 'react';
import { Copy, Phone } from 'lucide-react';
import { CALL_OUTCOME_ACTIONS } from '../../constants/activity';
import { useOutreachTiming } from '../../hooks/useOutreachTiming';
import { addDaysDatetimeLocal } from '../../lib/outreachSequence';
import { getCallOutcomeDays } from '../../lib/outreachTiming';
import { shouldReplaceTemplateNotes } from '../../lib/templateAutoFill';
import {
  buildTemplateContext,
  formatCallNotes,
  renderTemplate,
} from '../../lib/templateRender';
import { filterTemplatesByContext } from '../../lib/templateCategories';
import { useCallTemplateStore } from '../../stores/callTemplateStore';
import { usePreferencesStore } from '../../stores/preferencesStore';
import { Button } from '../ui/Button';
import { Select } from '../ui/Input';

export function CallOutreachSection({
  form,
  onPatch = () => {},
  business,
  decisionMakers,
  user,
}) {
  const { templates, loadAll } = useCallTemplateStore();
  const serviceTemplateCategories = usePreferencesStore(
    (s) => s.serviceTemplateCategories ?? {},
  );
  const timing = useOutreachTiming();
  const [templateId, setTemplateId] = useState(form.call_template_id ?? '');
  const [scriptId, setScriptId] = useState(form.call_script_id ?? '');
  const lastAutoNotesRef = useRef('');

  const sortedTemplates = filterTemplatesByContext(
    templates,
    business,
    serviceTemplateCategories,
  );

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (form.call_template_id) setTemplateId(form.call_template_id);
    if (form.call_script_id) setScriptId(form.call_script_id);
  }, [form.call_template_id, form.call_script_id]);

  const decisionMaker = decisionMakers.find((dm) => dm.id === form.decision_maker_id);

  const context = useMemo(
    () => buildTemplateContext({ business, decisionMaker, user }),
    [
      business?.id,
      business?.business_name,
      business?.niche,
      business?.business_email,
      business?.website_url,
      business?.phone_number,
      business?.city,
      business?.lead_source,
      decisionMaker?.id,
      decisionMaker?.name,
      decisionMaker?.email,
      decisionMaker?.role,
      decisionMaker?.phone_number,
      user?.id,
      user?.user_metadata?.full_name,
      user?.email,
    ],
  );

  const selectedTemplate = sortedTemplates.find((t) => t.id === templateId);
  const scripts = selectedTemplate?.scripts ?? [];
  const selectedScript =
    scripts.find((s) => s.id === scriptId) ?? scripts[0] ?? null;

  const renderedScript = selectedScript
    ? renderTemplate(selectedScript.body, context)
    : '';

  const applyScriptToNotes = (tplId, scrId, scriptLabel, body, force = false) => {
    const notes = formatCallNotes(scriptLabel, body);
    if (
      !force &&
      !shouldReplaceTemplateNotes(form.notes, lastAutoNotesRef.current)
    ) {
      onPatch({
        call_template_id: tplId ?? '',
        call_script_id: scrId ?? '',
        outreach_channel: 'phone',
      });
      return;
    }
    lastAutoNotesRef.current = notes.trim();
    onPatch({
      call_template_id: tplId ?? '',
      call_script_id: scrId ?? '',
      outreach_channel: 'phone',
      notes,
    });
  };

  useEffect(() => {
    if (!templateId || !selectedScript) return;
    const body = renderTemplate(selectedScript.body, context);
    applyScriptToNotes(
      templateId,
      selectedScript.id,
      selectedScript.label,
      body,
      false,
    );
  }, [form.decision_maker_id, business?.id, templateId, scriptId, context]);

  const handleSelectTemplate = (id) => {
    setTemplateId(id);
    if (!id) {
      setScriptId('');
      lastAutoNotesRef.current = '';
      onPatch({ call_template_id: '', call_script_id: '' });
      return;
    }
    const t = sortedTemplates.find((x) => x.id === id);
    const first = t?.scripts?.[0];
    if (!first) return;
    setScriptId(first.id);
    const body = renderTemplate(first.body, context);
    applyScriptToNotes(id, first.id, first.label, body, true);
  };

  const handleSelectScript = (id) => {
    setScriptId(id);
    const script = scripts.find((s) => s.id === id);
    if (!script) return;
    const body = renderTemplate(script.body, context);
    applyScriptToNotes(templateId, id, script.label, body, true);
  };

  const applyCallOutcome = (action) => {
    const days = action.followupDays ?? getCallOutcomeDays(timing, action.id);
    const followup_at = days ? addDaysDatetimeLocal(days) : '';
    const scriptBlock = renderedScript
      ? formatCallNotes(selectedScript?.label, renderedScript)
      : '';
    const notes = scriptBlock
      ? `${scriptBlock}\n\nResult: ${action.notes}`
      : action.notes;
    lastAutoNotesRef.current = notes.trim();

    onPatch({
      notes,
      followup_at,
      outreach_channel: 'phone',
      call_template_id: templateId,
      call_script_id: scriptId,
    });
  };

  const copy = async (text) => {
    if (!text) return;
    await navigator.clipboard?.writeText(text);
  };

  const missingName = !context.decision_maker_name && form.decision_maker_id;

  return (
    <div className="rounded-xl border border-accent-primary/30 bg-accent-primary/10 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Phone className="h-4 w-4 text-accent-primary" />
        <p className="text-small font-medium text-text-primary">Call script</p>
      </div>

      <Select
        label="Choose template"
        value={templateId}
        onChange={(e) => handleSelectTemplate(e.target.value)}
      >
        <option value="">— Select a template —</option>
        {sortedTemplates.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
            {t.category ? ` (${t.category})` : ''}
          </option>
        ))}
      </Select>

      {scripts.length > 1 && (
        <Select
          label="Script"
          value={scriptId || selectedScript?.id || ''}
          onChange={(e) => handleSelectScript(e.target.value)}
        >
          {scripts.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </Select>
      )}

      {scripts.length === 1 && selectedScript && (
        <p className="text-small text-text-muted">
          Script: <span className="text-text-secondary">{selectedScript.label}</span>
        </p>
      )}

      {missingName && (
        <p className="text-small text-priority-high">
          Select a contact above so {'{{decision_maker_name}}'} fills in correctly.
        </p>
      )}

      {selectedScript && (
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-label uppercase text-text-muted">Ready to read on the call</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => copy(renderedScript)}
            >
              <Copy className="h-3.5 w-3.5" />
              Copy
            </Button>
          </div>
          <pre className="text-small text-text-primary whitespace-pre-wrap font-sans rounded-lg border border-border bg-background-card px-3 py-2 max-h-52 overflow-y-auto">
            {renderedScript || '—'}
          </pre>
        </div>
      )}

      <div>
        <p className="text-label uppercase text-text-muted mb-2">How did the call go?</p>
        <div className="flex flex-wrap gap-1.5">
          {CALL_OUTCOME_ACTIONS.map((action) => (
            <Button
              key={action.id}
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => applyCallOutcome(action)}
            >
              {action.label}
            </Button>
          ))}
        </div>
        <p className="text-small text-text-muted mt-2">
          Tap a result to set notes and follow-up, then submit to log the call.
        </p>
      </div>
    </div>
  );
}
