import { env, argv } from "node:process";
import { config } from "dotenv";
import { CrudServer } from "./modules/crudServer";

config();

const port = +(env.PORT ?? 4000);
const serverMode = argv.some((arg) => arg === "--multi");
console.log("port:", port);
console.log("multi mode:", serverMode);

const srv = new CrudServer(port);

