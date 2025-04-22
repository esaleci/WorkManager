import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { 
  Menu, 
  Search, 
  Bell, 
  Plus, 
  Clock, 
  MessageSquare, 
  CheckCircle2 
} from "lucide-react";
import { useMediaQuery } from "@/hooks/use-mobile";
import { TaskForm } from "@/components/tasks/task-form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4">
      <div className="flex items-center">
        {isMobile && (
          <Button variant="ghost" size="icon" className="mr-4 text-neutral-500">
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <h1 className="text-xl font-semibold text-neutral-800">{title}</h1>
      </div>
      
      <div className="flex items-center">
        <div className="relative mr-2">
          <Input
            type="text"
            placeholder="Search..."
            className="py-1.5 pl-8 pr-4 w-36 md:w-64"
          />
          <Search className="absolute left-2.5 top-2 h-4 w-4 text-neutral-400" />
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="p-2 mx-1 relative">
              <Bell className="h-5 w-5 text-neutral-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"></span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="border-b border-neutral-100 p-3">
              <h3 className="font-medium">Notifications</h3>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {/* Notification Items */}
              <div className="p-3 border-b hover:bg-neutral-50">
                <div className="flex items-start gap-3">
                  <div className="bg-primary-50 p-2 rounded-full">
                    <Clock className="h-4 w-4 text-primary-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Reminder</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Client meeting starts in 30 minutes
                    </p>
                    <p className="text-xs text-neutral-500 mt-2">
                      Just now
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 border-b hover:bg-neutral-50">
                <div className="flex items-start gap-3">
                  <div className="bg-green-50 p-2 rounded-full">
                    <CheckCircle2 className="h-4 w-4 text-success-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Task completed</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Michael Taylor completed "Update landing page content"
                    </p>
                    <p className="text-xs text-neutral-500 mt-2">
                      2 hours ago
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 border-b hover:bg-neutral-50">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-50 p-2 rounded-full">
                    <MessageSquare className="h-4 w-4 text-primary-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">New comment</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Sarah Chen commented on "Website redesign proposal"
                    </p>
                    <p className="text-xs text-neutral-500 mt-2">
                      1 day ago
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-2 border-t border-neutral-100 text-center">
              <Button variant="link" className="text-xs w-full">
                View all notifications
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        
        <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
          <DialogTrigger asChild>
            <Button className="ml-2 px-3 py-1.5 flex items-center" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              <span>Add Task</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <TaskForm onSuccess={() => setIsAddTaskOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
