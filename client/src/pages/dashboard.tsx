import { useQuery } from "@tanstack/react-query";
import DashboardStats from "@/components/dashboard/dashboard-stats";
import TodaysTasks from "@/components/dashboard/todays-tasks";
import UpcomingTasks from "@/components/dashboard/upcoming-tasks";
import WeeklyAvailability from "@/components/dashboard/weekly-availability";
import ProgressChart from "@/components/dashboard/progress-chart";
import FinancialSummary from "@/components/dashboard/financial-summary";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardProps {
  onTaskSelect: (taskId: number) => void;
}

export default function Dashboard({ onTaskSelect }: DashboardProps) {
  const { data: dashboardStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: todayTasks, isLoading: isLoadingTodayTasks } = useQuery({
    queryKey: ['/api/tasks/today'],
  });

  const { data: upcomingTasks, isLoading: isLoadingUpcomingTasks } = useQuery({
    queryKey: ['/api/tasks/upcoming'],
  });

  return (
    <div>
      {isLoadingStats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : (
        <DashboardStats stats={dashboardStats} />
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          {isLoadingTodayTasks ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <TodaysTasks tasks={todayTasks || []} onTaskSelect={onTaskSelect} />
          )}
          
          {isLoadingUpcomingTasks ? (
            <Skeleton className="h-72 w-full mt-6" />
          ) : (
            <UpcomingTasks tasks={upcomingTasks || []} onTaskSelect={onTaskSelect} />
          )}
        </div>
        
        <div className="space-y-6">
          <WeeklyAvailability />
          <ProgressChart />
          <FinancialSummary budget={dashboardStats?.budget} />
        </div>
      </div>
    </div>
  );
}
