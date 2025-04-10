import { ReactNode, useEffect, useState } from "react";
import { SocketContext } from "./SocketContext";

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  console.log(import.meta.env.VITE_WEBSOCKET_SERVER);

  useEffect(() => {
    const ws = new WebSocket(
      import.meta.env.VITE_WEBSOCKET_SERVER || "ws://localhost:8080"
    );

    setSocket(ws);

    ws.onopen = () => {
      console.log("WebSocket connection opened!");
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed!");
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
