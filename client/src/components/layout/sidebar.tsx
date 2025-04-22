import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useMediaQuery } from "@/hooks/use-mobile";
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Clock,
  BarChart2,
  Settings,
  Menu,
} from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const [isCollapsed, setIsCollapsed] = useState(isMobile);
  
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['/api/me'],
  });
  
  const { data: workspaces, isLoading: isLoadingWorkspaces } = useQuery({
    queryKey: ['/api/workspaces'],
  });

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "My Tasks",
      href: "/tasks",
      icon: <CheckSquare className="h-5 w-5" />,
    },
    {
      name: "Calendar",
      href: "/calendar",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      name: "Time Tracking",
      href: "/time",
      icon: <Clock className="h-5 w-5" />,
    },
    {
      name: "Reports",
      href: "/reports",
      icon: <BarChart2 className="h-5 w-5" />,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const getWorkspaceInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside 
      className={cn(
        "bg-white border-r border-neutral-200 flex flex-col h-screen flex-shrink-0 transition-all duration-300",
        isCollapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-neutral-200 px-4">
        <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
          <LayoutDashboard className="h-5 w-5 text-white" />
        </div>
        {!isCollapsed && <span className="ml-2 font-bold text-neutral-800">WorkFlow</span>}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto lg:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-hide py-4">
        <ul className="space-y-1">
          {navigationItems.map((item) => (
            <li key={item.name}>
              <Link href={item.href}>
                <a
                  className={cn(
                    "flex items-center px-4 py-2 rounded-md mx-2",
                    location === item.href
                      ? "bg-neutral-100 text-neutral-800"
                      : "text-neutral-600 hover:bg-neutral-100"
                  )}
                >
                  {item.icon}
                  {!isCollapsed && <span className="ml-3">{item.name}</span>}
                </a>
              </Link>
            </li>
          ))}
        </ul>
        
        <div className="px-4 pt-6 pb-2">
          <div className="border-t border-neutral-200 pt-4">
            {!isCollapsed && (
              <h3 className="text-xs font-medium text-neutral-500 uppercase mb-2">
                Workspaces
              </h3>
            )}
            <ul className="space-y-1">
              {isLoadingWorkspaces ? (
                Array(3).fill(0).map((_, index) => (
                  <li key={index} className="px-4 py-2">
                    <div className="flex items-center">
                      <Skeleton className="h-6 w-6 rounded-md" />
                      {!isCollapsed && <Skeleton className="h-4 w-24 ml-3" />}
                    </div>
                  </li>
                ))
              ) : (
                workspaces?.map((workspace: any) => (
                  <li key={workspace.id}>
                    <a
                      href="#"
                      className="flex items-center px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-md mx-2"
                    >
                      <div 
                        className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: workspace.color }}
                      >
                        {getWorkspaceInitials(workspace.name)}
                      </div>
                      {!isCollapsed && <span className="ml-3">{workspace.name}</span>}
                    </a>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </nav>
      
      {/* User Profile */}
      <div className="border-t border-neutral-200 p-4">
        <div className="flex items-center">
          {isLoadingUser ? (
            <>
              <Skeleton className="h-8 w-8 rounded-full" />
              {!isCollapsed && <Skeleton className="h-8 w-28 ml-3" />}
            </>
          ) : (
            <>
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatarUrl} alt={user?.fullName} />
                <AvatarFallback>
                  {user?.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-neutral-700">
                    {user?.fullName}
                  </p>
                  <p className="text-xs text-neutral-500">{user?.email}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
