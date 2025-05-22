
import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  onLogout: () => void;
}

const DashboardLayout = ({ onLogout }: DashboardLayoutProps) => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-[hsl(var(--sidebar-background))] text-sidebar-foreground flex flex-col">
        <div className="p-4 border-b border-white/10">
          <h1 className="text-xl font-bold uppercase tracking-wider text-white">Magma</h1>
          <p className="text-xs text-gray-400">Venture Studio</p>
        </div>
        
        <nav className="flex-1 pt-4 px-2">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => 
              cn("sidebar-link", isActive && "active")
            }
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink 
            to="/applications" 
            className={({ isActive }) => 
              cn("sidebar-link", isActive && "active")
            }
          >
            <Users size={20} />
            <span>Applications</span>
          </NavLink>
          
          <NavLink 
            to="/settings" 
            className={({ isActive }) => 
              cn("sidebar-link", isActive && "active")
            }
          >
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>
        </nav>
        
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={onLogout}
            className="sidebar-link w-full"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-white">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
