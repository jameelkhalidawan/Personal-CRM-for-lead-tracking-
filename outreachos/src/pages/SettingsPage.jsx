import { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { StatusBadge, PriorityBadge } from '../components/ui/Badge';
import { Input, Select, Textarea } from '../components/ui/Input';
import { SearchInput } from '../components/ui/SearchInput';
import { SlidePanel } from '../components/ui/SlidePanel';
import { Modal } from '../components/ui/Modal';
import { useAuthStore } from '../stores/authStore';

export function SettingsPage() {
  const { user, signOut, loading } = useAuthStore();
  const [panelOpen, setPanelOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Settings"
        description="Account, UI components preview, and app preferences (more in Phase 10)."
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <h2 className="text-h3 text-text-primary">Account</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <p className="text-label uppercase text-text-muted mb-1">Email</p>
              <p className="text-body text-text-primary">{user?.email}</p>
            </div>
            <Button variant="danger" onClick={() => signOut()} loading={loading}>
              Log out
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-h3 text-text-primary">Button variants</h2>
          </CardHeader>
          <CardBody className="flex flex-wrap gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-h3 text-text-primary">Badges</h2>
          </CardHeader>
          <CardBody className="flex flex-wrap gap-2">
            <StatusBadge status="new" />
            <StatusBadge status="contacted" />
            <StatusBadge status="interested" />
            <StatusBadge status="proposal_sent" />
            <PriorityBadge priority="high" />
            <PriorityBadge priority="medium" />
            <PriorityBadge priority="low" />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-h3 text-text-primary">Form controls</h2>
          </CardHeader>
          <CardBody className="grid gap-4 max-w-md">
            <SearchInput placeholder="Search businesses…" />
            <Input label="Sample input" placeholder="Business name" />
            <Select label="Status" defaultValue="new">
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
            </Select>
            <Textarea label="Notes" placeholder="Add notes…" rows={3} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-h3 text-text-primary">Overlays</h2>
          </CardHeader>
          <CardBody className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => setPanelOpen(true)}>
              Open slide panel
            </Button>
            <Button variant="secondary" onClick={() => setModalOpen(true)}>
              Open confirm modal
            </Button>
          </CardBody>
        </Card>
      </div>

      <SlidePanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        title="Example panel"
      >
        <p className="text-text-secondary text-body">
          Slide panels are used for business details and forms. Click the backdrop or X to close.
        </p>
      </SlidePanel>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Delete this lead?"
        description="This action cannot be undone. Used for destructive confirmations."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => setModalOpen(false)}
      />
    </>
  );
}
