import { isValidElement } from "react";
import { NavLink } from "react-router-dom";

type Props = {
  path: string;
  label: string;
  icon: React.ElementType | React.ReactNode;
  onClick?: () => void;
};

export const SidebarItem = ({ path, label, icon, onClick }: Props) => {
  const renderIcon = (active: boolean) => {
    if (isValidElement(icon)) return icon;
    if (typeof icon === "function" || (typeof icon === "object" && icon && "render" in icon)) {
      const Icon = icon as React.ElementType;
      return <Icon size={18} strokeWidth={active ? 1.9 : 1.65} />;
    }
    return icon;
  };

  return (
    <NavLink
      to={path}
      end={path === "/"}
      onClick={onClick}
      className={({ isActive }) =>
        `group flex items-center gap-3.5 rounded-2xl px-4 py-3.5 transition ${
          isActive
            ? "bg-white text-[#34362f] shadow-[0_2px_12px_rgba(57,50,40,0.05)]"
            : "text-[#817b71] hover:bg-white/60 hover:text-[#45413b]"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {renderIcon(isActive)}
          <span className="flex-1 text-sm font-medium">{label}</span>
          {isActive && <span className="size-1.5 rounded-full bg-[#a48663]" />}
        </>
      )}
    </NavLink>
  );
};