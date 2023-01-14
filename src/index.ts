import cluster from "node:cluster";
import { cpus } from "node:os";
import { env, argv } from "node:process";
import { config } from "dotenv";
import { CrudServer } from "./modules/crudServer.js";
import { LoadBalancer } from "./modules/loadBalancer.js";
import { db } from "./modules/db.js";
import { CMD } from "./modules/staticData.js";

config();

let server: LoadBalancer | CrudServer;
const port = +(env.PORT ?? 4000);
const serverMode = argv.some((arg) => arg === "--multi");
if (cluster.isPrimary && serverMode) {
  console.log("Multi mode:", serverMode);
  const cpuAmount = cpus().length;
  let subPort = port;
  console.log("Load balancer port:", port);
  cpus().forEach(() => {
    const worker = cluster.fork({ PORT: ++subPort });
    worker.on("message", (message: any): void => {
      if (message.cmd === CMD) {
        const { data } = message;
        if (cluster.workers) {
          Object.values(cluster.workers).forEach((worker) => {
            worker?.send({ cmd: CMD, data });
          });
        }
      }
    });
  });
  server = new LoadBalancer(port, cpuAmount);
} else {
  process.on("message", async (message: any): Promise<void> => {
    try {
      if (message.cmd && message.cmd === CMD) {
        await db.load(message.data);
      }
    } catch (error) {
      console.log("Worker error: ", error);
    }
  });
  server = new CrudServer(port);
}

export { server };
