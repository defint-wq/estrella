import { LogOut, LogIn, Hospital } from "lucide-react";
import { SidebarItem } from "./SidebarItem";

export const Sidebar = ({ user, onLogout, navigate, menuItems, isOpen, onClose }: any) => (
  <aside className={`fixed top-0 left-0 h-full w-64 z-40 bg-white border-r border-gray-200 transition-transform ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 flex flex-col justify-between`}>
    <div className="p-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
          <Hospital />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Dr.Munkh</h1>
      </div>
      <nav className="space-y-1">
        {menuItems.map((item: any) => (
          <SidebarItem key={item.path} {...item} onClick={onClose} />
        ))}
      </nav>
    </div>

    <div className="p-4 border-t border-gray-100">
      {user ? (
        <div className="bg-gray-50 p-3 rounded-xl flex justify-between items-center border border-gray-200">
          <span className="font-semibold text-gray-700">{user.username}</span>
          <button onClick={onLogout} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><LogOut className="w-4 h-4" /></button>
        </div>
      ) : (
        <button onClick={() => navigate("/auth/login")} className="w-full bg-indigo-600 text-white py-2 rounded-xl font-bold hover:bg-indigo-700">
          Нэвтрэх
        </button>
      )}
    </div>
  </aside>
);