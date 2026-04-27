require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const connectDatabase = require("./config/db");
const { registerChatHandlers } = require("./sockets/chat.socket");

const port = process.env.PORT || 5000;

async function bootstrap() {
  await connectDatabase();

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "*",
      credentials: true
    }
  });

  app.set("io", io);
  registerChatHandlers(io);

  server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
