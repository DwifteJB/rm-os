import express from "express";
import { createServer } from "node:http";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
const server = createServer(app);

app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

app.use(
  "/bare/",
  createProxyMiddleware({
    target: "http://localhost:8080/bare/",
    ws: true,
    changeOrigin: true,
    pathRewrite: {
      "^/bare/": "/",
    },
  }),
);

app.use(
  "/uv/",
  createProxyMiddleware({
    target: "http://localhost:8080/uv/",
    changeOrigin: true,
    ws: true,
    pathRewrite: {
      "^/uv/": "/",
    },
  }),
);

app.use(
  "/epoxy/",
  createProxyMiddleware({
    target: "http://localhost:8080/epoxy/",
    changeOrigin: true,
    ws: true,
    pathRewrite: {
      "^/epoxy/": "/",
    },
  }),
);

app.use(
  "/baremux/",
  createProxyMiddleware({
    target: "http://localhost:8080/baremux/",
    changeOrigin: true,
    ws: true,
    pathRewrite: {
      "^/baremux/": "/",
    },
  }),
);

app.use(
  "/baremod/",
  createProxyMiddleware({
    target: "http://localhost:8080/baremod/",
    changeOrigin: true,
    ws: true,
    pathRewrite: {
      "^/baremod/": "/",
    },
  }),
);

app.use(
  "/",
  createProxyMiddleware({
    target: "http://localhost:5173",
    ws: true,
    changeOrigin: true,
  }),
);

const port = 3000;
server.listen(port, () => {
  console.log(
    `Vite development proxy server running at http://localhost:${port}`,
  );
});
