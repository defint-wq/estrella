import { Divide } from "lucide-react";
import { lazy, Suspense } from "react";

const HomeIndexPage = lazy(() =>
  import("../../../pages/HomePage").then((module) => ({
    default: module.HomePage,
  })),
);

export const HomeRoutes = () => {
  return (
    <Suspense fallback={<div>loading...</div>}>
      <HomeIndexPage />
    </Suspense>
  );
};
