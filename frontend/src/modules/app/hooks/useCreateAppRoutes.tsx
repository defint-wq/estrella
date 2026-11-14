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

const HomeLayout = lazy(() =>
  import("../../../pages/home/HomeLayout").then((module) => ({
    default: module.HomeLayout,
  })),
);

const PendingAppointments = lazy(() =>
  import("../../../pages/home/PendingAppointments").then((module) => ({
    default: module.PendingAppointments,
  })),
);

const CompletedAppointments = lazy(() =>
  import("../../../pages/home/CompletedAppointments").then((module) => ({
    default: module.CompletedAppointments,
  })),
);

const DoctorProfilePage = lazy(() =>
  import("../../../pages/profile/DoctorProfilePage").then((module) => ({
    default: module.DoctorProfilePage,
  })),
);

const LoginPage = lazy(() =>
  import("../../../pages/auth/LoginPage").then((module) => ({
    default: module.LoginPage,
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
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/home/pending" replace />} />
            <Route
              path="/home"
              element={
                <Suspense fallback={<HomeFallback />}>
                  <HomeLayout />
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
            <Route path="/patients" element={<PatientRoutes />} />
            <Route
              path="/profile"
              element={
                <Suspense fallback={<HomeFallback />}>
                  <DoctorProfilePage />
                </Suspense>
              }
            />
            <Route
              path="/auth/login"
              element={
                <Suspense fallback={<HomeFallback />}>
                  <LoginPage />
                </Suspense>
              }
            />
          </Route>
        </Route>,
      ),
    );
  }, []);
};
