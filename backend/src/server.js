import dotenv from "dotenv";

dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";

import http from "http";
import { Server } from "socket.io";

const PORT = process.env.PORT || 5000;

connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);

    console.log(`${socket.id} joined room ${roomId}`);

    const clients = io.sockets.adapter.rooms.get(roomId);

    if (clients && clients.size > 1) {
      socket.to(roomId).emit("ready");
    }
  });

  // Chat
  socket.on("sendMessage", (data) => {
    io.to(data.roomId).emit("receiveMessage", data);
  });

  // WebRTC Offer
  socket.on("offer", (data) => {
    console.log("OFFER");
    socket.to(data.roomId).emit("offer", data);
  });

  // WebRTC Answer
  socket.on("answer", (data) => {
    console.log("ANSWER");
    socket.to(data.roomId).emit("answer", data);
  });

  // ICE Candidate
  socket.on("iceCandidate", (data) => {
    console.log("ICE");
    socket.to(data.roomId).emit("iceCandidate", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
