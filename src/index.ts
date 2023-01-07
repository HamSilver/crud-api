import { env } from "node:process";
import { config } from "dotenv";
import { CrudServer } from "./modules/crudServer";

config();

const port = +(env.PORT ?? 4000);
console.log("port:", port);

const srv = new CrudServer(port);
