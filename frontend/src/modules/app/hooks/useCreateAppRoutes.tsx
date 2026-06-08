import { useMemo } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { MainLayout } from "../components/MainLayout";
import { HomeRoutes } from "../components/HomeRoutes";
import { PatientRoutes } from "../components/PatientRoutes";

export const useCreateAppRouter = () => {
  return useMemo(() => {
    return createBrowserRouter(
      createRoutesFromElements(
        <Route>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomeRoutes />} />
            <Route path="/patients" element={<PatientRoutes />} />
            {/* <Route path="/profile" element={<ProfilePage />} /> */}
          </Route>
        </Route>,
      ),
    );
  }, []);
};
