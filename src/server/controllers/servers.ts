import { Request, Response } from "express";
import { readJSON, writeJSON } from "../services/db.js";
import { createServerContainer, startContainer, stopContainer, restartContainer, deleteContainer, getContainerStatus } from "../services/docker.js";
import { v4 as uuidv4 } from "uuid";
import fs from "fs-extra";
import path from "path";

export const getServers = async (req: Request, res: Response) => {
  const servers = await readJSON("servers.json") || [];
  
  // Update statuses
  const updatedServers = await Promise.all(servers.map(async (server: any) => {
    if (server.containerId) {
      const status = await getContainerStatus(server.containerId);
      server.status = status?.State?.Running ? "online" : "offline";
    }
    return server;
  }));

  res.json(updatedServers);
};

export const getServer = async (req: Request, res: Response) => {
  const { id } = req.params;
  const servers = await readJSON("servers.json") || [];
  const server = servers.find((s: any) => s.id === id);
  if (!server) {
    res.status(404).json({ error: "Server not found" });
    return;
  }
  const status = await getContainerStatus(server.containerId);
  server.status = status?.State?.Running ? "online" : "offline";
  res.json(server);
};

export const createServer = async (req: Request, res: Response) => {
  const { name, ram, port, version } = req.body;
  if (!name || !ram || !port || !version) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const id = uuidv4();
  const serverData = {
    id,
    name,
    owner: (req as any).user.id,
    ram,
    port,
    version,
    status: "installing",
    createdAt: new Date().toISOString(),
    containerId: null,
  };

  const servers = await readJSON("servers.json") || [];
  servers.push(serverData);
  await writeJSON("servers.json", servers);

  try {
    const containerId = await createServerContainer(serverData);
    serverData.containerId = containerId;
    serverData.status = "offline";
    await writeJSON("servers.json", Object.assign(servers, servers.map((s:any)=>s.id===id?serverData:s)));
    res.json(serverData);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteServer = async (req: Request, res: Response) => {
  const { id } = req.params;
  let servers = await readJSON("servers.json") || [];
  const server = servers.find((s: any) => s.id === id);
  
  if (server) {
    if (server.containerId) {
      await deleteContainer(server.containerId);
    }
    servers = servers.filter((s: any) => s.id !== id);
    await writeJSON("servers.json", servers);
    // Remove files
    const serverDir = path.join(process.cwd(), "data", "servers", id);
    await fs.remove(serverDir);
  }
  
  res.json({ success: true });
};

export const startServer = async (req: Request, res: Response) => {
  const { id } = req.params;
  const servers = await readJSON("servers.json") || [];
  const server = servers.find((s: any) => s.id === id);
  if (server && server.containerId) {
    await startContainer(server.containerId);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Not found" });
  }
};

export const stopServer = async (req: Request, res: Response) => {
  const { id } = req.params;
  const servers = await readJSON("servers.json") || [];
  const server = servers.find((s: any) => s.id === id);
  if (server && server.containerId) {
    await stopContainer(server.containerId);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Not found" });
  }
};

export const restartServer = async (req: Request, res: Response) => {
  const { id } = req.params;
  const servers = await readJSON("servers.json") || [];
  const server = servers.find((s: any) => s.id === id);
  if (server && server.containerId) {
    await restartContainer(server.containerId);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Not found" });
  }
};

// File manager basics
export const getFiles = async (req: Request, res: Response) => {
  const { id } = req.params;
  const dirPath = req.query.path ? String(req.query.path) : "/";
  const targetPath = path.join(process.cwd(), "data", "servers", id, dirPath);
  
  if (!targetPath.startsWith(path.join(process.cwd(), "data", "servers", id))) {
    return res.status(403).json({ error: "Invalid path" });
  }

  try {
    await fs.ensureDir(targetPath);
    const files = await fs.readdir(targetPath, { withFileTypes: true });
    res.json(files.map(f => ({
      name: f.name,
      isDirectory: f.isDirectory(),
      size: f.isDirectory() ? 0 : fs.statSync(path.join(targetPath, f.name)).size
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const uploadFile = async (req: Request, res: Response) => {
  const { id } = req.params;
  const dirPath = req.body.path || "/";
  const targetPath = path.join(process.cwd(), "data", "servers", id, dirPath);
  
  if (req.file) {
    await fs.ensureDir(targetPath);
    await fs.move(req.file.path, path.join(targetPath, req.file.originalname), { overwrite: true });
  }
  res.json({ success: true });
};

export const deleteFile = async (req: Request, res: Response) => {
  const { id } = req.params;
  const filePath = req.body.path;
  const targetPath = path.join(process.cwd(), "data", "servers", id, filePath);
  
  if (!targetPath.startsWith(path.join(process.cwd(), "data", "servers", id))) {
    return res.status(403).json({ error: "Invalid path" });
  }

  try {
    await fs.remove(targetPath);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};
