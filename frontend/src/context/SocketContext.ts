import { SocketContextType } from "@/types/socket";
import { createContext, useContext } from "react";

export const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  return useContext(SocketContext);
};
