import { ReactNode, useState } from "react";
import { RoomContext } from "./RoomContext";

export const RoomProvider = ({ children }: { children: ReactNode }) => {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  return (
    <RoomContext.Provider value={{ roomId, setRoomId, username, setUsername }}>
      {children}
    </RoomContext.Provider>
  );
};
