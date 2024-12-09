import { checkForBadWords } from "../lib/badWordDetector";
import express from "express";
import expressWs from "express-ws";
import prisma from "../lib/Prisma";

import crypto from "crypto";
import * as ws from "ws";

const rateLimittedIps = new Map<string, number>();

/*
 event.context.ip =
    getHeader(event, "cf-connecting-ip") ||
    getHeader(event, "x-real-ip") ||
    getHeader(event, "x-forwarded-for");
*/

// we generate username so its anon!
const generateUsername = (req: express.Request) => {
  const userAgent = req.headers["user-agent"] || "unknown";
  const ip =
    req.headers["CF-Connecting-IP"] ||
    req.headers["x-real-ip"] ||
    req.headers["x-forwarded-for"] ||
    "unknown";
  const uniqueString = `${ip}-${userAgent}`;
  const username = crypto
    .createHash("md5")
    .update(uniqueString)
    .digest("hex")
    .substring(0, 8);

  return username;
};

const RemoveInactiveIps = () => {
  rateLimittedIps.forEach((value, key) => {
    if (value < Date.now() + 1000 * 20) {
      rateLimittedIps.delete(key);
    }
  });
}

export default function ChatRoutes(
  app: expressWs.Application,
  getWss: () => ws.WebSocketServer,
) {


  app.use((req, res, next) => {
    // check if websocket
    if (!req.path.startsWith("/chat")) {
      return next();
    }
    
    RemoveInactiveIps();

    const ip =
      req.headers["CF-Connecting-IP"] ||
      req.headers["x-real-ip"] ||
      req.headers["x-forwarded-for"] ||
      "unknown";

    if (rateLimittedIps.has(ip as string)) {
      if (rateLimittedIps.get(ip as string)! > Date.now()) {
        res.status(429).json({
          error: "Rate limited",
        });
        return;
      }
    }

    rateLimittedIps.set(ip as string, Date.now() + 1000 * 2); // 2 seconds

    next();

  })

  app.ws("/chat", (ws, req) => {
    const username = generateUsername(req);
    (ws as any).username = username;
    console.log("Websocket connected");

    ws.send(
      JSON.stringify({
        type: "username",
        username,
      }),
    );

    ws.on("close", () => {
      console.log("Websocket disconnected");
    });

    ws.on("error", (err) => {
      console.error("Websocket error:", err);
      ws.close();
    });

    ws.on("message", async (message) => {
      const parsed = JSON.parse(message.toString());

      if (parsed.type === "message") {
        const badWordResponse = await checkForBadWords(
          parsed.message as string,
        );

        console.log(badWordResponse);

        if (badWordResponse.isProfanity) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Message contains bad words",
            }),
          );
          return;
        }

        await prisma.message.create({
          data: {
            content: parsed.message as string,
            author: (ws as any).username,
          },
        });

        getWss().clients.forEach((client) => {
          client.send(
            JSON.stringify({
              type: "message",
              message: parsed.message,
              username: (ws as any).username,
            }),
          );
        });

        ws.send(
          JSON.stringify({
            type: "messageSent",
          }),
        );
      }
    });
  });

  app.get("/chat/getMessages", async (req, res) => {
    let page = parseInt(req.query.page as string) || 1;

    if (page < 1) {
      page = 1;
    }

    const messages = await prisma.message.findMany({
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * 10,
      take: 10,
      select: {
        content: true,
        author: true,
        createdAt: true,
      },
    });

    console.log("sending", messages);

    res.json(messages);
  });

  app.get("/chat/whoamI", async (req, res) => {
    const username = generateUsername(req);

    res.json({
      username,
    });
  });
}
