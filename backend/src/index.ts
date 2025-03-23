import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

let userCount = 0;
const rooms = new Map<string, Set<WebSocket>>();

const leaveRoom = (socket: WebSocket) => {
  console.log(rooms);
  rooms.forEach((room, roomId) => {
    if (room.has(socket)) {
      room.delete(socket);
    }

    if (room.size === 0) rooms.delete(roomId);
    console.log(rooms);
  });
};

wss.on("connection", (socket) => {
  socket.on("message", (message: string) => {
    const parsedMessage = JSON.parse(message);

    switch (parsedMessage.type) {
      case "join":
        const roomId = parsedMessage.payload.roomId;

        if (!rooms.has(roomId)) rooms.set(roomId, new Set());

        ++userCount;
        rooms.get(roomId)!.add(socket);

        console.log("user connected: ", userCount);
        break;

      case "chat":
        rooms.forEach((room) => {
          if (room.has(socket)) {
            room.forEach((s) => {
              if (s !== socket) s.send(parsedMessage.payload.message);
            });
          }
        });
        break;

      case "leave":
        leaveRoom(socket);
    }
  });

  socket.on("close", (e) => {
    leaveRoom(socket);
  });
});

// Message format:

// 1. JOIN
// {
//   "type": "join",
//   "payload": {
//     "roomId": "123"
//   }
// }

// 2. CHAT
// {
//   "type": "chat",
//   "payload": {
//     "message": "hi there"
//   }
// }

// 3. LEAVE
// {
//   "type": "leave"
// }
