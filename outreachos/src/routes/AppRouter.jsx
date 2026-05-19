import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { BusinessesPage } from '../pages/BusinessesPage';
import { DecisionMakersPage } from '../pages/DecisionMakersPage';
import { ActivitiesPage } from '../pages/ActivitiesPage';
import { EmailTemplatesPage } from '../pages/EmailTemplatesPage';
import { SettingsPage } from '../pages/SettingsPage';

export function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="businesses" element={<BusinessesPage />} />
          <Route path="decision-makers" element={<DecisionMakersPage />} />
          <Route path="activities" element={<ActivitiesPage />} />
          <Route path="email-templates" element={<EmailTemplatesPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
