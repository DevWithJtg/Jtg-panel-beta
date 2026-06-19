import Docker from "dockerode";
import fs from "fs-extra";
import path from "path";
import { io } from "../../../server.js"; // Import socket for logs

const isSandbox = !fs.existsSync("/var/run/docker.sock") && process.platform !== "win32";

export const docker = new Docker({ socketPath: process.platform === 'win32' ? '//./pipe/docker_engine' : '/var/run/docker.sock' });

export const getPaperVersions = async () => {
  // Using an open API to get PaperMC versions
  try {
    const res = await fetch("https://api.papermc.io/v2/projects/paper");
    const data = (await res.json()) as any;
    return data.versions.reverse();
  } catch (err) {
    return ["1.21.1", "1.21", "1.20.6", "1.20.4", "1.19.4"];
  }
};

const DOCKER_IMAGE = "itzg/minecraft-server";

export const createServerContainer = async (serverData: any) => {
  if (isSandbox) {
    console.log("[Mock] Created server container for", serverData.name);
    return "mock-container-id-" + Date.now();
  }

  // Pull image if not exists
  console.log(`Ensuring ${DOCKER_IMAGE} is pulled...`);
  await new Promise((resolve, reject) => {
    docker.pull(DOCKER_IMAGE, (err: any, stream: any) => {
      if (err) return reject(err);
      docker.modem.followProgress(stream, onFinished, onProgress);
      function onFinished(err: any, output: any) {
        if (err) return reject(err);
        resolve(output);
      }
      function onProgress(event: any) {}
    });
  });

  const serverDir = path.join(process.cwd(), "data", "servers", serverData.id);
  await fs.ensureDir(serverDir);

  const container = await docker.createContainer({
    Image: DOCKER_IMAGE,
    name: `jtg-server-${serverData.id}`,
    Env: [
      `EULA=TRUE`,
      `TYPE=PAPER`,
      `VERSION=${serverData.version}`,
      `MEMORY=${serverData.ram}G`
    ],
    HostConfig: {
      PortBindings: {
        "25565/tcp": [
          {
            HostPort: `${serverData.port}`
          }
        ]
      },
      Binds: [`${serverDir}:/data`]
    }
  });

  return container.id;
};

export const startContainer = async (containerId: string) => {
  if (isSandbox) {
    console.log("[Mock] Started server container", containerId);
    return;
  }
  const container = docker.getContainer(containerId);
  await container.start();
};

export const stopContainer = async (containerId: string) => {
  if (isSandbox) {
    console.log("[Mock] Stopped server container", containerId);
    return;
  }
  const container = docker.getContainer(containerId);
  await container.stop();
};

export const restartContainer = async (containerId: string) => {
  if (isSandbox) {
    console.log("[Mock] Restarted server container", containerId);
    return;
  }
  const container = docker.getContainer(containerId);
  await container.restart();
};

export const deleteContainer = async (containerId: string) => {
  if (isSandbox) {
    console.log("[Mock] Deleted server container", containerId);
    return;
  }
  const container = docker.getContainer(containerId);
  try {
    const info = await container.inspect();
    if (info.State.Running) {
      await container.stop();
    }
    await container.remove();
  } catch (err) {
    console.error("Error deleting container", err);
  }
};

export const getContainerStatus = async (containerId: string) => {
  if (isSandbox) {
    return { State: { Running: false, Status: "exited" } };
  }
  try {
    const container = docker.getContainer(containerId);
    const info = await container.inspect();
    return info;
  } catch (e) {
    return null;
  }
};
