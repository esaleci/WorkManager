import { useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import {
  Filter,
  SortAsc,
  MoreVertical,
  Paperclip,
  MessageSquare,
  PlusCircle
} from "lucide-react";
import { Task } from "@shared/schema";
import { formatTime } from "@/lib/api";

interface TodaysTasksProps {
  tasks: Task[];
  onTaskSelect: (taskId: number) => void;
}

export default function TodaysTasks({ tasks, onTaskSelect }: TodaysTasksProps) {
  const queryClient = useQueryClient();

  const handleStatusChange = useCallback(async (taskId: number, isCompleted: boolean) => {
    try {
      await apiRequest('PATCH', `/api/tasks/${taskId}`, {
        status: isCompleted ? 'completed' : 'in-progress'
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  }, [queryClient]);

  const getTaskBorderColor = (status: string) => {
    switch (status) {
      case "completed":
        return "border-success-500";
      case "in-progress":
        return "border-primary-500";
      case "on-hold":
        return "border-warning-500";
      case "cancelled":
        return "border-danger-500";
      default:
        return "border-neutral-300";
    }
  };

  return (
    <Card className="bg-white border border-neutral-200 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-neutral-200">
        <h2 className="font-semibold text-lg text-neutral-800">Today's Tasks</h2>
        <div className="flex items-center space-x-2">
          <button className="p-1.5 text-neutral-500 hover:bg-neutral-100 rounded-md">
            <Filter className="h-4 w-4" />
          </button>
          <button className="p-1.5 text-neutral-500 hover:bg-neutral-100 rounded-md">
            <SortAsc className="h-4 w-4" />
          </button>
          <button className="p-1.5 text-neutral-500 hover:bg-neutral-100 rounded-md">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <CardContent className="p-2">
        {tasks.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No tasks scheduled for today
          </div>
        ) : (
          tasks.map((task) => (
            <div 
              key={task.id} 
              className={`p-2 hover:bg-neutral-50 rounded-md border-l-4 ${getTaskBorderColor(task.status)}`}
              onClick={() => onTaskSelect(task.id)}
            >
              <div className="flex items-center">
                <div className="mr-3">
                  <Checkbox 
                    checked={task.status === 'completed'}
                    onCheckedChange={(checked) => {
                      handleStatusChange(task.id, checked as boolean);
                    }}
                    onClick={(e) => e.stopPropagation()} // Prevent opening task modal
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-neutral-800">{task.title}</h3>
                    <div className="flex items-center">
                      {task.startDate && task.endDate && (
                        <span className="text-sm text-neutral-500 mr-2">
                          {formatTime(task.startDate)} - {formatTime(task.endDate)}
                        </span>
                      )}
                      <span className={`inline-block w-2 h-2 rounded-full ${
                        task.status === 'completed' ? 'bg-success-500' :
                        task.status === 'in-progress' ? 'bg-primary-500' : 
                        task.status === 'on-hold' ? 'bg-warning-500' : 
                        'bg-danger-500'
                      }`}></span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center">
                      <span className="inline-block px-2 py-0.5 bg-neutral-100 text-neutral-600 text-xs rounded mr-2">
                        {task.workspaceId === 1 ? 'Marketing' : 
                         task.workspaceId === 2 ? 'Development' : 'Sales'}
                      </span>
                      <div className="flex">
                        <Avatar className="w-6 h-6 border-2 border-white -ml-1 first:ml-0">
                          <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb" />
                          <AvatarFallback>SC</AvatarFallback>
                        </Avatar>
                        <Avatar className="w-6 h-6 border-2 border-white -ml-1">
                          <AvatarImage src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e" />
                          <AvatarFallback>MT</AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                    <div className="flex items-center text-neutral-400 text-sm">
                      <span className="mr-4">
                        <Paperclip className="h-3 w-3 inline mr-1" /> 2
                      </span>
                      <span>
                        <MessageSquare className="h-3 w-3 inline mr-1" /> 3
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        
        <div className="text-center py-4">
          <button className="text-primary hover:text-primary-600 text-sm font-medium flex items-center mx-auto">
            <PlusCircle className="h-4 w-4 mr-1" /> Add New Task
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
