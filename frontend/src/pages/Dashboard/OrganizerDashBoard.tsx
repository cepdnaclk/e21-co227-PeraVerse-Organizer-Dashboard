// OrganizerDashBoard.tsx

import  { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { useAuthCheck } from "../../utils/useAuthCheck";

// Import pages
import OverviewPage from "./OverviewPage";
import HeatmapsPage from "./HeatmapsPage";
import FeedbackPage from "./FeedbackPage";
import ExportPage from "./ExportPage";
import BuildingsPage from "./BuildingsPage";
import EventsPage from "./EventsPage";
import AlertsPage from "./AlertsPage";

// Import Organizer management components
import OrgMngWidget from "./OrgMngWidget";
import OrgMngPage from "./OrgMngPage";

interface OrganizerDashBoardProps {
  onLogout: () => void;
}

function OrganizerDashBoard({ onLogout }: OrganizerDashBoardProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Use our custom hook to check authentication and handle logout
  const { handleLogout } = useAuthCheck(onLogout);

  // Get the current date in a nice format
  const currentDate = new Date().toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header
          eventInfo={{
            title: "EngEx 2025 - PeraVerse Exhibition Management System by PeraCom",
            date: currentDate, // Dynamically updated date
            location: "Faculty of Engineering University of Peradeniya",
          }}
          userInfo={{
            name: "Organizer",
            role: "Admin",
          }}
          onLogout={handleLogout}
        />

        {/* Routes */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Routes>
            {/* Only redirect from /dashboard → /dashboard/overview */}
            <Route index element={<Navigate to="overview" replace />} />

            {/* Route Definitions */}
            <Route path="overview" element={<OverviewPage />} />
            <Route path="heatmaps" element={<HeatmapsPage />} />
            <Route path="feedback" element={<FeedbackPage />} />
            <Route path="export" element={<ExportPage />} />
            <Route path="buildings" element={<BuildingsPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="alerts" element={<AlertsPage />} />

            {/* Organizers routes */}
            <Route path="organizers" element={<OrgMngWidget />} />
            <Route path="organizers/:id" element={<OrgMngPage />} />

            {/* Optional: Fallback → only redirect if not already on a known page */}
            <Route path="*" element={<Navigate to="overview" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default OrganizerDashBoard;
