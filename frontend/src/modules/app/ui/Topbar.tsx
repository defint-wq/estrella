import { Hospital } from "lucide-react";

export const TopBar = () => {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#ece9e3] bg-[#f7f6f3]/85 pt-[env(safe-area-inset-top)] backdrop-blur-md lg:hidden">
      <div className="flex h-14 items-center justify-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-[10px] bg-[#353a33] text-[#eee8dc]">
          <Hospital size={16} strokeWidth={1.7} />
        </div>
        <span className="text-[16px] font-semibold tracking-[-0.03em] text-[#34362f]">
          Dr.<span className="font-normal text-[#9a8a72]">Munkh</span>
        </span>
      </div>
    </header>
  );
};