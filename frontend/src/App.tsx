import { RouterProvider } from "react-router-dom";
import { useCreateAppRouter } from "./modules/app/hooks/useCreateAppRoutes";
import { AuthProvider } from "./modules/auth/AuthContext";

function App() {
  const router = useCreateAppRouter();

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
