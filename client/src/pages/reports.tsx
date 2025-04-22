import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Task, TaskStatusEnum } from "@shared/schema";

export default function Reports() {
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['/api/tasks'],
  });

  // Count tasks by status
  const getTasksByStatus = () => {
    if (!tasks) return [];
    const statusCounts = {
      completed: 0,
      "in-progress": 0,
      "to-do": 0,
      "on-hold": 0,
      cancelled: 0,
    };

    tasks.forEach((task: Task) => {
      if (statusCounts[task.status as keyof typeof statusCounts] !== undefined) {
        statusCounts[task.status as keyof typeof statusCounts]++;
      }
    });

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1).replace("-", " "),
      value: count,
    }));
  };

  // Calculate budget allocation by workspace
  const getBudgetByWorkspace = () => {
    if (!tasks) return [];
    const workspaceBudgets = new Map<number, { name: string; totalBudget: number; paidAmount: number }>();

    tasks.forEach((task: Task) => {
      if (!workspaceBudgets.has(task.workspaceId)) {
        // Use a placeholder name since we don't have the actual workspace data here
        workspaceBudgets.set(task.workspaceId, { 
          name: `Workspace ${task.workspaceId}`, 
          totalBudget: 0, 
          paidAmount: 0 
        });
      }

      const current = workspaceBudgets.get(task.workspaceId)!;
      current.totalBudget += task.totalBudget || 0;
      current.paidAmount += task.paidAmount || 0;
      workspaceBudgets.set(task.workspaceId, current);
    });

    return Array.from(workspaceBudgets.values()).map((workspace) => ({
      name: workspace.name,
      'Total Budget': workspace.totalBudget,
      'Paid Amount': workspace.paidAmount,
      'Remaining': workspace.totalBudget - workspace.paidAmount,
    }));
  };

  // Calculate tasks progress over time (mock data)
  const getTasksOverTime = () => {
    // Generate mock data for the last 7 days
    const data = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateString = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      
      // Random values for demonstration
      data.push({
        date: dateString,
        'Completed': Math.floor(Math.random() * 10),
        'In Progress': Math.floor(Math.random() * 15),
        'To Do': Math.floor(Math.random() * 20),
      });
    }
    
    return data;
  };

  const COLORS = ['#00C875', '#0073EA', '#FDAB3D', '#E44258', '#999999'];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Reports & Analytics</h1>

      <Tabs defaultValue="tasks">
        <TabsList className="mb-4">
          <TabsTrigger value="tasks">Tasks Overview</TabsTrigger>
          <TabsTrigger value="budget">Budget Analysis</TabsTrigger>
          <TabsTrigger value="time">Time Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Tasks by Status</CardTitle>
                <CardDescription>Distribution of tasks across different status categories</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getTasksByStatus()}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getTasksByStatus().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tasks Trend</CardTitle>
                <CardDescription>Task completion trend over the past week</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getTasksOverTime()}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Completed" stackId="a" fill="#00C875" />
                      <Bar dataKey="In Progress" stackId="a" fill="#0073EA" />
                      <Bar dataKey="To Do" stackId="a" fill="#FDAB3D" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="budget">
          <Card>
            <CardHeader>
              <CardTitle>Budget Allocation by Workspace</CardTitle>
              <CardDescription>How the budget is distributed across different workspaces</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              {isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getBudgetByWorkspace()}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value}`} />
                    <Legend />
                    <Bar dataKey="Total Budget" fill="#0073EA" />
                    <Bar dataKey="Paid Amount" fill="#00C875" />
                    <Bar dataKey="Remaining" fill="#FDAB3D" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time">
          <Card>
            <CardHeader>
              <CardTitle>Time Tracking</CardTitle>
              <CardDescription>Hours tracked across different projects</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">
                  Time tracking data will be available soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
