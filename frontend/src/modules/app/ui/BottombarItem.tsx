import { NavLink } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface BottomBarItemProps {
  path: string;
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
}

export const BottomBarItem = ({ path, icon: Icon, label, onClick }: BottomBarItemProps) => (
  <NavLink
    to={path}
    end={path === "/"}
    onClick={onClick}
    className={({ isActive }) =>
      `flex flex-col items-center gap-1 px-4 py-5 transition-all ${
        isActive
          ? "text-indigo-600 scale-110"
          : "text-gray-400 hover:text-gray-600"
      }`
    }
  >
    <Icon size={22} />
  </NavLink>
);