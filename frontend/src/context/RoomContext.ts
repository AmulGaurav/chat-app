import { RoomContextType } from "@/types/room";
import { createContext, useContext } from "react";

export const RoomContext = createContext<RoomContextType | null>(null);

export const useRoom = () => useContext(RoomContext);
