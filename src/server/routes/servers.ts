import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { getServers, createServer, getServer, deleteServer, startServer, stopServer, restartServer, getFiles, uploadFile, deleteFile } from "../controllers/servers.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "data/temp/" });

router.use(requireAuth);

router.get("/", getServers);
router.post("/", createServer);
router.get("/:id", getServer);
router.delete("/:id", deleteServer);

router.post("/:id/start", startServer);
router.post("/:id/stop", stopServer);
router.post("/:id/restart", restartServer);

// Simple file endpoints
router.get("/:id/files", getFiles);
router.post("/:id/files/upload", upload.single("file"), uploadFile);
router.delete("/:id/files", deleteFile);

export default router;
