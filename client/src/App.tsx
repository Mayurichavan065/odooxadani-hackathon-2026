import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";

// Pages
import EquipmentListPage from "@/pages/equipment/EquipmentListPage";
import EquipmentDetailPage from "@/pages/equipment/EquipmentDetailPage";
import EquipmentFormPage from "@/pages/equipment/EquipmentFormPage";
import TeamsListPage from "@/pages/teams/TeamsListPage";
import TeamFormPage from "@/pages/teams/TeamFormPage";
import RequestsListPage from "@/pages/requests/RequestsListPage";
import RequestDetailPage from "@/pages/requests/RequestDetailPage";
import RequestFormPage from "@/pages/requests/RequestFormPage";
import KanbanBoard from "@/pages/requests/KanbanBoard";
import CalendarPage from "@/pages/calendar/CalendarPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/kanban" replace />} />
            
            {/* Kanban Board */}
            <Route path="/kanban" element={<KanbanBoard />} />
            
            {/* Equipment */}
            <Route path="/equipment" element={<EquipmentListPage />} />
            <Route path="/equipment/new" element={<EquipmentFormPage />} />
            <Route path="/equipment/:id" element={<EquipmentDetailPage />} />
            <Route path="/equipment/:id/edit" element={<EquipmentFormPage />} />
            
            {/* Teams */}
            <Route path="/teams" element={<TeamsListPage />} />
            <Route path="/teams/new" element={<TeamFormPage />} />
            <Route path="/teams/:id/edit" element={<TeamFormPage />} />
            
            {/* Requests */}
            <Route path="/requests" element={<RequestsListPage />} />
            <Route path="/requests/new" element={<RequestFormPage />} />
            <Route path="/requests/:id" element={<RequestDetailPage />} />
            <Route path="/requests/:id/edit" element={<RequestFormPage />} />
            
            {/* Calendar */}
            <Route path="/calendar" element={<CalendarPage />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
