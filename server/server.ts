import wisp from "wisp-server-node";
import { createBareServer } from "@tomphttp/bare-server-node";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { bareModulePath } from "@mercuryworkshop/bare-as-module3";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";
import express from "express";
import { createServer } from "node:http";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import 'dotenv/config'
import ChatRoutes from "./src/routes/chat";

import expressWs from "express-ws";

const bare = createBareServer("/bare/");
const __dirname = fileURLToPath(new URL(".", import.meta.url));
const publicPath = "dist";

const { app, getWss, applyTo } = expressWs(express());


app.use(express.static(join(__dirname, publicPath)));
app.use("/uv/", express.static(uvPath));
console.log(uvPath);
console.log;
app.use("/epoxy/", express.static(epoxyPath));
app.use("/baremux/", express.static(baremuxPath));
app.use("/baremod/", express.static(bareModulePath));

ChatRoutes(app);

app.use((req, res) => {
  console.log("404", req.url);
  res.status(404);
  res.json({
    error: "Not Found",
    url: req.url,
    xfdfaad: JSON.stringify(req.headers),
  });
});



const server = createServer();

server.on("request", (req, res) => {
  if (bare.shouldRoute(req)) {
    bare.routeRequest(req, res);
  } else {
    app(req, res);
  }
});

server.on("upgrade", (req, socket, head) => {
  if (req.url.endsWith("/wisp/")) {
    wisp.routeRequest(req, socket, head);
  } else if (bare.shouldRoute(req)) {
    bare.routeUpgrade(req, socket, head);
  } else {
    socket.end();
  }
});

let port = parseInt(process.env.PORT || "");

if (isNaN(port)) port = 8080;

server.on("listening", () => {
  const address = server.address();
  if (!address && !address.port) return;
  console.log("rm-os on:");
  console.log(`\thttp://localhost:${address.port}`);
  console.log(
    `\thttp://${
      address.family === "IPv6" ? `[${address.address}]` : address.address
    }:${address.port}`,
  );
});

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

function shutdown() {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close();
  bare.close();
  process.exit(0);
}

server.listen({
  port,
});
