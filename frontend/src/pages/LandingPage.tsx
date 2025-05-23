import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Copy, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSocket } from "@/context/SocketContext";
import { useRoom } from "@/context/RoomContext";
import { useNavigate } from "react-router-dom";
import CustomCard from "@/components/CustomCard";

function LandingPage() {
  const socket = useSocket();
  const roomContext = useRoom();
  const roomId = roomContext?.roomId;
  const setRoomId = roomContext?.setRoomId;
  const username = roomContext?.username;
  const setUsername = roomContext?.setUsername;
  const [isLoading, setIsLoading] = useState(false);
  const [roomCode, setRoomCode] = useState<string>("");
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

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.onmessage = (event: { data: string }) => {
      const data = JSON.parse(event.data);

      if (data.type === "room-created") {
        setRoomCode(data?.payload?.roomCode);
        setIsLoading(false);
        toast.success("Room created successfully!");
      }
    };

    return () => {
      socket.onmessage = null;
    };
  });

  return (
    <div className="mt-44">
      <CustomCard>
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
      </CustomCard>
    </div>
  );
}

export default LandingPage;
