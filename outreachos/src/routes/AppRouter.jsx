import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ReminderNavigationListener } from '../components/ReminderNavigationListener';
import { useReminderScheduler } from '../hooks/useReminderScheduler';
import { AppLayout } from '../layouts/AppLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { BusinessesPage } from '../pages/BusinessesPage';
import { DecisionMakersPage } from '../pages/DecisionMakersPage';
import { ActivitiesPage } from '../pages/ActivitiesPage';
import { EmailTemplatesPage } from '../pages/EmailTemplatesPage';
import { CallTemplatesPage } from '../pages/CallTemplatesPage';
import { SettingsPage } from '../pages/SettingsPage';
import { WorkQueuePage } from '../pages/WorkQueuePage';
import { AnalyticsPage } from '../pages/AnalyticsPage';

export function AppRouter() {
  useReminderScheduler();

  return (
    <HashRouter>
      <ReminderNavigationListener />
      <ErrorBoundary>
        <Routes>
          <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="work-queue" element={<WorkQueuePage />} />
          <Route path="businesses" element={<BusinessesPage />} />
          <Route path="decision-makers" element={<DecisionMakersPage />} />
          <Route path="activities" element={<ActivitiesPage />} />
          <Route path="email-templates" element={<EmailTemplatesPage />} />
          <Route path="call-templates" element={<CallTemplatesPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </HashRouter>
  );
}
