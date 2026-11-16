import { useMemo } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
} from "react-router-dom";
import { lazy, Suspense } from "react";
import { MainLayout } from "../components/MainLayout";
import { PatientRoutes } from "../components/PatientRoutes";
import { ProtectedRoute } from "../../auth/ProtectedRoute";
import { RoleGuard } from "../../auth/RoleGuard";

const HomePage = lazy(() =>
  import("../../home/page").then((module) => ({
    default: module.HomePage,
  })),
);

const PendingAppointments = lazy(() =>
  import("../../home/components/PendingAppointments").then((module) => ({
    default: module.PendingAppointments,
  })),
);

const CompletedAppointments = lazy(() =>
  import("../../home/components/CompletedAppointments").then((module) => ({
    default: module.CompletedAppointments,
  })),
);

const ProfilePage = lazy(() =>
  import("../../profile/page").then((module) => ({
    default: module.ProfilePage,
  })),
);

const LoginPage = lazy(() =>
  import("../../../pages/auth/LoginPage").then((module) => ({
    default: module.LoginPage,
  })),
);

const AdminDashboard = lazy(() =>
  import("../../admin/page").then((module) => ({
    default: module.AdminDashboard,
  })),
);

const HomeFallback = () => (
  <div className="p-6 text-sm text-[#89847b]" role="status">
    Уншиж байна...
  </div>
);

export const useCreateAppRouter = () => {
  return useMemo(() => {
    return createBrowserRouter(
      createRoutesFromElements(
        <Route>
          <Route path="/login" element={
            <Suspense fallback={<HomeFallback />}>
              <LoginPage />
            </Suspense>
          } />
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/home/pending" replace />} />
              <Route
                path="/home"
                element={
                  <Suspense fallback={<HomeFallback />}>
                    <HomePage />
                  </Suspense>
                }
              >
                <Route index element={<Navigate to="pending" replace />} />
                <Route
                  path="pending"
                  element={
                    <Suspense fallback={<HomeFallback />}>
                      <PendingAppointments />
                    </Suspense>
                  }
                />
                <Route
                  path="completed"
                  element={
                    <Suspense fallback={<HomeFallback />}>
                      <CompletedAppointments />
                    </Suspense>
                  }
                />
              </Route>
              <Route element={<RoleGuard allowedRoles={["ADMIN", "RECEPTION", "DOCTOR"]} />}>
                <Route path="/patients" element={<PatientRoutes />} />
              </Route>
              <Route
                path="/profile"
                element={
                  <Suspense fallback={<HomeFallback />}>
                    <ProfilePage />
                  </Suspense>
                }
              />
              <Route element={<RoleGuard allowedRoles={["ADMIN"]} />}>
                <Route
                  path="/admin"
                  element={
                    <Suspense fallback={<HomeFallback />}>
                      <AdminDashboard />
                    </Suspense>
                  }
                />
              </Route>
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Route>,
      ),
    );
  }, []);
};
