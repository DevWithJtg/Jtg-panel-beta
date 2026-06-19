import express from "express";
import { getPaperVersions } from "../services/docker.js";
import { requireAuth } from "../middleware/auth.js";
import os from "os";

const router = express.Router();

router.use(requireAuth);

router.get("/paper-versions", async (req, res) => {
  const versions = await getPaperVersions();
  res.json(versions);
});

router.get("/stats", (req, res) => {
  const cpus = os.cpus();
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  
  res.json({
    cpuUsage: Math.round(os.loadavg()[0] * 100) / 100, // rough approx
    totalMemory,
    freeMemory,
    ramUsage: Math.round(((totalMemory - freeMemory) / totalMemory) * 100),
    diskUsage: 0, // Mocked for now
  });
});

export default router;
