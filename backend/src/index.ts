import { WebSocketServer, WebSocket } from "ws";
import { randomBytes } from "crypto";

interface Message {
  content: string;
  sender: string;
  timestamp: Date;
}

interface RoomInterface {
  users: Set<WebSocket>;
  messages: Message[];
  userCount: number;
  lastActive: number;
}

const wss = new WebSocketServer({ port: 8080 });

let userCount = 0;
const rooms = new Map<string, RoomInterface>();

const createRoom = (roomId: string) => {
  rooms.set(roomId, {
    users: new Set<WebSocket>(),
    messages: [],
    userCount: 0,
    lastActive: Date.now(),
  });
};

const leaveRoom = (room: RoomInterface, socket: WebSocket) => {
  console.log(rooms);
  // rooms.forEach((room, roomId) => {
  //   if (room.has(socket)) {
  //     room.delete(socket);
  //   }

  //   if (room.size === 0) rooms.delete(roomId);
  //   console.log(rooms);
  // });
};

wss.on("connection", (socket) => {
  socket.on("message", (message: string) => {
    const parsedMessage = JSON.parse(message);

    console.log(parsedMessage);

    switch (parsedMessage.type) {
      case "create-room":
        const roomCode = randomBytes(3).toString("hex").toUpperCase();
        createRoom(roomCode);
        socket.send(
          JSON.stringify({
            type: "room-created",
            payload: {
              roomCode,
            },
          })
        );
        break;

      case "join": {
        const roomId = parsedMessage?.payload?.roomId;
        const room = rooms.get(roomId);

        if (!room) {
          socket.emit("error", "Room not found");
          return;
        }

        const username = parsedMessage?.payload?.username;

        room?.users.add(socket);
        room.userCount = room?.userCount + 1;
        room.lastActive = Date.now();

        console.log("user connected: ", room);
        break;
      }

      case "chat": {
        const roomId = parsedMessage?.payload?.roomId;
        const room = rooms.get(roomId);

        if (!room) {
          socket.emit("error", "Room not found");
          return;
        }

        const newMessage: Message = {
          content: parsedMessage?.payload?.message,
          sender: parsedMessage?.payload?.username,
          timestamp: new Date(),
        };
        room.lastActive = Date.now();
        room.messages.push(newMessage);

        room.users.forEach((s) => {
          if (s !== socket) s.send(JSON.stringify(newMessage));
        });
        break;
      }

      // case "leave": {
      //   const roomId = parsedMessage?.payload?.roomId;
      //   const room = rooms.get(roomId);

      //   if (room) {
      //     leaveRoom(room, socket);
      //   }
      // }
    }
  });

  // setInterval(() => {
  //   rooms.forEach((room, roomId) => {
  //     console.log(room);
  //     console.log(roomId + "\n");
  //   });
  // }, 1000);
});

// Message format:

// 1. CREATE-ROOM
// {
//   type: "create-room"
// }

// 2. JOIN
// {
//   "type": "join",
//   "payload": {
//     "roomId": "123456",
//     "username": "user"
//   }
// }

// 3. CHAT
// {
//   "type": "chat",
//   "payload": {
//     "message": "hi there",
//     "roomId": "123456",
//     "username": "user"
//   }
// }

// 4. LEAVE
// {
//   "type": "leave",
//   "payload": {
//     "roomId": "123456"
//   }
// }
