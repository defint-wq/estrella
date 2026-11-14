import { isValidElement } from "react";
import { NavLink } from "react-router-dom";

type Props = {
  path: string;
  label: string;
  icon: React.ElementType | React.ReactNode;
};

export const BottomBarItem = ({ path, icon, label }: Props) => {
  // icon нь component (Users) эсвэл element (<Users />) байж болно
  const renderIcon = (active: boolean) => {
    const cls = "transition";
    if (isValidElement(icon)) return icon;
    if (typeof icon === "function" || (typeof icon === "object" && icon && "render" in icon)) {
      const Icon = icon as React.ElementType;
      return <Icon size={20} strokeWidth={active ? 2 : 1.65} className={cls} />;
    }
    return icon;
  };

  return (
    <NavLink
      to={path}
      end={path === "/"}
      className={({ isActive }) =>
        `relative flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2 transition ${
          isActive ? "text-[#34362f]" : "text-[#9a948a] hover:text-[#5f594f]"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute -top-[9px] h-[3px] w-6 rounded-full bg-[#a48663]" />
          )}
          <span
            className={`flex size-9 items-center justify-center rounded-xl transition ${
              isActive ? "bg-[#f3f0ea] text-[#34362f]" : ""
            }`}
          >
            {renderIcon(isActive)}
          </span>
          <span
            className={`text-[10px] leading-none ${
              isActive ? "font-semibold" : "font-medium"
            }`}
          >
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
};