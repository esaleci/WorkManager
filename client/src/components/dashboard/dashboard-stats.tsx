import { Card } from "@/components/ui/card";

interface DashboardStatsProps {
  stats: {
    tasks: {
      completed: number;
      total: number;
    };
    budget: {
      total: number;
      paid: number;
    };
    hours: {
      tracked: number;
      total: number;
    };
  };
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  if (!stats) return null;

  const { tasks, budget, hours } = stats;
  
  const tasksPercentage = tasks.total > 0 ? (tasks.completed / tasks.total) * 100 : 0;
  const budgetPercentage = budget.total > 0 ? (budget.paid / budget.total) * 100 : 0;
  const hoursPercentage = hours.total > 0 ? (hours.tracked / hours.total) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="bg-white p-4 border border-neutral-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-neutral-500">Tasks Completed</h3>
          <span className="text-xs bg-green-100 text-success-500 px-2 py-0.5 rounded-full">
            {tasksPercentage > 0 && `+${tasksPercentage.toFixed(1)}%`}
          </span>
        </div>
        <div className="flex items-baseline">
          <span className="text-2xl font-bold text-neutral-800">{tasks.completed}</span>
          <span className="text-sm text-neutral-500 ml-1">/ {tasks.total}</span>
        </div>
        <div className="mt-2 w-full bg-neutral-100 rounded-full h-2">
          <div 
            className="bg-success-500 h-2 rounded-full" 
            style={{ width: `${tasksPercentage}%` }}
          ></div>
        </div>
      </Card>
      
      <Card className="bg-white p-4 border border-neutral-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-neutral-500">Total Budget</h3>
          <span className="text-xs bg-blue-100 text-primary-500 px-2 py-0.5 rounded-full">
            On Track
          </span>
        </div>
        <div className="flex items-baseline">
          <span className="text-2xl font-bold text-neutral-800">${budget.paid.toFixed(0)}</span>
          <span className="text-sm text-neutral-500 ml-1">/ ${budget.total.toFixed(0)}</span>
        </div>
        <div className="mt-2 w-full bg-neutral-100 rounded-full h-2">
          <div 
            className="bg-primary-500 h-2 rounded-full" 
            style={{ width: `${budgetPercentage}%` }}
          ></div>
        </div>
      </Card>
      
      <Card className="bg-white p-4 border border-neutral-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-neutral-500">Hours Tracked</h3>
          <span className="text-xs bg-yellow-100 text-warning-500 px-2 py-0.5 rounded-full">
            This Week
          </span>
        </div>
        <div className="flex items-baseline">
          <span className="text-2xl font-bold text-neutral-800">{hours.tracked}h</span>
          <span className="text-sm text-neutral-500 ml-1">/ {hours.total}h</span>
        </div>
        <div className="mt-2 w-full bg-neutral-100 rounded-full h-2">
          <div 
            className="bg-warning-500 h-2 rounded-full" 
            style={{ width: `${hoursPercentage}%` }}
          ></div>
        </div>
      </Card>
    </div>
  );
}
