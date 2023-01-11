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
import { validate as isUuidValid } from "uuid";

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
        if (this.isRequestContainId(req)) {
          if (isUuidValid(this.getUuid(req.url))) {
            switch (req.method) {
              case METHOD.GET:
                console.log(METHOD.GET);
                this.onGetWithId(req, res);
                break;
              case METHOD.PUT:
                console.log(METHOD.PUT);
                await this.onPut(req, res);
                break;
              case METHOD.DELETE:
                console.log(METHOD.DELETE);
                await this.onDelete(req, res);
                break;
              default:
                console.log(CODE.e404);
                res.writeHead(CODE.e404, HEADER_TEXT);
                res.end(MESSAGE.NOT_FOUND);
            }
          } else {
            res.writeHead(CODE.e400, HEADER_TEXT);
            res.end(MESSAGE.INVALID_ID);
          }
        } else if (req?.url === ENDPOINT) {
          switch (req.method) {
            case METHOD.GET:
              console.log(METHOD.GET);
              const result = db.getAll();
              res.writeHead(CODE.c200, HEADER_JSON);
              res.end(JSON.stringify(result));
              break;
            case METHOD.POST:
              console.log(METHOD.POST);
              await this.onPost(req, res);
              break;
            default:
              console.log(CODE.e404);
              res.writeHead(CODE.e404, HEADER_TEXT);
              res.end(MESSAGE.NOT_FOUND);
          }
        } else {
          console.log(CODE.e404);
          res.writeHead(CODE.e404, HEADER_TEXT);
          res.end(MESSAGE.NOT_FOUND);
        }
      } catch {
        console.log(CODE.e500);
        res.writeHead(CODE.e500, HEADER_TEXT);
        res.end(MESSAGE.SERVER_ERROR);
      }
    });
  }

  onGetWithId(req: IncomingMessage, res: ServerResponse): void {
    const uuid = this.getUuid(req.url);
    const result = db.getById(uuid);
    if (result) {
      res.writeHead(CODE.c200, HEADER_JSON);
      res.end(JSON.stringify(result));
    } else {
      res.writeHead(CODE.e404, HEADER_TEXT);
      res.end(MESSAGE.NOT_FOUND);
    }
  }

  async onDelete(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const uuid = this.getUuid(req.url);
    if (db.remove(uuid)) {
      res.writeHead(CODE.c204, HEADER_TEXT);
      res.end();
      await this.sendDbToMaster();
    } else {
      res.writeHead(CODE.e404, HEADER_TEXT);
      res.end(MESSAGE.NOT_FOUND);
    }
  }

  async onPut(req: IncomingMessage, res: ServerResponse): Promise<void> {
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
    if (!db.isUserValid(parsedBody) || !isUuidValid(parsedBody.id)) {
      console.log(CODE.e400);
      res.writeHead(CODE.e400);
      res.end(MESSAGE.BAD_REQUEST);
      return;
    }
    try {
      if (db.update(parsedBody)) {
        console.log(CODE.c200);
        const user = db.getById(parsedBody.id);
        res.writeHead(CODE.c200, HEADER_JSON);
        res.end(JSON.stringify(user));
        await this.sendDbToMaster();
      } else {
        console.log(CODE.e500);
        res.writeHead(CODE.e500, HEADER_TEXT);
        res.end(MESSAGE.SERVER_ERROR);
      }
    } catch {
      console.log(CODE.e500);
      res.writeHead(CODE.e500, HEADER_TEXT);
      res.end(MESSAGE.SERVER_ERROR);
    }
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
      await this.sendDbToMaster();
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

  private getUuid(url: string = ""): string {
    return url.replace(`${ENDPOINT}/`, "") ?? "";
  }

  private isRequestContainId(req: IncomingMessage): boolean {
    return /^\/api\/users\/(\w|\-)+$/.test(req.url ?? "");
  }

  async sendDbToMaster(): Promise<void> {
    if (cluster.isWorker) {
      const data = await db.toJSON();
      process.send?.({ cmd: "refresh", data });
    }
  }
}
