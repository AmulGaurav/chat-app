import "./App.css";
import { RouterProvider } from "react-router-dom";
import appRouter from "./router";
import { ThemeProvider } from "./components/theme-provider";
import { SocketProvider } from "./context/SocketProvider";
import { RoomProvider } from "./context/RoomProvider";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <SocketProvider>
        <RoomProvider>
          <RouterProvider router={appRouter} />
        </RoomProvider>
      </SocketProvider>
    </ThemeProvider>
  );
}

export default App;
