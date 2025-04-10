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
  room.users.delete(socket);
  room.userCount--;

  for (const [roomId, value] of rooms.entries()) {
    if (value === room) {
      // If room is empty, remove it
      if (room.userCount === 0) {
        rooms.delete(roomId);
      } else {
        broadcastUserCount(room);
      }
    }
  }
};

function broadcastUserCount(room: RoomInterface) {
  room.users.forEach((s) =>
    s.send(
      JSON.stringify({
        type: "update-user-count",
        payload: {
          userCount: room.userCount,
        },
      })
    )
  );
}

wss.on("connection", (socket) => {
  socket.on("message", (message: string) => {
    const parsedMessage = JSON.parse(message);

    switch (parsedMessage.type) {
      case "create-room":
        // create new roomCode
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

      case "join-room": {
        const roomId = parsedMessage?.payload?.roomId;
        const room = rooms.get(roomId);

        if (!room) {
          socket.send(
            JSON.stringify({
              type: "room-not-found",
              message: "Room not found",
            })
          );
          return;
        }

        room?.users.add(socket);
        room.userCount = room?.userCount + 1;
        room.lastActive = Date.now();

        room.users.forEach((s) =>
          s.send(
            JSON.stringify({
              type: "update-user-count",
              payload: {
                userCount: room.userCount,
              },
            })
          )
        );

        socket.send(
          JSON.stringify({
            type: "user-joined",
            payload: {
              messages: room.messages,
            },
          })
        );
        break;
      }

      case "chat": {
        const roomId = parsedMessage?.payload?.roomId;
        const room = rooms.get(roomId);

        if (!room) {
          socket.send(
            JSON.stringify({
              type: "room-not-found",
              message: "Room not found",
            })
          );
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
          if (s !== socket)
            s.send(
              JSON.stringify({
                type: "chat",
                payload: {
                  message: newMessage,
                },
              })
            );
        });
        break;
      }

      case "leave": {
        const roomId = parsedMessage?.payload?.roomId;
        const room = rooms.get(roomId);

        if (!room) {
          socket.send(
            JSON.stringify({
              type: "room-not-found",
              message: "Room not found",
            })
          );
          return;
        }

        if (room.users.has(socket)) {
          leaveRoom(room, socket);
        }
      }
    }

    socket.on("close", () => {
      rooms.forEach((room, roomId) => {
        if (room.users.has(socket)) {
          room.users.delete(socket);
          room.userCount--;

          // If room is empty, remove it
          if (room.userCount === 0) {
            console.log("Deleting empty room: ", roomId);
            rooms.delete(roomId);
          } else {
            broadcastUserCount(room);
          }
        }
      });
    });
  });
});

// clean-up rooms that are inactive for more than 1 hour
setInterval(() => {
  rooms.forEach((room, roomId) => {
    if (room.userCount === 0 && Date.now() - room.lastActive > 3600000) {
      console.log("Cleaning up inactive room: ", roomId);
      rooms.delete(roomId);
    }
  });
}, 3600000);

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
