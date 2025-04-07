import { useRoom } from "@/context/RoomContext";
import { useSocket } from "@/context/SocketContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface IMessage {
  isCurrentUser: boolean;
  content: string;
  sender: string;
  timestamp: Date;
}

function Chat() {
  const socket = useSocket();
  const roomContext = useRoom();
  const roomId = roomContext?.roomId;
  const setRoomId = roomContext?.setRoomId;
  const username = roomContext?.username;
  const setUsername = roomContext?.setUsername;
  const navigate = useNavigate();
  const [messages, setMessages] = useState<IMessage[]>([]);

  useEffect(() => {
    if (!roomId) navigate("/");
  }, [roomId]);

  useEffect(() => {
    if (socket) {
      socket.send(
        JSON.stringify({
          type: "join-room",
          payload: {
            roomId,
            username,
          },
        })
      );
    }
  }, []);

  useEffect(() => {
    if (socket) {
      socket.onmessage = (event: { data: string }) => {
        const data = JSON.parse(event.data);
        console.log("data: ", data);

        if (data.type === "room-not-found") {
          if (setRoomId) setRoomId("");
          if (setUsername) setUsername("");

          toast(data.message);
          navigate("/");
        } else if (data.type === "room-joined") {
          const formattedMessages: IMessage[] = data?.messages?.map(
            (msg: { content: string; sender: string; timestamp: Date }) => ({
              ...msg,
              isCurrentUser: false,
            })
          );

          setMessages(formattedMessages);
        }
      };
    }
  });

  return <div>Chat Page</div>;
}

export default Chat;
