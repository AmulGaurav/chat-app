import { useRoom } from "@/context/RoomContext";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const roomContext = useRoom();
  const roomId = roomContext?.roomId;
  const username = roomContext?.username;

  return roomId && username ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
