import { BottomBarItem } from "./BottombarItem";

export const BottomBar = ({ menuItems }: any) => {
  return (
    <div className="lg:hidden fixed bottom-0 w-full bg-white border-t border-gray-100 h-20 z-50 flex justify-around items-center shadow-lg">
      {menuItems.map((item: any) => (
        <BottomBarItem 
          key={item.path} 
          path={item.path} 
          icon={item.icon} 
          label={item.label} 
        />
      ))}
    </div>
  );
};