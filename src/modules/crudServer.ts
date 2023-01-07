import {
  createServer,
  Server,
  IncomingMessage,
  ServerResponse,
} from "node:http";
import {
  METHOD,
  ERROR,
  ENDPOINT,
  HEADER_JSON,
  HEADER_TEXT,
} from "./staticData";

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
          console.log(ERROR.e404);
        } else {
          switch (req.method) {
            case METHOD.GET:
              res.writeHead(200, HEADER_JSON);
              res.end(JSON.stringify([]));
              console.log(METHOD.GET);
              break;
            case METHOD.POST:
              console.log(METHOD.POST);
              break;
            case METHOD.PUT:
              console.log(METHOD.PUT);
              break;
            case METHOD.DELETE:
              console.log(METHOD.DELETE);
              break;
            default:
              console.log(ERROR.e404);
          }
        }
      } catch {
        console.log(ERROR.e500);
      }
    });
  }
}
