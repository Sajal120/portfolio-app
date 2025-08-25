import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster as HotToaster } from 'react-hot-toast';
import AdminProjects from "./pages/AdminProjects";
import AdminAbout from "./pages/AdminAbout";
import AdminSkills from "./pages/AdminSkills";
import AdminContactInfo from "./pages/AdminContactInfo";
import AdminMessages from "./pages/AdminMessages";
import AdminMedia from "./pages/AdminMedia";
import AdminContactSection from "./pages/AdminContactSection";
import DataSeeder from "./pages/DataSeeder";
import SupabaseTest from "./pages/SupabaseTest";
import DebugAuth from "./pages/DebugAuth";
import DirectLogin from "./pages/DirectLogin";
import SupabaseConnectionTest from "./pages/SupabaseConnectionTest";
import QuickTest from "./pages/QuickTest";
import DataTest from "./pages/DataTest";
import SimpleAdminDashboard from "./pages/SimpleAdminDashboard";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLogin from "./components/AdminLogin";
import SimpleAdminLogin from "./components/SimpleAdminLogin";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminHero from "./pages/AdminHero";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <HotToaster 
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(0, 0, 0, 0.8)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
            },
          }}
        />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/test" element={<SupabaseTest />} />
            <Route path="/debug" element={<DebugAuth />} />
            <Route path="/direct-login" element={<DirectLogin />} />
            <Route path="/connection-test" element={<SupabaseConnectionTest />} />
            <Route path="/quick-test" element={<QuickTest />} />
            <Route path="/data-test" element={<DataTest />} />
            <Route path="/simple-dashboard" element={<SimpleAdminDashboard />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/simple-login" element={<SimpleAdminLogin />} />
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="hero" element={<AdminHero />} />
              <Route path="about" element={<AdminAbout />} />
              <Route path="skills" element={<AdminSkills />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="contact" element={<AdminContactInfo />} />
              <Route path="contact-section" element={<AdminContactSection />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="media" element={<AdminMedia />} />
              <Route path="seeder" element={<DataSeeder />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
