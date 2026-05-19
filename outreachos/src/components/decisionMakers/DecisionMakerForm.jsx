import { PREFERRED_CONTACT_OPTIONS } from '../../constants/decisionMaker';
import { Input, Select, Textarea } from '../ui/Input';
import { Button } from '../ui/Button';

export function DecisionMakerForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  saving,
  submitLabel = 'Save',
}) {
  const set = (field, value) => onChange({ ...form, [field]: value });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-4 pb-24"
    >
      <Input
        label="Name"
        required
        value={form.name}
        onChange={(e) => set('name', e.target.value)}
        placeholder="Jane Smith"
      />
      <Input
        label="Role"
        value={form.role}
        onChange={(e) => set('role', e.target.value)}
        placeholder="CEO, Owner, Marketing Director"
      />
      <Input
        label="Email"
        type="email"
        value={form.email}
        onChange={(e) => set('email', e.target.value)}
      />
      <Input
        label="Phone"
        value={form.phone_number}
        onChange={(e) => set('phone_number', e.target.value)}
      />
      <Input
        label="LinkedIn URL"
        value={form.linkedin_url}
        onChange={(e) => set('linkedin_url', e.target.value)}
        placeholder="https://linkedin.com/in/..."
      />
      <Input
        label="Instagram handle"
        value={form.instagram_handle}
        onChange={(e) => set('instagram_handle', e.target.value)}
        placeholder="@username"
      />
      <Input
        label="Facebook URL"
        value={form.facebook_url}
        onChange={(e) => set('facebook_url', e.target.value)}
      />
      <Input
        label="Twitter / X handle"
        value={form.twitter_handle}
        onChange={(e) => set('twitter_handle', e.target.value)}
        placeholder="@username"
      />
      <Select
        label="Preferred contact"
        value={form.preferred_contact}
        onChange={(e) => set('preferred_contact', e.target.value)}
      >
        {PREFERRED_CONTACT_OPTIONS.map((o) => (
          <option key={o.value || 'none'} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
      <Textarea
        label="Notes"
        value={form.notes}
        onChange={(e) => set('notes', e.target.value)}
        rows={3}
      />
      <Textarea
        label="Problem notes"
        value={form.problem_notes}
        onChange={(e) => set('problem_notes', e.target.value)}
        rows={3}
      />
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
