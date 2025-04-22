import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Menu, Search, Bell, Plus } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-mobile";
import { TaskForm } from "@/components/tasks/task-form";

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
        
        <Button variant="ghost" size="icon" className="p-2 mx-1 relative">
          <Bell className="h-5 w-5 text-neutral-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"></span>
        </Button>
        
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
