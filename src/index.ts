import cluster from "node:cluster";
import { cpus } from "node:os";
import { env, argv } from "node:process";
import { config } from "dotenv";
import { CrudServer } from "./modules/crudServer";
import { LoadBalancer } from "./modules/loadBalancer";

config();

const port = +(env.PORT ?? 4000);
const serverMode = argv.some((arg) => arg === "--multi");
if (cluster.isPrimary) {
  console.log("multi mode:", serverMode);
  const cpuAmount = cpus().length;
  let subPort = port;
  console.log("Load balancer port:", port);
  cpus().forEach(() => cluster.fork({ PORT: ++subPort }));
  const _loadBalancer = new LoadBalancer(port, cpuAmount);
} else {
  const _srv = new CrudServer(port);
}
