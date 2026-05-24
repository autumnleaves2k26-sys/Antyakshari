import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import HomePage from "@/pages/Home";
import RegisterPage from "@/pages/Register";
import BookingPage from "@/pages/BookingStatus";
import AdminLoginPage from "@/pages/AdminLogin";
import AdminDashboardPage from "@/pages/AdminDashboard";
import ScanPage from "@/pages/Scan";
import NotFound from "@/pages/not-found";
import { setAuthTokenGetter } from "@workspace/api-client-react";

setAuthTokenGetter(() => localStorage.getItem("adminToken"));

const queryClient = new QueryClient();

function Router() {
  const [location] = useLocation();
  const showNavbar = location === "/" || location === "/register";

  return (
    <>
      {showNavbar && <Navbar />}
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/booking/:bookingId" component={BookingPage} />
        <Route path="/admin" component={AdminLoginPage} />
        <Route path="/admin/dashboard" component={AdminDashboardPage} />
        <Route path="/scan" component={ScanPage} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
