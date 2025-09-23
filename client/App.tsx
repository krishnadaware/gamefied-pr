import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Student from "./pages/dashboard/Student";
import Teacher from "./pages/dashboard/Teacher";
import Parent from "./pages/dashboard/Parent";
import HeroStudio from "./pages/HeroStudio";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Layout><Login /></Layout>} />
          <Route path="/dashboard/student" element={<Layout><Student /></Layout>} />
          <Route path="/dashboard/teacher" element={<Layout><Teacher /></Layout>} />
          <Route path="/dashboard/parent" element={<Layout><Parent /></Layout>} />
          <Route path="/hero" element={<Layout><HeroStudio /></Layout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
