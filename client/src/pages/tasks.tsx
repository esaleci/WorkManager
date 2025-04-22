import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TaskDetailModal } from "@/components/tasks/task-detail-modal";
import { TaskForm } from "@/components/tasks/task-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CheckCircle2,
  Clock,
  MoreVertical,
  PlusCircle,
  AlertCircle,
  Pause,
  Ban,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { Task, TaskStatusEnum } from "@shared/schema";

interface TasksProps {
  onTaskSelect: (taskId: number) => void;
}

export default function Tasks({ onTaskSelect }: TasksProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['/api/tasks'],
  });

  const getFilteredTasks = (status?: string) => {
    if (!tasks) return [];
    if (!status || status === "all") return tasks;
    return tasks.filter((task: Task) => task.status === status);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case TaskStatusEnum.COMPLETED:
        return <CheckCircle2 className="h-4 w-4 text-success-500" />;
      case TaskStatusEnum.IN_PROGRESS:
        return <Clock className="h-4 w-4 text-primary-500" />;
      case TaskStatusEnum.ON_HOLD:
        return <Pause className="h-4 w-4 text-warning-500" />;
      case TaskStatusEnum.CANCELLED:
        return <Ban className="h-4 w-4 text-danger-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "No date";
    const taskDate = new Date(date);
    return `${taskDate.toLocaleDateString()} ${taskDate.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Tasks</CardTitle>
          <CardDescription>
            View and manage all your tasks
          </CardDescription>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <TaskForm onSuccess={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="to-do">To Do</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Status</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="w-28">Priority</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredTasks(activeTab).map((task: Task) => (
                    <TableRow 
                      key={task.id} 
                      onClick={() => onTaskSelect(task.id)}
                      className="cursor-pointer"
                    >
                      <TableCell>
                        {getStatusIcon(task.status)}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {task.description || "No description"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {task.endDate ? (
                          <div>
                            <div className="font-medium">{formatDate(task.endDate)}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(task.endDate), { addSuffix: true })}
                            </div>
                          </div>
                        ) : (
                          "No deadline"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          task.priority === "high" ? "destructive" : 
                          task.priority === "medium" ? "default" : 
                          "outline"
                        }>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {task.totalBudget ? (
                          <div>
                            <div className="font-medium">${task.totalBudget.toFixed(2)}</div>
                            <div className="text-xs text-muted-foreground">
                              Paid: ${task.paidAmount?.toFixed(2) || "0.00"}
                            </div>
                          </div>
                        ) : (
                          "No budget"
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              onTaskSelect(task.id);
                            }}>
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem>Edit task</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              Delete task
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
