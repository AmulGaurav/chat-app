import { WebSocketServer, WebSocket } from "ws";
import { randomBytes } from "crypto";

interface IMessage {
  content: string;
  sender: string;
  timestamp: Date;
  userId: number;
}

interface IUsers {
  userId: number;
  socket: WebSocket;
}

interface IRoom {
  users: Set<IUsers>;
  messages: IMessage[];
  userCount: number;
  lastActive: number;
}

const wss = new WebSocketServer({ port: 8080 });

let userId = 0;
const rooms = new Map<string, IRoom>();

const createRoom = (roomId: string) => {
  rooms.set(roomId, {
    users: new Set<IUsers>(),
    messages: [],
    userCount: 0,
    lastActive: Date.now(),
  });
};

const leaveRoom = (roomId: string, socket: WebSocket, userId: number) => {
  const room = rooms.get(roomId);

  if (!room) return;

  const userToDelete = getUserBySocket(room.users, socket);

  if (userToDelete) {
    room.users.delete(userToDelete);
    room.userCount--;

    if (room.userCount === 0) rooms.delete(roomId);
    else broadcastUserCount(room);
  }
};

function broadcastUserCount(room: IRoom) {
  room.users.forEach((s) =>
    s.socket.send(
      JSON.stringify({
        type: "update-user-count",
        payload: {
          userCount: room.userCount,
        },
      })
    )
  );
}

function getUserBySocket(users: Set<IUsers>, socket: WebSocket) {
  return [...users].find((u) => u.socket === socket);
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

        const newUserId = userId;
        room?.users.add({
          userId: newUserId,
          socket,
        });
        userId++;
        room.userCount = room?.userCount + 1;
        room.lastActive = Date.now();

        room.users.forEach((s) =>
          s.socket.send(
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
              userId: newUserId,
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

        const newMessage: IMessage = {
          content: parsedMessage?.payload?.message,
          sender: parsedMessage?.payload?.username,
          timestamp: new Date(),
          userId: parsedMessage?.payload?.userId,
        };
        room.lastActive = Date.now();
        room.messages.push(newMessage);

        room.users.forEach((s) => {
          if (s.socket !== socket)
            s.socket.send(
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
        const userId = parsedMessage?.payload?.userId;
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

        const userToDelete = getUserBySocket(room.users, socket);
        if (userToDelete) {
          if (room.users.has(userToDelete)) leaveRoom(roomId, socket, userId);
        }
      }
    }
  });

  socket.on("close", () => {
    rooms.forEach((room, roomId) => {
      const userToDelete = getUserBySocket(room.users, socket);

      if (userToDelete) {
        if (room.users.has(userToDelete)) {
          room.users.delete(userToDelete);
          room.userCount--;

          // If room is empty, remove it
          if (room.userCount === 0) {
            console.log("Deleting empty room: ", roomId);
            rooms.delete(roomId);
          } else {
            broadcastUserCount(room);
          }
        }
      }
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

/*
Message format:

1. CREATE-ROOM
{
  type: "create-room"
}

2. JOIN
{
  "type": "join",
  "payload": {
    "roomId": "123456",
    "username": "user"
  }
}

3. CHAT
{
  "type": "chat",
  "payload": {
    "message": "hi there",
    "roomId": "123456",
    "username": "user",
    "userId": 1
  }
}

4. LEAVE
{
  "type": "leave",
  "payload": {
    "roomId": "123456"
  }
}
*/
