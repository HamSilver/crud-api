import {
  createServer,
  Server,
  IncomingMessage,
  ServerResponse,
  request,
} from "node:http";
import { CODE, HEADER_JSON, MESSAGE } from "./staticData.js";

export class LoadBalancer {
  server: Server | null = null;
  private port: number = 0;
  private nextWorker: number = 0;
  private cpuAmount: number = 1;

  constructor(port = 4000, cpuAmount = 1) {
    this.init(port);
    this.port = port + 1;
    this.cpuAmount = cpuAmount;
  }

  private async init(port: number): Promise<void> {
    this.server = await this.createServer();
    this.server.listen(port, () => {
      console.log(`LoadBalancer listening on port: ${port}`);
    });
  }

  private getPort(): number {
    if (this.nextWorker < this.cpuAmount) {
      return this.port + this.nextWorker++;
    }
    this.nextWorker = 0;
    return this.port;
  }

  private async createServer(): Promise<Server> {
    return createServer(async (req: IncomingMessage, res: ServerResponse) => {
      try {
        const options = {
          hostname: "localhost",
          port: this.getPort(),
          path: req.url,
          method: req.method,
          headers: req.headers,
        };
        const proxy = request(options, function (proxyRes: IncomingMessage) {
          res.writeHead(proxyRes.statusCode ?? CODE.E500, proxyRes.headers);
          proxyRes.pipe(res, { end: true });
        });

        req.pipe(proxy, { end: true });
      } catch {
        res.writeHead(CODE.E500, HEADER_JSON).end(MESSAGE.SERVER_ERROR);
      }
    });
  }
}
