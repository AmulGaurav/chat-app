import { ReactNode, useEffect, useState } from "react";
import { SocketContext } from "./SocketContext";

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(
      import.meta.env.WEBSOCKET_SERVER || "ws://localhost:8080"
    );

    setSocket(ws);

    ws.onclose = () => {
      console.log("WebSocket connection closed!");
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, setSocket }}>
      {children}
    </SocketContext.Provider>
  );
};
