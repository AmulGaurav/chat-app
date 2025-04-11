import CustomCard from "@/components/CustomCard";
import MessageGroup from "@/components/MessageGroup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRoom } from "@/context/RoomContext";
import { useSocket } from "@/context/SocketContext";
import { IMessage } from "@/types/chat";
import { playSound } from "@/utils/playSound";
import { Copy } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
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
  const [userCount, setUserCount] = useState<number>(1);
  const messageRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [userId, setUserId] = useState<string>("");

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

  function sendMessage(e: FormEvent) {
    e.preventDefault();

    if (!username) {
      toast.error("Please enter your username!");
      navigate("/");
      return;
    }

    if (!messageRef.current) return;

    const trimmedMessage = messageRef.current.value.trim();
    messageRef.current.value = "";

    if (!trimmedMessage) return;

    playSound("/sounds/send.mp3");

    setMessages((prev) => [
      ...prev,
      {
        content: trimmedMessage,
        sender: username,
        timestamp: new Date(),
        userId,
      },
    ]);

    socket?.send(
      JSON.stringify({
        type: "chat",
        payload: {
          message: trimmedMessage,
          roomId,
          username,
          userId,
        },
      })
    );
  }

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
    if (!socket) {
      toast("Socket disconnected!");
      if (setRoomId) setRoomId("");
      if (setUsername) setUsername("");
      navigate("/");
      return;
    }

    socket.onmessage = (event: { data: string }) => {
      const data = JSON.parse(event.data);

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

          setMessages(formattedMessages);
          setUserId(data?.payload?.userId);
          break;
        }

        case "chat": {
          playSound("sounds/receive.mp3");

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

    return () => {
      socket.onmessage = null;
    };
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
          <MessageGroup messages={messages} userId={userId} />
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="flex gap-2">
          <Input
            className="py-5"
            placeholder="Type a message..."
            ref={messageRef}
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
