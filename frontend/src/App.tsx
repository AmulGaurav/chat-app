import { useEffect, useRef, useState } from "react";
import "./App.css";
import { Input } from "@/components/ui/input";
import Navbar from "./components/Navbar";

function App() {
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
    <div className="h-screen p-4">
      <Navbar />

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
    </div>
  );
}

export default App;
