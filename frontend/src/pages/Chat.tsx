import CustomCard from "@/components/CustomCard";
import MessageGroup from "@/components/MessageGroup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRoom } from "@/context/RoomContext";
import { useSocket } from "@/context/SocketContext";
import { IMessage } from "@/types/chat";
import { Copy } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

function Chat() {
  const socket = useSocket();
  const roomContext = useRoom();
  const roomId = roomContext?.roomId;
  const setRoomId = roomContext?.setRoomId;
  const username = roomContext?.username;
  const setUsername = roomContext?.setUsername;
  const navigate = useNavigate();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [message, setMessage] = useState("");
  const [userCount, setUserCount] = useState<number>(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

  function handleMessageChange(e: ChangeEvent<HTMLInputElement>) {
    setMessage(e.target.value);
  }

  function sendMessage(e: FormEvent) {
    e.preventDefault();

    if (!username) {
      toast.error("Please enter your username!");
      navigate("/");
      return;
    }

    const trimmedMessage = message.trim();
    setMessage("");

    if (!trimmedMessage) return;

    setMessages((prev) => [
      ...prev,
      {
        isCurrentUser: true,
        content: trimmedMessage,
        sender: username,
        timestamp: new Date(),
      },
    ]);

    socket?.send(
      JSON.stringify({
        type: "chat",
        payload: {
          message: trimmedMessage,
          roomId,
          username,
        },
      })
    );
  }

  useEffect(() => {
    if (!roomId) navigate("/");
  }, []);

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
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (socket) {
      socket.onmessage = (event: { data: string }) => {
        const data = JSON.parse(event.data);
        console.log("data: ", data);

        switch (data.type) {
          case "room-not-found":
            if (setRoomId) setRoomId("");
            if (setUsername) setUsername("");

            toast(data.message);
            navigate("/");
            break;

          case "update-user-count":
            setUserCount(data?.payload?.userCount);
            break;

          case "user-joined": {
            const formattedMessages: IMessage[] = data?.payload?.messages?.map(
              (msg: { content: string; sender: string; timestamp: Date }) => ({
                ...msg,
                isCurrentUser: false,
              })
            );

            console.log(
              "messages: ",
              JSON.stringify(data?.payload?.messages, null, 2)
            );

            setMessages(formattedMessages);
            break;
          }

          case "chat": {
            setMessages((prev) => [
              ...prev,
              {
                ...data.payload.message,
                isCurrentUser: false,
              },
            ]);
          }
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
            <div>
              <div>
                Username: <span className="text-red-500">{username}</span>
              </div>
              <div>
                Users: <span className="text-red-500">{userCount}</span>
              </div>
            </div>
          </div>
        )}

        <div className="h-[430px] overflow-y-auto border rounded-lg p-4 space-y-1">
          <MessageGroup messages={messages} />
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="flex gap-2">
          <Input
            className="py-5"
            placeholder="Type a message..."
            value={message}
            onChange={handleMessageChange}
          />
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
