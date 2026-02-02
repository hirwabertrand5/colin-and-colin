import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import ResetPassword from './components/auth/ResetPassword';
import DashboardLayout from './components/layout/DashboardLayout';
import ManagingPartnerDashboard from './components/dashboards/ManagingPartnerDashboard';
import AssociateDashboard from './components/dashboards/AssociateDashboard';
import ExecutiveAssistantDashboard from './components/dashboards/ExecutiveAssistantDashboard';
import CaseList from './components/cases/CaseList';
import CreateCase from './components/cases/CreateCase';
import CaseWorkspace from './components/cases/CaseWorkspace';
import TaskBoard from './components/tasks/TaskBoard';
import TaskDetail from './components/tasks/TaskDetail';
import Calendar from './components/calendar/Calendar';
import NotificationCenter from './components/notifications/NotificationCenter';
import BillingDashboard from './components/billing/BillingDashboard';
import InvoiceManagement from './components/billing/InvoiceManagement';
import PerformanceDashboard from './components/reports/PerformanceDashboard';
import FirmReports from './components/reports/FirmReports';
import UserManagement from './components/admin/UserManagement';
import WorkflowConfig from './components/admin/WorkflowConfig';
import Settings from './components/admin/Settings';
import HelpCenter from './components/help/HelpCenter';

export type UserRole = 'managing_partner' | 'associate' | 'executive_assistant';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (user: User) => {
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} 
        />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            user ? (
              <DashboardLayout user={user} onLogout={handleLogout}>
                <Routes>
                  {/* Role-based Dashboard Routing */}
                  <Route 
                    path="/" 
                    element={
                      user.role === 'managing_partner' ? <ManagingPartnerDashboard /> :
                      user.role === 'associate' ? <AssociateDashboard /> :
                      <ExecutiveAssistantDashboard />
                    } 
                  />
                  
                  {/* Case Management */}
                  <Route path="/cases" element={<CaseList userRole={user.role} />} />
                  <Route path="/cases/new" element={<CreateCase />} />
                  <Route path="/cases/:id/*" element={<CaseWorkspace userRole={user.role} />} />
                  
                  {/* Task Management */}
                  <Route path="/tasks" element={<TaskBoard userRole={user.role} />} />
                  <Route path="/tasks/:id" element={<TaskDetail userRole={user.role} />} />
                  
                  {/* Calendar */}
                  <Route path="/calendar" element={<Calendar userRole={user.role} />} />
                  
                  {/* Notifications */}
                  <Route path="/notifications" element={<NotificationCenter />} />
                  
                  {/* Billing & Finance */}
                  <Route path="/billing" element={<BillingDashboard userRole={user.role} />} />
                  <Route path="/billing/invoices" element={<InvoiceManagement userRole={user.role} />} />
                  
                  {/* Performance & Reporting */}
                  <Route path="/performance" element={<PerformanceDashboard userRole={user.role} />} />
                  <Route path="/reports" element={<FirmReports userRole={user.role} />} />
                  
                  {/* Administration */}
                  {user.role === 'managing_partner' && (
                    <>
                      <Route path="/admin/users" element={<UserManagement />} />
                      <Route path="/admin/workflows" element={<WorkflowConfig />} />
                      <Route path="/admin/settings" element={<Settings />} />
                    </>
                  )}
                  
                  {/* Help & Support */}
                  <Route path="/help" element={<HelpCenter />} />
                </Routes>
              </DashboardLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
