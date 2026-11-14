import { LogOut, LogIn, Hospital, ShieldCheck } from "lucide-react";
import { SidebarItem } from "./SidebarItem";

type MenuItem = {
  path: string;
  label: string;
  icon: React.ElementType | React.ReactNode;
};

type SidebarProps = {
  user?: { username: string } | null;
  onLogout: () => void;
  navigate: (path: string) => void;
  menuItems: MenuItem[];
  isOpen: boolean;
  onClose: () => void;
};

export const Sidebar = ({
  user,
  onLogout,
  navigate,
  menuItems,
  isOpen,
  onClose,
}: SidebarProps) => (
  <>
    {isOpen && (
      <button
        aria-label="Цэс хаах"
        onClick={onClose}
        className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px] lg:hidden"
      />
    )}

    <aside
      className={`fixed left-0 top-0 z-40 flex h-full w-64 shrink-0 flex-col justify-between border-r border-[#eae7e1] bg-[#f3f0ea] transition-transform duration-300 lg:static lg:h-screen lg:shrink-0 lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="px-5 py-6">
        <div className="flex items-center gap-3 px-2">

          <div>
            <h1 className="text-[16px] font-semibold tracking-[-0.03em] text-[#34362f]">
              Dr.<span className="font-normal text-[#9a8a72]">Munkh</span>
            </h1>
            <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.19em] text-[#9e978d]">
              Health & Wellness
            </p>
          </div>
        </div>

        <p className="mb-3 mt-10 px-3 text-[9px] font-semibold uppercase tracking-[0.19em] text-[#a8a197]">
        </p>
        <nav aria-label="Үндсэн цэс" className="flex flex-col gap-1">
          {menuItems.map((item) => (
            <SidebarItem key={item.path} {...item} onClick={onClose} />
          ))}
        </nav>
      </div>

      <div className="px-5 pb-6">
        <div className="mb-4 rounded-2xl border border-[#e7e1d7] bg-[#eeebe4] p-4">
          <div className="flex items-center gap-2 text-[#7d725f]">
            <ShieldCheck size={15} />
            <span className="text-[11px] font-semibold">Аюулгүй, нууцлалтай</span>
          </div>
          <p className="mt-2 text-[10px] leading-5 text-[#948d81]">
            Мэдээлэл эмнэлгийн нууцлалын журмаар хамгаалагдана.
          </p>
        </div>

        <div className="border-t border-[#e5e0d8] pt-4">
          {user ? (
            <div className="flex items-center gap-3 rounded-2xl bg-white p-2.5 shadow-[0_2px_12px_rgba(57,50,40,0.05)]">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#ded7cb] text-[11px] font-semibold uppercase text-[#635849]">
                {user.username.slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold text-[#45413b]">
                  {user.username}
                </p>
                <p className="text-[10px] text-[#9a948a]">Нэвтэрсэн</p>
              </div>
              <button
                onClick={onLogout}
                aria-label="Гарах"
                className="rounded-lg p-2 text-[#b0645a] transition hover:bg-[#f8ebe8]"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/auth/login")}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-stone-700 px-5 py-3 text-sm font-bold tracking-wide text-white shadow-sm transition hover:bg-stone-800 focus:outline-none focus:ring-4 focus:ring-stone-500/25"
            >
              <LogIn size={15} /> Нэвтрэх
            </button>
          )}
        </div>
      </div>
    </aside>
  </>
);