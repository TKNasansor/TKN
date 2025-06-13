import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import BuildingsPage from './pages/BuildingsPage';
import BuildingDetailsPage from './pages/BuildingDetailsPage';
import PartsPage from './pages/PartsPage';
import UpdatesPage from './pages/UpdatesPage';
import DefectiveElevatorsPage from './pages/DefectiveElevatorsPage';
import MonthlyIncomePage from './pages/MonthlyIncomePage';
import MonthlyPartsPage from './pages/MonthlyPartsPage';
import SettingsPage from './pages/SettingsPage';
import FaultReportPage from './pages/FaultReportPage';
import FaultReportsPage from './pages/FaultReportsPage';
import PrintersPage from './pages/PrintersPage';
import BulkSMSPage from './pages/BulkSMSPage';
import ProposalsPage from './pages/ProposalsPage';
import ProposalTypePage from './pages/ProposalTypePage';
import MaintenanceStatsPage from './pages/MaintenanceStatsPage';
import PaymentsPage from './pages/PaymentsPage';

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/report-fault/:id" element={<FaultReportPage />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="/buildings" element={<BuildingsPage />} />
            <Route path="/buildings/:id" element={<BuildingDetailsPage />} />
            <Route path="/parts" element={<PartsPage />} />
            <Route path="/updates" element={<UpdatesPage />} />
            <Route path="/defective" element={<DefectiveElevatorsPage />} />
            <Route path="/fault-reports" element={<FaultReportsPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/printers" element={<PrintersPage />} />
            <Route path="/bulk-sms" element={<BulkSMSPage />} />
            <Route path="/proposals" element={<ProposalsPage />} />
            <Route path="/proposals/:type" element={<ProposalTypePage />} />
            <Route path="/maintenance-stats" element={<MaintenanceStatsPage />} />
            <Route path="/monthly-income" element={<MonthlyIncomePage />} />
            <Route path="/monthly-parts" element={<MonthlyPartsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;