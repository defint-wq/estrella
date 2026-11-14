import { Outlet, useNavigate } from "react-router-dom";
import { Home, User, Users, Shield, Menu, X, Stethoscope } from "lucide-react";
import { useState } from "react";
import { Sidebar } from "../ui/Sidebar";
import { BottomBar } from "../ui/Bottombar";
import { TopBar } from "../ui/Topbar";
import { GET_MODULES } from "../constants/modules";
import { useAuth } from "../../auth/AuthContext";

export const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = GET_MODULES(user?.role);

  return (
    <div className="flex h-screen min-w-0 overflow-hidden bg-gray-50">
      <TopBar />
      <Sidebar
        user={user}
        onLogout={logout}
        navigate={navigate}
        menuItems={menuItems}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="h-full min-h-0 min-w-0 flex-1 overflow-hidden bg-[#f7f6f3] pt-14 lg:pt-0">
        <Outlet />
      </main>

      <BottomBar menuItems={menuItems} navigate={navigate} />
    </div>
  );
};
