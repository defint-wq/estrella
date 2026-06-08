import { lazy, Suspense } from "react";

const PatientIndexPage = lazy(() =>
  import("../../../pages/PatientPage").then((module) => ({
    default: module.PatientPage,
  })),
);

export const PatientRoutes = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PatientIndexPage />
    </Suspense>
  );
};
