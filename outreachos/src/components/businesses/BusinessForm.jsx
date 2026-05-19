import {
  BUSINESS_PRIORITIES,
  BUSINESS_STATUSES,
} from '../../constants/business';
import { fromDatetimeLocalValue, toDatetimeLocalValue } from '../../lib/format';
import { Input, Select, Textarea } from '../ui/Input';
import { Button } from '../ui/Button';

export function businessToForm(business, services = []) {
  if (!business) return null;
  return {
    business_name: business.business_name ?? '',
    niche: business.niche ?? '',
    business_email: business.business_email ?? '',
    website_url: business.website_url ?? '',
    linkedin_url: business.linkedin_url ?? '',
    phone_number: business.phone_number ?? '',
    city: business.city ?? '',
    state: business.state ?? '',
    country: business.country ?? '',
    problem_notes: business.problem_notes ?? '',
    lead_source: business.lead_source ?? '',
    status: business.status ?? 'new',
    priority: business.priority ?? 'medium',
    estimated_value: business.estimated_value ?? '',
    last_contacted_at: toDatetimeLocalValue(business.last_contacted_at),
    next_followup_at: toDatetimeLocalValue(business.next_followup_at),
    serviceIds: business.services?.map((s) => s.id) ?? [],
  };
}

export function formToPayload(form) {
  return {
    ...form,
    last_contacted_at: fromDatetimeLocalValue(form.last_contacted_at),
    next_followup_at: fromDatetimeLocalValue(form.next_followup_at),
  };
}

export function BusinessForm({
  form,
  onChange,
  services,
  onSubmit,
  onCancel,
  saving,
  submitLabel = 'Save',
}) {
  const set = (field, value) => onChange({ ...form, [field]: value });

  const toggleService = (serviceId) => {
    const ids = form.serviceIds.includes(serviceId)
      ? form.serviceIds.filter((id) => id !== serviceId)
      : [...form.serviceIds, serviceId];
    set('serviceIds', ids);
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
        label="Business name"
        required
        value={form.business_name}
        onChange={(e) => set('business_name', e.target.value)}
        placeholder="Acme Corp"
      />
      <Input
        label="Niche"
        value={form.niche}
        onChange={(e) => set('niche', e.target.value)}
        placeholder="Dental clinic, HVAC, etc."
      />
      <Input
        label="Email"
        type="email"
        value={form.business_email}
        onChange={(e) => set('business_email', e.target.value)}
      />
      <Input
        label="Website"
        value={form.website_url}
        onChange={(e) => set('website_url', e.target.value)}
        placeholder="https://"
      />
      <Input
        label="LinkedIn"
        value={form.linkedin_url}
        onChange={(e) => set('linkedin_url', e.target.value)}
      />
      <Input
        label="Phone"
        value={form.phone_number}
        onChange={(e) => set('phone_number', e.target.value)}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="City"
          value={form.city}
          onChange={(e) => set('city', e.target.value)}
        />
        <Input
          label="State"
          value={form.state}
          onChange={(e) => set('state', e.target.value)}
        />
      </div>
      <Input
        label="Country"
        value={form.country}
        onChange={(e) => set('country', e.target.value)}
      />
      <Select
        label="Status"
        value={form.status}
        onChange={(e) => set('status', e.target.value)}
      >
        {BUSINESS_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </Select>
      <Select
        label="Priority"
        value={form.priority}
        onChange={(e) => set('priority', e.target.value)}
      >
        {BUSINESS_PRIORITIES.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </Select>
      <Input
        label="Estimated value"
        type="number"
        min="0"
        step="1"
        value={form.estimated_value}
        onChange={(e) => set('estimated_value', e.target.value)}
        placeholder="5000"
      />
      <Input
        label="Lead source"
        value={form.lead_source}
        onChange={(e) => set('lead_source', e.target.value)}
      />
      <Textarea
        label="Problem notes"
        value={form.problem_notes}
        onChange={(e) => set('problem_notes', e.target.value)}
        rows={4}
      />
      <div className="space-y-2">
        <p className="text-label uppercase text-text-muted">Interested services</p>
        <div className="space-y-2">
          {services.map((s) => (
            <label
              key={s.id}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 cursor-pointer hover:border-border-hover"
            >
              <input
                type="checkbox"
                checked={form.serviceIds.includes(s.id)}
                onChange={() => toggleService(s.id)}
                className="rounded border-border text-accent-primary focus:ring-accent-primary"
              />
              <span className="text-body text-text-primary">{s.name}</span>
            </label>
          ))}
        </div>
      </div>
      <Input
        label="Last contacted"
        type="datetime-local"
        value={form.last_contacted_at}
        onChange={(e) => set('last_contacted_at', e.target.value)}
      />
      <Input
        label="Next follow-up"
        type="datetime-local"
        value={form.next_followup_at}
        onChange={(e) => set('next_followup_at', e.target.value)}
      />
      <div className="fixed bottom-0 right-0 w-full max-w-[480px] border-t border-border bg-background-card p-4 flex gap-2">
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
