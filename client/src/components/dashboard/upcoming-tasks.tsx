import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MoreVertical } from "lucide-react";
import { format, addDays, startOfDay, isSameDay } from "date-fns";
import { Task } from "@shared/schema";

interface UpcomingTasksProps {
  tasks: Task[];
  onTaskSelect: (taskId: number) => void;
}

export default function UpcomingTasks({ tasks, onTaskSelect }: UpcomingTasksProps) {
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const dayAfterTomorrow = addDays(today, 2);
  
  // Group tasks by day
  const getTasksByDay = (date: Date) => {
    return tasks.filter(task => {
      if (!task.startDate) return false;
      const taskDate = startOfDay(new Date(task.startDate));
      return isSameDay(taskDate, date);
    });
  };
  
  const tomorrowTasks = getTasksByDay(tomorrow);
  const dayAfterTomorrowTasks = getTasksByDay(dayAfterTomorrow);
  
  const formatShortTime = (date: string | Date) => {
    return format(new Date(date), "h:mm a");
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success-500";
      case "in-progress":
        return "bg-primary-500";
      case "on-hold":
        return "bg-warning-500";
      case "cancelled":
        return "bg-danger-500";
      default:
        return "bg-neutral-500";
    }
  };
  
  const getTagColor = (workspaceId: number) => {
    switch (workspaceId) {
      case 1: // Marketing
        return "bg-blue-100 text-primary-500";
      case 2: // Development
        return "bg-green-100 text-success-500";
      case 3: // Sales
        return "bg-orange-100 text-warning-500";
      default:
        return "bg-neutral-100 text-neutral-500";
    }
  };
  
  const renderTaskCard = (task: Task) => (
    <div 
      key={task.id} 
      className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 min-w-[240px] flex-shrink-0 cursor-pointer"
      onClick={() => onTaskSelect(task.id)}
    >
      <div className="flex items-center justify-between mb-2">
        {task.startDate && (
          <span className={`text-xs font-medium px-2 py-1 ${getTagColor(task.workspaceId)} rounded-full`}>
            {formatShortTime(task.startDate)}
          </span>
        )}
        <div className={`w-5 h-5 rounded-full ${getStatusColor(task.status)} flex items-center justify-center`}>
          <i className="ri-briefcase-4-line text-xs text-white"></i>
        </div>
      </div>
      <h3 className="font-medium text-neutral-800">{task.title}</h3>
      <p className="text-sm text-neutral-500 mt-1 truncate">
        {task.description || "No description"}
      </p>
      <div className="flex items-center mt-3">
        <div className="flex -space-x-1">
          <Avatar className="w-6 h-6 border-2 border-white">
            <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb" />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
          <Avatar className="w-6 h-6 border-2 border-white">
            <AvatarImage src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e" />
            <AvatarFallback>MT</AvatarFallback>
          </Avatar>
        </div>
        {/* Add more if needed */}
      </div>
    </div>
  );
  
  return (
    <Card className="bg-white rounded-lg border border-neutral-200 overflow-hidden mt-6">
      <div className="flex items-center justify-between p-4 border-b border-neutral-200">
        <h2 className="font-semibold text-lg text-neutral-800">Upcoming Tasks</h2>
        <div className="flex items-center space-x-2">
          <button className="p-1.5 text-neutral-500 hover:bg-neutral-100 rounded-md">
            <Calendar className="h-4 w-4" />
          </button>
          <button className="p-1.5 text-neutral-500 hover:bg-neutral-100 rounded-md">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <CardContent className="p-4">
        {(tomorrowTasks.length === 0 && dayAfterTomorrowTasks.length === 0) ? (
          <div className="text-center py-6 text-muted-foreground">
            No upcoming tasks for the next few days
          </div>
        ) : (
          <>
            {tomorrowTasks.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-neutral-500 mb-2">
                  Tomorrow - {format(tomorrow, "MMM dd")}
                </h3>
                <div className="flex flex-nowrap overflow-x-auto pb-2 scrollbar-hide gap-4">
                  {tomorrowTasks.map(renderTaskCard)}
                </div>
              </div>
            )}
            
            {dayAfterTomorrowTasks.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-neutral-500 mb-2">
                  {format(dayAfterTomorrow, "MMM dd")} - {format(dayAfterTomorrow, "EEEE")}
                </h3>
                <div className="flex flex-nowrap overflow-x-auto pb-2 scrollbar-hide gap-4">
                  {dayAfterTomorrowTasks.map(renderTaskCard)}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
