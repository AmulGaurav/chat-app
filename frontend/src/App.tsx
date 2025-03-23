import { useEffect, useRef, useState } from "react";
import "./App.css";

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
    <div className="h-screen bg-black p-4">
      <div className="h-[90vh]">
        {messages.map((message, index) => (
          <div key={index} className="bg-white my-2">
            {message}
          </div>
        ))}
      </div>
      <div className="w-full bg-white flex">
        <input className="flex-1 p-4" ref={messageInputRef} type="text" />
        <button
          className="bg-purple-600 text-white p-4 rounded-xl cursor-pointer"
          onClick={sendMessage}
        >
          Send Message
        </button>
      </div>
    </div>
  );
}

export default App;
