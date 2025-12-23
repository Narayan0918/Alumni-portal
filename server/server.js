const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const http = require("http"); // Native Node Module
const { Server } = require("socket.io"); // Socket.IO
const pool = require("./config/db"); // Import DB for saving messages

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// Create HTTP Server and wrap Express
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Your Frontend URL
        methods: ["GET", "POST"]
    }
});

// Routes
app.use("/api/v1/auth", require("./routes/auth"));
app.use("/api/v1/users", require("./routes/users"));
app.use("/api/v1/jobs", require("./routes/jobs"));
app.use("/api/v1/donations", require("./routes/donations"));
app.use("/api/v1/events", require("./routes/events"));
app.use("/api/v1/stories", require("./routes/stories"));
app.use("/api/v1/chat", require("./routes/chat")); // Add Chat Route
app.use("/api/v1/feed", require("./routes/feed"));

// --- SOCKET.IO LOGIC ---
// Store connected users: Map<UserID, SocketID>
const onlineUsers = new Map();

io.on("connection", (socket) => {
    // 1. User Connects
    console.log(`User Connected: ${socket.id}`);

    // Listen for "join" event from frontend to map UserID -> SocketID
    socket.on("join_chat", (userId) => {
        onlineUsers.set(userId, socket.id);
        console.log(`Mapped User ${userId} to ${socket.id}`);
        // Notify everyone who is online (optional)
        io.emit("online_users", Array.from(onlineUsers.keys()));
    });

    // 2. Sending a Message
    socket.on("send_message", async (data) => {
        const { sender_id, receiver_id, content } = data;

        // A. Save to Database (Persistence)
        try {
            await pool.query(
                "INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3)",
                [sender_id, receiver_id, content]
            );
        } catch (err) {
            console.error("Error saving message:", err);
        }

        // B. Send to Receiver (Real-time)
        const receiverSocketId = onlineUsers.get(receiver_id);
        
        if (receiverSocketId) {
            // If user is online, push message instantly
            io.to(receiverSocketId).emit("receive_message", data);
        }
    });

    // 3. Disconnect
    socket.on("disconnect", () => {
        // Remove user from map
        for (let [key, value] of onlineUsers.entries()) {
            if (value === socket.id) {
                onlineUsers.delete(key);
                break;
            }
        }
        console.log("User Disconnected", socket.id);
    });
});

const PORT = process.env.PORT || 5000;

// Change app.listen to server.listen
server.listen(PORT, () => {
  console.log(`🚀 Server (HTTP + Socket) running on port ${PORT}`);
});