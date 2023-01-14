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
  MESSAGE,
  CMD,
} from "./staticData.js";
import { db } from "./db.js";
import cluster from "node:cluster";
import { validate as isUuidValid } from "uuid";

export class CrudServer {
  server: Server | null = null;

  constructor(port = 4000) {
    this.init(port);
  }

  async init(port: number): Promise<void> {
    this.server = await this.createServer();
    this.server.listen(port, () => {
      console.log(`Server listening on port: ${port}`);
    });
  }

  private async createServer(): Promise<Server> {
    return createServer(async (req: IncomingMessage, res: ServerResponse) => {
      try {
        if (this.isRequestContainId(req)) {
          if (isUuidValid(this.getUuid(req.url))) {
            switch (req.method) {
              case METHOD.GET:
                this.onGetWithId(req, res);
                break;
              case METHOD.PUT:
                await this.onPut(req, res);
                break;
              case METHOD.DELETE:
                await this.onDelete(req, res);
                break;
              default:
                this.doResponse(res, CODE.E404);
            }
          } else {
            this.doResponse(res, CODE.E400);
          }
        } else if (req?.url === ENDPOINT) {
          switch (req.method) {
            case METHOD.GET:
              const users = db.getAll();
              this.doResponse(res, CODE.C200, JSON.stringify(users));
              break;
            case METHOD.POST:
              await this.onPost(req, res);
              break;
            default:
              this.doResponse(res, CODE.E404);
          }
        } else {
          this.doResponse(res, CODE.E404);
        }
      } catch {
        this.doResponse(res, CODE.E500);
      }
    });
  }

  private onGetWithId(req: IncomingMessage, res: ServerResponse): void {
    const uuid = this.getUuid(req.url);
    const user = db.getById(uuid);
    if (user) {
      this.doResponse(res, CODE.C200, JSON.stringify(user));
    } else {
      this.doResponse(res, CODE.E404);
    }
  }

  private async onDelete(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> {
    const uuid = this.getUuid(req.url);
    if (db.remove(uuid)) {
      this.doResponse(res, CODE.C204);
      await this.sendDbToMaster();
    } else {
      this.doResponse(res, CODE.E404);
    }
  }

  private async onPut(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> {
    const body = await this.getBody(req);
    const id = this.getUuid(req.url);
    let parsedBody: unknown;
    try {
      parsedBody = await JSON.parse(body);
    } catch {
      this.doResponse(res, CODE.E400, MESSAGE.BAD_REQUEST);
      return;
    }
    if (!db.isUserValid(parsedBody)) {
      this.doResponse(res, CODE.E400, MESSAGE.BAD_REQUEST);
      return;
    }
    if (!isUuidValid(parsedBody.id) || parsedBody.id !== id) {
      this.doResponse(res, CODE.E400);
      return;
    }
    if (!db.getById(id)) {
      this.doResponse(res, CODE.E404);
      return;
    }
    try {
      if (db.update(parsedBody)) {
        const user = db.getById(parsedBody.id);
        this.doResponse(res, CODE.C200, JSON.stringify(user));
        await this.sendDbToMaster();
      } else {
        this.doResponse(res, CODE.E400);
      }
    } catch {
      this.doResponse(res, CODE.E500);
    }
  }

  private async onPost(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> {
    const body = await this.getBody(req);
    let parsedBody: unknown;
    try {
      parsedBody = await JSON.parse(body);
    } catch {
      this.doResponse(res, CODE.E400, MESSAGE.BAD_REQUEST);
      return;
    }
    if (!db.isUserValid(parsedBody)) {
      this.doResponse(res, CODE.E400, MESSAGE.BAD_REQUEST);
      return;
    }
    try {
      const user = db.create(
        parsedBody.username,
        parsedBody.age,
        parsedBody.hobbies
      );
      this.doResponse(res, CODE.C201, JSON.stringify(user));
      await this.sendDbToMaster();
    } catch {
      this.doResponse(res, CODE.E500);
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

  private async sendDbToMaster(): Promise<void> {
    if (cluster.isWorker) {
      const data = await db.toJSON();
      process.send?.({ cmd: CMD, data });
    }
  }

  private doResponse(res: ServerResponse, code: CODE, body = ""): void {
    let message = body;
    if (!message) {
      switch (code) {
        case CODE.E400:
          message = MESSAGE.INVALID_ID;
          break;
        case CODE.E404:
          message = MESSAGE.NOT_FOUND;
          break;
        case CODE.E500:
          message = MESSAGE.SERVER_ERROR;
          break;
        default:
      }
    }
    res.writeHead(code, HEADER_JSON).end(message);
  }
}
