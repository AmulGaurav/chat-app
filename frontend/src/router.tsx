import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import ErrorPage from "./components/ErrorPage";
import LandingPage from "./pages/LandingPage";
import Chat from "./pages/Chat";

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
        path: "chat",
        element: <Chat />,
      },
    ],
  },
]);

export default appRouter;
