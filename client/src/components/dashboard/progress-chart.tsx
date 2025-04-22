import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Task } from "@shared/schema";

export default function ProgressChart() {
  const [timeframe, setTimeframe] = useState("week");
  
  const { data: tasks } = useQuery({
    queryKey: ['/api/tasks'],
  });
  
  // Calculate the chart data
  const calculateStats = () => {
    if (!tasks) return { completed: 0, inProgress: 0, overdue: 0 };
    
    const completed = tasks.filter((task: Task) => task.status === "completed").length;
    const inProgress = tasks.filter((task: Task) => task.status === "in-progress").length;
    
    // For demo purposes, we'll consider any task that has endDate in the past and is not completed
    const now = new Date();
    const overdue = tasks.filter((task: Task) => {
      if (!task.endDate || task.status === "completed") return false;
      return new Date(task.endDate) < now && task.status !== "completed";
    }).length;
    
    const total = tasks.length;
    
    return {
      completed: total > 0 ? Math.round((completed / total) * 100) : 0,
      inProgress: total > 0 ? Math.round((inProgress / total) * 100) : 0,
      overdue: total > 0 ? Math.round((overdue / total) * 100) : 0,
    };
  };
  
  const { completed, inProgress, overdue } = calculateStats();
  
  // Mock project progress data
  const projects = [
    { name: "Marketing Campaign", progress: 70, color: "bg-primary-500" },
    { name: "Website Redesign", progress: 45, color: "bg-warning-500" },
    { name: "Product Launch", progress: 85, color: "bg-success-500" },
  ];
  
  return (
    <Card className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-neutral-200">
        <h2 className="font-semibold text-lg text-neutral-800">Work Progress</h2>
        <div className="flex items-center space-x-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="text-sm border-none rounded-md bg-neutral-50 text-neutral-600 py-1 pl-2 pr-6 focus:outline-none focus:ring-2 focus:ring-primary h-8 w-[120px]">
              <SelectValue placeholder="This Week" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between mb-6">
          <div className="text-center">
            <div className="relative inline-block">
              <svg className="w-20 h-20" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="#ebedf5" strokeWidth="3" />
                <circle 
                  cx="18" 
                  cy="18" 
                  r="15" 
                  fill="none" 
                  stroke="#00c875" 
                  strokeWidth="3" 
                  strokeDasharray={`${completed} ${100 - completed}`} 
                  strokeDashoffset="25" 
                  transform="rotate(-90 18 18)" 
                />
                <text 
                  x="18" 
                  y="18" 
                  textAnchor="middle" 
                  dominantBaseline="central" 
                  fontSize="8" 
                  fontWeight="bold" 
                  fill="#323338"
                >
                  {completed}%
                </text>
              </svg>
            </div>
            <p className="text-sm font-medium text-neutral-800 mt-1">Completed</p>
          </div>
          
          <div className="text-center">
            <div className="relative inline-block">
              <svg className="w-20 h-20" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="#ebedf5" strokeWidth="3" />
                <circle 
                  cx="18" 
                  cy="18" 
                  r="15" 
                  fill="none" 
                  stroke="#fdab3d" 
                  strokeWidth="3" 
                  strokeDasharray={`${inProgress} ${100 - inProgress}`} 
                  strokeDashoffset="25" 
                  transform="rotate(-90 18 18)" 
                />
                <text 
                  x="18" 
                  y="18" 
                  textAnchor="middle" 
                  dominantBaseline="central" 
                  fontSize="8" 
                  fontWeight="bold" 
                  fill="#323338"
                >
                  {inProgress}%
                </text>
              </svg>
            </div>
            <p className="text-sm font-medium text-neutral-800 mt-1">In Progress</p>
          </div>
          
          <div className="text-center">
            <div className="relative inline-block">
              <svg className="w-20 h-20" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="#ebedf5" strokeWidth="3" />
                <circle 
                  cx="18" 
                  cy="18" 
                  r="15" 
                  fill="none" 
                  stroke="#e44258" 
                  strokeWidth="3" 
                  strokeDasharray={`${overdue} ${100 - overdue}`} 
                  strokeDashoffset="25" 
                  transform="rotate(-90 18 18)" 
                />
                <text 
                  x="18" 
                  y="18" 
                  textAnchor="middle" 
                  dominantBaseline="central" 
                  fontSize="8" 
                  fontWeight="bold" 
                  fill="#323338"
                >
                  {overdue}%
                </text>
              </svg>
            </div>
            <p className="text-sm font-medium text-neutral-800 mt-1">Overdue</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {projects.map((project) => (
            <div key={project.name}>
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm font-medium text-neutral-700">{project.name}</div>
                <div className="text-sm text-neutral-600">{project.progress}%</div>
              </div>
              <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${project.color}`} 
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
