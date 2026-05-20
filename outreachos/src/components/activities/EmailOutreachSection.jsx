import { useEffect, useMemo, useState } from 'react';
import { Copy, Mail } from 'lucide-react';
import {
  buildTemplateContext,
  formatEmailForNotes,
  renderTemplate,
} from '../../lib/templateRender';
import { useEmailTemplateStore } from '../../stores/emailTemplateStore';
import { usePreferencesStore } from '../../stores/preferencesStore';
import { filterTemplatesByContext } from '../../lib/templateCategories';
import { Button } from '../ui/Button';
import { Select } from '../ui/Input';

export function EmailOutreachSection({
  form,
  onPatch = () => {},
  business,
  decisionMakers,
  user,
}) {
  const { templates, loadAll } = useEmailTemplateStore();
  const serviceTemplateCategories = usePreferencesStore(
    (s) => s.serviceTemplateCategories ?? {},
  );
  const [selectedId, setSelectedId] = useState(form.template_id ?? '');

  const sortedTemplates = filterTemplatesByContext(
    templates,
    business,
    serviceTemplateCategories,
  );

  useEffect(() => {
    loadAll();
  }, [loadAll]);

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

  const selectedTemplate = sortedTemplates.find((t) => t.id === selectedId);

  const renderedSubject = selectedTemplate
    ? renderTemplate(selectedTemplate.subject, context)
    : form.email_subject;
  const renderedBody = selectedTemplate
    ? renderTemplate(selectedTemplate.body, context)
    : form.email_body;

  const applyRendered = (templateId, subject, body) => {
    onPatch({
      template_id: templateId ?? '',
      email_subject: subject,
      email_body: body,
      notes: formatEmailForNotes(subject, body),
    });
  };

  useEffect(() => {
    if (!selectedId) return;
    const t = sortedTemplates.find((x) => x.id === selectedId);
    if (!t) return;
    const subject = renderTemplate(t.subject, context);
    const body = renderTemplate(t.body, context);
    applyRendered(t.id, subject, body);
  }, [form.decision_maker_id, business?.id, selectedId, context]);

  const handleSelectTemplate = (id) => {
    setSelectedId(id);
    if (!id) {
      applyRendered('', form.email_subject, form.email_body);
      return;
    }
    const t = sortedTemplates.find((x) => x.id === id);
    if (!t) return;
    const subject = renderTemplate(t.subject, context);
    const body = renderTemplate(t.body, context);
    applyRendered(t.id, subject, body);
  };

  const copy = async (text, label) => {
    if (!text) return;
    await navigator.clipboard?.writeText(text);
  };

  const missingName = !context.decision_maker_name && form.decision_maker_id;

  return (
    <div className="rounded-xl border border-accent-secondary/30 bg-accent-secondary/5 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-accent-secondary" />
        <p className="text-small font-medium text-text-primary">Email from template</p>
      </div>

      <Select
        label="Choose template"
        value={selectedId}
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

      {missingName && (
        <p className="text-small text-priority-high">
          Select a contact above so {'{{decision_maker_name}}'} fills in correctly.
        </p>
      )}

      {selectedTemplate && (
        <>
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-label uppercase text-text-muted">Subject (ready to send)</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => copy(renderedSubject, 'subject')}
              >
                <Copy className="h-3.5 w-3.5" />
                Copy
              </Button>
            </div>
            <p className="text-body text-text-primary rounded-lg border border-border bg-background-card px-3 py-2">
              {renderedSubject || '—'}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-label uppercase text-text-muted">Email body (ready to send)</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => copy(renderedBody, 'body')}
              >
                <Copy className="h-3.5 w-3.5" />
                Copy
              </Button>
            </div>
            <pre className="text-small text-text-primary whitespace-pre-wrap font-sans rounded-lg border border-border bg-background-card px-3 py-2 max-h-48 overflow-y-auto">
              {renderedBody || '—'}
            </pre>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => copy(formatEmailForNotes(renderedSubject, renderedBody), 'all')}
          >
            <Copy className="h-4 w-4" />
            Copy full email (subject + body)
          </Button>
        </>
      )}

      <p className="text-small text-text-muted">
        Variables are filled from the business and selected contact. This exact text is saved
        in the activity log when you submit.
      </p>
    </div>
  );
}
