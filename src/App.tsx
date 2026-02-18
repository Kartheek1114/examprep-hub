import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Exams from "./pages/Exams";
import ExamDetail from "./pages/ExamDetail";
import Practice from "./pages/Practice";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import AdminUpload from "./pages/AdminUpload";
import Contact from "./pages/Contact";

import { useNavigate, Link, useLocation } from "react-router-dom";
import PageLoader from "./components/PageLoader";

const queryClient = new QueryClient();

const NavigationLoader = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Start loading on route change
    setIsLoading(true);

    // Add artificial delay for "premium feel"
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      {isLoading && <PageLoader />}
      <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </div>
    </>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  const userEmail = localStorage.getItem("userEmail");
  const adminEmail = "kartheek04112004@gmail.com";

  if (!token || !userEmail || userEmail.toLowerCase().trim() !== adminEmail.toLowerCase().trim()) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <NavigationLoader>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/exams" element={<ProtectedRoute><Exams /></ProtectedRoute>} />
            <Route path="/exams/:examId" element={<ProtectedRoute><ExamDetail /></ProtectedRoute>} />
            <Route path="/practice" element={<ProtectedRoute><Practice /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin/upload" element={<AdminRoute><AdminUpload /></AdminRoute>} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </NavigationLoader>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
