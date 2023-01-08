import {
  createServer,
  Server,
  IncomingMessage,
  ServerResponse,
  request,
} from "node:http";
import { ERROR } from "./staticData";

export class LoadBalancer {
  private port: number = 0;
  private nextWorker: number = 0;
  private cpuAmount: number = 1;

  constructor(port = 4000, cpuAmount = 1) {
    this.init(port);
    this.port = port + 1;
    this.cpuAmount = cpuAmount;
  }

  private async init(port: number): Promise<void> {
    const server = await this.createServer();
    server.listen(port, () => {
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
        console.log(`serve: ${req.url}`);

        const options = {
          hostname: "localhost",
          port: this.getPort(),
          path: req.url,
          method: req.method,
          headers: req.headers,
        };
        console.log("req on port:", options.port);
        const proxy = request(options, function (proxyRes: IncomingMessage) {
          res.writeHead(proxyRes.statusCode ?? +ERROR.e500, proxyRes.headers);
          proxyRes.pipe(res, { end: true });
        });

        req.pipe(proxy, { end: true });
      } catch {
        console.log(ERROR.e500);
      }
    });
  }
}
