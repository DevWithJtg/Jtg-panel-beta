import express from "express";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { createServer as createViteServer } from "vite";
import fs from "fs-extra";

const app = express();
const httpServer = createServer(app);
export const io = new SocketIOServer(httpServer, {
  cors: { origin: "*" },
});

// Using port 3000 to comply with Cloud Run requirements. 
// PM2 config may set it to 6767 for local deployment
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Using built in cookie-parser if we need it, but we can just use jsonwebtoken
// Actually I missed cookie-parser in the package installation, let's try reading cookies from headers or install it.
// I can just parse it manually or send it in Auth header. Let's use Auth header for simplicity.
app.use(cors());

// Initialize data folders
const DATA_DIR = path.join(process.cwd(), "data");
const SERVERS_DIR = path.join(DATA_DIR, "servers");
const BACKUPS_DIR = path.join(process.cwd(), "backups");

fs.ensureDirSync(DATA_DIR);
fs.ensureDirSync(SERVERS_DIR);
fs.ensureDirSync(BACKUPS_DIR);

if (!fs.existsSync(path.join(DATA_DIR, "users.json"))) fs.writeFileSync(path.join(DATA_DIR, "users.json"), "[]");
if (!fs.existsSync(path.join(DATA_DIR, "servers.json"))) fs.writeFileSync(path.join(DATA_DIR, "servers.json"), "[]");
if (!fs.existsSync(path.join(DATA_DIR, "settings.json"))) fs.writeFileSync(path.join(DATA_DIR, "settings.json"), "{}");

import apiRoutes from "./src/server/routes/api.js";
app.use("/api", apiRoutes);

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, () => {
    console.log(`JTG Panel running on port ${PORT}`);
  });
}

startServer();
