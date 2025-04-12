import { ReactNode, useEffect, useState } from "react";
import { SocketContext } from "./SocketContext";
import { toast } from "sonner";

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(
      import.meta.env.VITE_WEBSOCKET_SERVER || "ws://localhost:8080"
    );

    setSocket(ws);

    if (ws.readyState === WebSocket.CONNECTING)
      toast.info("Connecting to Socket server!");

    ws.onopen = () => {
      toast.success("Socket connected!");
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
