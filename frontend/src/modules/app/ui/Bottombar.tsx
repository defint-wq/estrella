import { BottomBarItem } from "./BottombarItem";

type MenuItem = {
  path: string;
  label: string;
  icon: React.ElementType | React.ReactNode;
};

export const BottomBar = ({ menuItems }: { menuItems: MenuItem[] }) => {
  return (
    <nav
      aria-label="Үндсэн цэс"
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden"
    >
      <div className="mx-auto flex h-[68px] max-w-md items-center justify-around rounded-[22px] border border-[#e9e5de] bg-white/90 px-2 shadow-[0_8px_30px_rgba(60,52,41,0.12)] backdrop-blur-md">
        {menuItems.map((item) => (
          <BottomBarItem
            key={item.path}
            path={item.path}
            icon={item.icon}
            label={item.label}
          />
        ))}
      </div>
    </nav>
  );
};