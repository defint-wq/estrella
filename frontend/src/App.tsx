import { RouterProvider } from "react-router-dom";
import { useCreateAppRouter } from "./modules/app/hooks/useCreateAppRoutes";

function App() {
  const router = useCreateAppRouter();

  return <RouterProvider router={router} />;
}

export default App;
