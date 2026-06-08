import { NavLink } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface SidebarItemProps {
  path: string;
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
}

export const SidebarItem = ({ path, icon: Icon, label, onClick }: SidebarItemProps) => (
  <NavLink
    to={path}
    end={path === "/"} 
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        isActive 
          ? "bg-indigo-50 text-indigo-600 font-bold" 
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`
    }
  >
    <Icon size={20} />
    <span>{label}</span>
  </NavLink>
);