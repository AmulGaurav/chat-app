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

function LandingPage() {
  const [messages, setMessages] = useState<string[]>([
    "hello world",
    "hi there",
  ]);
  const [roomCode, setRoomCode] = useState<string>("");
  const [existingCodesSet, setExistingCodesSet] = useState<Set<string>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messageInputRef = useRef<HTMLInputElement | null>(null);

  function generateRoomCode() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let roomCode = "";
    for (let i = 0; i < 6; i++) {
      roomCode += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return roomCode;
  }

  async function createUniqueRoomCode() {
    setIsLoading(true);

    setTimeout(() => {
      let newCode;
      do {
        newCode = generateRoomCode();
      } while (existingCodesSet.has(newCode));

      setRoomCode(newCode);
      setIsLoading(false);
      toast.success("Room created successfully!");
      setExistingCodesSet((prevSet) => new Set(prevSet).add(newCode));
    }, 800);
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

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onmessage = (e) => {
      setMessages((prev) => [...prev, e.data]);
    };

    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "join",
          payload: {
            roomId: "red",
          },
        })
      );
    };

    return () => {
      ws.close();
    };
  }, []);

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
                <Input className="py-5" placeholder="Enter your name"></Input>
              </div>
              <div className="flex items-center gap-2">
                <Input className="py-5" placeholder="Enter Room Code"></Input>
                <Button className="py-5 text-md font-semibold">
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
