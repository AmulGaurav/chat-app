import "./App.css";
import { RouterProvider } from "react-router-dom";
import appRouter from "./router";
import { ThemeProvider } from "./components/theme-provider";
import { SocketProvider } from "./context/SocketProvider";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <SocketProvider>
        <RouterProvider router={appRouter} />
      </SocketProvider>
    </ThemeProvider>
  );
}

export default App;
