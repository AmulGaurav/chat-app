import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import ErrorPage from "./components/ErrorPage";
import LandingPage from "./pages/LandingPage";
import Chat from "./pages/Chat";
import ProtectedRoute from "./components/ProtectedRoute";

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "chat",
            element: <Chat />,
          },
        ],
      },
    ],
  },
]);

export default appRouter;
