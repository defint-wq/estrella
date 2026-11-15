import { Outlet, useNavigate } from "react-router-dom";
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
  const [logoutError, setLogoutError] = useState("");

  const menuItems = GET_MODULES(user?.role);
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (cause) {
      setLogoutError(
        cause instanceof Error ? cause.message : "Гарахад алдаа гарлаа.",
      );
    }
  };

  return (
    <div className="flex h-screen min-w-0 overflow-hidden bg-gray-50">
      <TopBar />
      <Sidebar
        user={user}
        onLogout={() => void handleLogout()}
        navigate={navigate}
        menuItems={menuItems}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="h-full min-h-0 min-w-0 flex-1 overflow-hidden bg-[#f7f6f3] pt-14 lg:pt-0">
        {logoutError && (
          <p role="alert" className="absolute right-4 top-4 z-[70] rounded-lg bg-rose-50 px-4 py-2 text-sm text-rose-700">
            {logoutError}
          </p>
        )}
        <Outlet />
      </main>

      <BottomBar menuItems={menuItems} />
    </div>
  );
};
