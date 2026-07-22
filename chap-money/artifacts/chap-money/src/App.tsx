import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, Redirect, useLocation } from 'wouter';

import Checkout from '@/pages/Checkout';
import Status from '@/pages/Status';
import Success from '@/pages/Success';
import Cancelled from '@/pages/Cancelled';
import Callback from '@/pages/Callback';

import Login from '@/pages/admin/Login';
import AdminLayout from '@/pages/admin/Layout';
import Dashboard from '@/pages/admin/Dashboard';
import Sites from '@/pages/admin/Sites';
import Payments from '@/pages/admin/Payments';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import { AdminSiteProvider } from '@/pages/admin/AdminSiteContext';
import AdminDataPage from '@/pages/admin/AdminDataPage';

const queryClient = new QueryClient();

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAdminAuth();
  const [location] = useLocation();
  if (!isAuthenticated) {
    return <Redirect to={`/demain/login?next=${encodeURIComponent(location)}`} />;
  }
    return (
      <AdminSiteProvider>
        <AdminLayout>{children}</AdminLayout>
      </AdminSiteProvider>
    );
}

function Router() {
  const { isAuthenticated, login } = useAdminAuth();
  const [, navigate] = useLocation();

  return (
    <Switch>
      {/* Public checkout routes */}
      <Route path="/" component={Checkout} />
      <Route path="/callback" component={Callback} />
      <Route path="/status/:transactionId" component={Status} />
      <Route path="/success" component={Success} />
      <Route path="/cancelled" component={Cancelled} />

      {/* Admin login */}
      <Route path="/demain/login">
        {isAuthenticated ? (
          <Redirect to="/demain/dashboard" />
        ) : (
          <Login onSuccess={() => navigate('/demain/dashboard')} />
        )}
      </Route>

      {/* Admin root redirect */}
      <Route path="/demain">
        <Redirect to="/demain/dashboard" />
      </Route>

      {/* Protected admin pages */}
      <Route path="/demain/dashboard">
        <AdminGuard><Dashboard /></AdminGuard>
      </Route>
      <Route path="/demain/sites">
        <AdminGuard><Sites /></AdminGuard>
      </Route>
      <Route path="/demain/payments">
        <AdminGuard><Payments /></AdminGuard>
      </Route>
      <Route path="/demain/deposits">
        <AdminGuard><AdminDataPage kind="deposit" /></AdminGuard>
      </Route>
      <Route path="/demain/withdrawals">
        <AdminGuard><AdminDataPage kind="withdrawal" /></AdminGuard>
      </Route>
      <Route path="/demain/users">
        <AdminGuard><AdminDataPage kind="users" /></AdminGuard>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster richColors position="top-center" />
        <PWAInstallPrompt />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;