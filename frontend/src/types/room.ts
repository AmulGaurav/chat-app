export type RoomContextType = {
  roomId: string | null;
  setRoomId: (roomId: string) => void;
  username: string | null;
  setUsername: (username: string) => void;
};
