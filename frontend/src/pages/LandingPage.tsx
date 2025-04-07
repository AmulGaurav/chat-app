import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Copy, LoaderCircle, MessageCircleMore } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSocket } from "@/context/SocketContext";
import { useRoom } from "@/context/RoomContext";
import { useNavigate } from "react-router-dom";

function LandingPage() {
  const [messages, setMessages] = useState<string[]>([
    "hello world",
    "hi there",
  ]);
  const socket = useSocket();
  const roomContext = useRoom();
  const roomId = roomContext?.roomId;
  const setRoomId = roomContext?.setRoomId;
  const username = roomContext?.username;
  const setUsername = roomContext?.setUsername;
  const [isLoading, setIsLoading] = useState(false);
  const [roomCode, setRoomCode] = useState<string>("");
  const wsRef = useRef<WebSocket | null>(null);
  const messageInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  function createUniqueRoomCode() {
    if (socket) {
      setIsLoading(true);

      socket?.send(
        JSON.stringify({
          type: "create-room",
        })
      );
    }
  }

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

  function handleUsernameChange(e: { target: { value: string } }) {
    if (setUsername) setUsername(e.target.value);
  }

  function handleRoomIdChange(e: { target: { value: string } }) {
    if (setRoomId) setRoomId(e.target.value);
  }

  function handleJoinRoom() {
    if (username?.trim() && roomId?.trim()) navigate("/chat");
    else toast.error("Please fill all the inputs correctly!");
  }

  const sendMessage = () => {
    if (!messageInputRef.current || !wsRef.current) return;

    const message = messageInputRef.current.value.trim();

    if (!message) return;

    setMessages((prev) => [...prev, message]);

    wsRef.current.send(
      JSON.stringify({
        type: "chat",
        payload: {
          message,
        },
      })
    );

    messageInputRef.current.value = "";
  };

  useEffect(() => {
    if (socket) {
      socket.onmessage = (event: { data: string }) => {
        const data = JSON.parse(event.data);
        console.log("data: ", data);

        if (data.type === "room-created") {
          setRoomCode(data?.payload?.roomCode);
          setIsLoading(false);
          toast.success("Room created successfully!");
        }
      };
    }
  });

  return (
    <div className="p-4">
      <div className="">
        {messages.map((message, index) => (
          <div key={index} className="my-2">
            {message}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Input
          className="w-[90vw]"
          ref={messageInputRef}
          type="text"
          placeholder="Type your message"
        />
        <button
          className="bg-purple-600 text-white px-3 py-2 rounded-xl cursor-pointer"
          onClick={sendMessage}
        >
          Send Message
        </button>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card className="w-full shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl flex gap-2 items-center">
              <MessageCircleMore className="w-6 h-6" />
              <div>Real Time Chat</div>
            </CardTitle>
            <CardDescription>
              temporary room that expires after all users exit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Button
                className="w-full text-md font-semibold py-5 cursor-pointer"
                onClick={createUniqueRoomCode}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoaderCircle className="animate-spin" /> Creating...
                  </>
                ) : (
                  "Create New Room"
                )}
              </Button>
            </div>

            <div className="my-5 space-y-4">
              <div>
                <Input
                  className="py-5"
                  placeholder="Enter your name"
                  onChange={handleUsernameChange}
                ></Input>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  className="py-5"
                  placeholder="Enter Room Code"
                  onChange={handleRoomIdChange}
                ></Input>
                <Button
                  className="py-5 text-md font-semibold cursor-pointer"
                  onClick={handleJoinRoom}
                >
                  Join Room
                </Button>
              </div>
            </div>

            {roomCode && (
              <div className="p-6 bg-muted rounded-xl">
                <div className="flex justify-center items-center">
                  <span className="text-xl font-bold">{roomCode}</span>
                  <Button
                    className="cursor-pointer"
                    onClick={() => copyToClipboard(roomCode)}
                    variant={"ghost"}
                    size={"icon"}
                  >
                    <Copy className="w-3 h-3"></Copy>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default LandingPage;
