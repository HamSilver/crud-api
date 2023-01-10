import {
  createServer,
  Server,
  IncomingMessage,
  ServerResponse,
} from "node:http";
import {
  METHOD,
  CODE,
  ENDPOINT,
  HEADER_JSON,
  HEADER_TEXT,
  MESSAGE,
} from "./staticData.js";
import { db } from "./db.js";
import cluster from "node:cluster";

export class CrudServer {
  constructor(port = 4000) {
    this.init(port);
  }

  async init(port: number): Promise<void> {
    const server = await this.createServer();
    server.listen(port, () => {
      console.log(`Server listening on port: ${port}`);
    });
  }

  async createServer(): Promise<Server> {
    return createServer(async (req: IncomingMessage, res: ServerResponse) => {
      try {
        if (req.url && !req.url.startsWith(ENDPOINT)) {
          console.log(CODE.e404);
        } else {
          switch (req.method) {
            case METHOD.GET:
              res.writeHead(CODE.c200, HEADER_JSON);
              const result = db.getAll();
              res.end(JSON.stringify(result));
              console.log(METHOD.GET);
              break;
            case METHOD.POST:
              console.log(METHOD.POST);
              await this.onPost(req, res);
              break;
            case METHOD.PUT:
              console.log(METHOD.PUT);
              break;
            case METHOD.DELETE:
              console.log(METHOD.DELETE);
              break;
            default:
              console.log(CODE.e404);
              res.writeHead(CODE.e404, HEADER_TEXT);
              res.end(MESSAGE.NOT_FOUND);
          }
        }
      } catch {
        console.log(CODE.e500);
        res.writeHead(CODE.e500, HEADER_TEXT);
        res.end(MESSAGE.SERVER_ERROR);
      }
    });
  }

  async onPost(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const body = await this.getBody(req);
    let parsedBody: unknown;
    try {
      parsedBody = await JSON.parse(body);
    } catch {
      console.log(CODE.e400);
      res.writeHead(CODE.e400, HEADER_TEXT);
      res.end(MESSAGE.BAD_REQUEST);
      return;
    }
    if (!db.isUserValid(parsedBody)) {
      console.log(CODE.e400);
      res.writeHead(CODE.e400);
      res.end(MESSAGE.BAD_REQUEST);
      return;
    }
    try {
      const user = db.create(
        parsedBody.username,
        parsedBody.age,
        parsedBody.hobbies
      );
      console.log(CODE.c201);
      res.writeHead(CODE.c201, HEADER_JSON);
      res.end(JSON.stringify(user));
      if (cluster.isWorker) {
        const data = await db.toJSON();
        process.send?.({ cmd: "refresh", data });
      }
    } catch {
      console.log(CODE.e500);
      res.writeHead(CODE.e500, HEADER_TEXT);
      res.end(MESSAGE.SERVER_ERROR);
    }
  }

  private async getBody(req: IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          resolve(body);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}
