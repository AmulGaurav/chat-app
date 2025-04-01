import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageCircleMore } from "lucide-react";

function LandingPage() {
  const [messages, setMessages] = useState<string[]>([
    "hello world",
    "hi there",
  ]);
  const wsRef = useRef<WebSocket | null>(null);
  const messageInputRef = useRef<HTMLInputElement | null>(null);

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
        <Card className="w-full">
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
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-[var(--radius-sm)] cursor-pointer">
                Create New Room
              </button>
            </div>
            <div></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default LandingPage;
