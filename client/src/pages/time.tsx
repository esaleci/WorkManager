import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Play,
  Pause,
  Plus,
  Clock,
  Calendar,
  BarChart2,
} from "lucide-react";
import { formatDate, formatDuration } from "@/lib/api";

export default function TimeTracking() {
  const [activeTask, setActiveTask] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState("this-week");

  const { data: tasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['/api/tasks'],
  });

  // Time tracking data - in a real app, this would come from API
  const timeEntries = [
    {
      id: 1,
      taskId: 1,
      taskName: "Client meeting for website redesign",
      date: new Date(2023, 3, 15),
      duration: 5400, // 1.5 hours in seconds
      notes: "Initial consultation meeting with client team"
    },
    {
      id: 2,
      taskId: 2,
      taskName: "Prepare Q4 budget proposal",
      date: new Date(2023, 3, 16),
      duration: 3600, // 1 hour in seconds
      notes: "Compiled financial data for budget proposal"
    },
    {
      id: 3,
      taskId: 3,
      taskName: "Team stand-up meeting",
      date: new Date(2023, 3, 16),
      duration: 1800, // 30 minutes in seconds
      notes: "Daily team stand-up"
    },
  ];

  const toggleTimer = (taskId: number) => {
    if (activeTask === taskId && timerActive) {
      // Stop timer
      setTimerActive(false);
    } else {
      // Start or switch timer
      setActiveTask(taskId);
      setTimerActive(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Time Tracking</h1>
        <div className="flex items-center space-x-2">
          <Select value={selectedWeek} onValueChange={setSelectedWeek}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="last-week">Last Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Manual Entry
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle>Time Log</CardTitle>
            <CardDescription>
              View and manage your tracked time across tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        {entry.taskName}
                      </TableCell>
                      <TableCell>{formatDate(entry.date)}</TableCell>
                      <TableCell>{formatDuration(entry.duration)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {entry.notes}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleTimer(entry.taskId)}
                          className={
                            activeTask === entry.taskId && timerActive
                              ? "text-red-500 hover:text-red-600"
                              : "text-primary-500 hover:text-primary-600"
                          }
                        >
                          {activeTask === entry.taskId && timerActive ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {timeEntries.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No time entries recorded
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" /> Time Worked This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              10h 45m
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Out of 40 hour target
            </div>
            <div className="mt-2 w-full bg-neutral-100 rounded-full h-2.5">
              <div className="bg-primary h-2.5 rounded-full" style={{ width: '26.9%' }}></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" /> Most Time On
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium mb-1">Client meeting for website redesign</div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">4h 30m</span>
                  <span className="text-primary-500">30%</span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-2 mt-1">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-1">Prepare Q4 budget proposal</div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">3h 15m</span>
                  <span className="text-primary-500">22%</span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-2 mt-1">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '22%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart2 className="h-5 w-5 mr-2" /> Time Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium mb-1">Marketing</div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">6h 15m</span>
                  <span className="text-primary-500">58%</span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-2 mt-1">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '58%' }}></div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-1">Development</div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">3h 30m</span>
                  <span className="text-success-500">32%</span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-2 mt-1">
                  <div className="bg-success-500 h-2 rounded-full" style={{ width: '32%' }}></div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-1">Sales</div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">1h 00m</span>
                  <span className="text-warning-500">10%</span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-2 mt-1">
                  <div className="bg-warning-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}