import { useQuery } from "@tanstack/react-query";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useState } from "react";
import { Task } from "@shared/schema";

export default function Calendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState("month");

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['/api/tasks'],
  });

  const getDayTasks = (day: Date) => {
    if (!tasks) return [];
    return tasks.filter((task: Task) => {
      if (!task.startDate) return false;
      // Safely create date object and handle potential issues
      try {
        const taskDate = new Date(task.startDate);
        // Check if taskDate is a valid date before using getDate(), etc.
        if (isNaN(taskDate.getTime())) return false;
        return (
          taskDate.getDate() === day.getDate() &&
          taskDate.getMonth() === day.getMonth() &&
          taskDate.getFullYear() === day.getFullYear()
        );
      } catch (error) {
        console.error("Error parsing date:", error);
        return false;
      }
    });
  };

  const getTaskColor = (status: string) => {
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
        return "bg-muted";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <Select value={view} onValueChange={setView}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="View" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Month</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="day">Day</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[400px] w-full" />
            ) : (
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
                components={{
                  DayContent: ({ day }) => {
                    const dayTasks = getDayTasks(day);
                    return (
                      <>
                        <div>{day.getDate()}</div>
                        {dayTasks.length > 0 && (
                          <div className="flex mt-1 flex-wrap gap-1">
                            {dayTasks.slice(0, 3).map((task) => (
                              <div 
                                key={task.id} 
                                className={`h-1 w-1 rounded-full ${getTaskColor(task.status)}`} 
                              />
                            ))}
                            {dayTasks.length > 3 && (
                              <div className="text-[8px] text-muted-foreground">
                                +{dayTasks.length - 3}
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    );
                  }
                }}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {date ? date.toLocaleDateString(undefined, { 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              }) : "Select a date"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : date ? (
              <>
                {getDayTasks(date).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No tasks scheduled for this day
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getDayTasks(date).map((task: Task) => (
                      <div key={task.id} className="p-3 bg-muted/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getTaskColor(task.status)}`} />
                          <p className="font-medium">{task.title}</p>
                        </div>
                        {task.startDate && task.endDate && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(task.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            {" - "}
                            {new Date(task.endDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select a date to view tasks
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
