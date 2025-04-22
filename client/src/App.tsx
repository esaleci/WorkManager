import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Tasks from "@/pages/tasks";
import Calendar from "@/pages/calendar";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { TaskDetailModal } from "@/components/tasks/task-detail-modal";
import { useQuery } from "@tanstack/react-query";

function Router() {
  const [location, setLocation] = useLocation();
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  return (
    <div className="h-screen overflow-hidden flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={getPageTitle(location)} />
        <TaskDetailModal 
          isOpen={selectedTaskId !== null} 
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)} 
        />
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-4">
          <Switch>
            <Route path="/" component={() => <Dashboard onTaskSelect={setSelectedTaskId} />} />
            <Route path="/tasks" component={() => <Tasks onTaskSelect={setSelectedTaskId} />} />
            <Route path="/calendar" component={Calendar} />
            <Route path="/reports" component={Reports} />
            <Route path="/settings" component={Settings} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function getPageTitle(location: string): string {
  switch (location) {
    case "/":
      return "Dashboard";
    case "/tasks":
      return "My Tasks";
    case "/calendar":
      return "Calendar";
    case "/reports":
      return "Reports";
    case "/settings":
      return "Settings";
    default:
      return "WorkFlow";
  }
}

function App() {
  // Pre-fetch current user on app load
  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ['/api/me'],
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
