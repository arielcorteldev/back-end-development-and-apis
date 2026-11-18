import http from 'http';
import fs from 'fs';
import { WebSocketServer, WebSocket } from 'ws';

const PORT = 3001;

// 1. Plain HTTP server: its only job is to serve the chat page
const server = http.createServer((req, res) => {
  fs.readFile("./public/index.html", (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Error loading page");
      return;
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(data);
  });
});

// 2. Attach the WebSocket server to the same HTTP server.
// Both share one port: normal requests go to http, "Upgrade" requests go to ws.
const wss = new WebSocketServer({ server });

// Helper: send an object to every client that is still connected
function broadcast(message) {
  const payload = JSON.stringify(message); // sockets send strings, not objects
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

// 3. Runs once for every new client that connects
wss.on("connection", (socket, req) => {
  // 4. Read ?username=... from the URL the client connected with
  const username = new URL(req.url, "http://localhost").searchParams.get(
    "username",
  );

  broadcast({ type: "system", text: `${username} joined` });

  // 5. Runs every time THIS client sends a message
  socket.on("message", (data) => {
    // `data` arrives as a Buffer, so convert to string before parsing
    const { username, text } = JSON.parse(data.toString());
    // Broadcast to everyone, including the sender
    broadcast({ type: "chat", username, text });
  });

  // 6. Runs when this client disconnects
  socket.on("close", () => {
    broadcast({ type: "system", text: `${username} left` });
  });
});

// 7. Start listening
server.listen(PORT, () => {
  console.log(`Chat server running at http://localhost:${PORT}`);
});
