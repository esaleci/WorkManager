import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { startOfWeek, endOfWeek, format, addDays, subDays, addWeeks, subWeeks } from "date-fns";
import { useState } from "react";

export default function WeeklyAvailability() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Calculate the start and end of the current week
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  
  // Format the date range for display
  const dateRangeText = `${format(weekStart, "MMMM d")} - ${format(weekEnd, "d, yyyy")}`;
  
  // Mock data for availability percentages
  const availabilityData = [
    { day: "Mon", available: 70, label: "70%" },
    { day: "Tue", available: 20, label: "20%" },
    { day: "Wed", available: 55, label: "55%" },
    { day: "Thu", available: 5, label: "5%" },
    { day: "Fri", available: 60, label: "60%" },
  ];
  
  // Calculate the color for each bar based on availability
  const getBarColor = (percentage: number) => {
    if (percentage >= 60) return "bg-success-500"; // Good availability
    if (percentage >= 30) return "bg-primary-500"; // Moderate availability
    if (percentage >= 10) return "bg-warning-500"; // Low availability
    return "bg-danger-500"; // Very low availability
  };
  
  // Navigation functions
  const previousWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1));
  };
  
  const nextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1));
  };
  
  return (
    <Card className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-neutral-200">
        <h2 className="font-semibold text-lg text-neutral-800">Weekly Availability</h2>
        <div className="flex items-center space-x-2">
          <button className="p-1.5 text-neutral-500 hover:bg-neutral-100 rounded-md">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <button 
            className="text-sm text-neutral-600 hover:text-primary"
            onClick={previousWeek}
          >
            <ChevronLeft className="h-4 w-4 inline" />
          </button>
          <h3 className="text-sm font-medium">{dateRangeText}</h3>
          <button 
            className="text-sm text-neutral-600 hover:text-primary"
            onClick={nextWeek}
          >
            <ChevronRight className="h-4 w-4 inline" />
          </button>
        </div>
        
        <div className="space-y-2">
          {availabilityData.map((item) => (
            <div key={item.day} className="flex items-center">
              <div className="w-10 text-sm font-medium text-neutral-500">{item.day}</div>
              <div className="flex-1 h-6 bg-neutral-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getBarColor(item.available)}`} 
                  style={{ width: `${100 - item.available}%` }}
                ></div>
              </div>
              <div className="ml-2 text-sm text-neutral-600">{item.label}</div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-600">Best availability</div>
            <div className="text-sm font-medium text-neutral-800">Wednesday, 2PM - 5PM</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
