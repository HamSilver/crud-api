import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { env } from "process";

const __dirname = dirname(fileURLToPath(import.meta.url));

const config = {
  entry: resolve(__dirname, "dist/index.js"),
  mode: env.NODE_ENV === "production" ? "production" : "development",
  output: {
    path: resolve(__dirname, "bundle"),
    filename: "index.cjs",
  },
  module: {
    rules: [
      {
        test: /\.(ts)$/i,
        use: "ts-loader",
        exclude: ["/node_modules/"],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  target: "node",
};

export default () => config;
