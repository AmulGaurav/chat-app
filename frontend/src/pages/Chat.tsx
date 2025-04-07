import CustomCard from "@/components/CustomCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRoom } from "@/context/RoomContext";
import { useSocket } from "@/context/SocketContext";
import { Copy } from "lucide-react";
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
  const [messages, setMessages] = useState<IMessage[]>([
    {
      isCurrentUser: true,
      content: "hello world",
      sender: "username",
      timestamp: new Date(),
    },
    {
      isCurrentUser: false,
      content: "hello there",
      sender: "username",
      timestamp: new Date(),
    },
  ]);
  const [userCount, setUserCount] = useState<number>(1);

  function copyToClipboard(text: string) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success(`Copied text to clipboard: ${text}`);
      })
      .catch((error) => {
        toast.error(`Could not copy text: ${error}`);
      });
  }

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

  const MessageGroup = () => {
    return <div></div>;
  };

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
        } else if (data.type === "update-user-count") {
          setUserCount(data?.payload?.userCount);
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

  return (
    <CustomCard>
      <div className="space-y-6">
        {roomId && (
          <div className="flex justify-between items-center bg-muted text-muted-foreground text-sm p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <div>Room Code: {roomId}</div>
              <Button
                className="cursor-pointer"
                onClick={() => copyToClipboard(roomId)}
                variant={"ghost"}
                size={"icon"}
              >
                <Copy className="w-3 h-3"></Copy>
              </Button>
            </div>
            <div>Users: {userCount}</div>
          </div>
        )}

        <div className="h-[430px] border rounded-lg p-4"></div>

        <form action="" className="flex gap-2">
          <Input className="py-5" placeholder="Type a message..." />
          <Button
            className="cursor-pointer px-8 font-semibold"
            size={"lg"}
            type="submit"
          >
            Send
          </Button>
        </form>
      </div>
    </CustomCard>
  );
}

export default Chat;
