import { Outlet, useNavigate } from "react-router-dom";
import { Home, User, Users, Shield, Menu, X, Stethoscope } from "lucide-react";
import { useState } from "react";
import { Sidebar } from "../ui/Sidebar";
import { BottomBar } from "../ui/Bottombar";
import { TopBar } from "../ui/Topbar";
import { GET_MODULES } from "../constants/modules";

export const MainLayout = ({ user, onLogout }: any) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = GET_MODULES(user?.role);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <TopBar />
      <Sidebar
        user={user}
        onLogout={onLogout}
        navigate={navigate}
        menuItems={menuItems}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="lg:ml-64 flex-1 p-6 pt-20">
        <Outlet />
      </main>

      <BottomBar menuItems={menuItems} navigate={navigate} />
    </div>
  );
};
