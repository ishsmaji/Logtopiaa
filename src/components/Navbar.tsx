import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Bell, BarChart2, Settings, List } from "lucide-react";
import { ThemeToggle } from "./ThemeProvider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import LogSettingsModal from "./LogSettingsModal";
import NotificationDropdown from "./NotificationDropdown";

interface NavbarProps {
  activeAlerts?: number;
}

const Navbar = ({ activeAlerts = 0 }: NavbarProps) => {
  const isMobile = useIsMobile();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-30 glass border-b border-white/5">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <NavLink to="/" className="text-xl font-semibold">
            <img
              src="https://res.cloudinary.com/decy8488i/image/upload/v1741850128/StudyNotion/rdjnwyin3v7qxydokyzc.jpg"
              alt="Logo"
              height={150}
              width={180}
            />
          </NavLink>
        </div>

        {!isMobile && (
          <nav className="flex space-x-1 absolute left-1/2 transform -translate-x-1/2">
            <NavLink
              to="/"
              className={({ isActive }) =>
                cn(
                  "px-3 py-2 rounded-md text-sm font-medium",
                  isActive ? "bg-white/10" : "hover:bg-white/5"
                )
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/logs"
              className={({ isActive }) =>
                cn(
                  "px-3 py-2 rounded-md text-sm font-medium",
                  isActive ? "bg-white/10" : "hover:bg-white/5"
                )
              }
            >
              Logs
            </NavLink>

            <NavLink
              to="/statistics"
              className={({ isActive }) =>
                cn(
                  "px-3 py-2 rounded-md text-sm font-medium",
                  isActive ? "bg-white/10" : "hover:bg-white/5"
                )
              }
            >
              Statistics
            </NavLink>
          </nav>
        )}

        <div className="flex items-center space-x-2">
          <ThemeToggle />

          <NotificationDropdown />

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="h-5 w-5" />
          </Button>

          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full lg:hidden"
            >
              <List className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      <LogSettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </header>
  );
};

export default Navbar;
