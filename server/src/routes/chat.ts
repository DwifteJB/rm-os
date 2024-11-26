import { checkForBadWords } from "../lib/badWordDetector";
import express from 'express';
import expressWs from "express-ws"
import prisma from "../lib/Prisma";

import crypto from "crypto";
import * as ws from "ws";


// we generate username so its anon!
const generateUsername = (req: express.Request) => {
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const uniqueString = `${userAgent}-${ip}`;
    const username = crypto.createHash('md5').update(uniqueString).digest('hex').substring(0, 8);

    return username
}

export default function ChatRoutes(app: expressWs.Application, getWss: () => ws.Server) {
    app.ws("/api/v1/chat/ws", (ws, req) => {
        const username = generateUsername(req);
        (ws as any).username = username;
        console.log("Websocket connected");

        ws.send(JSON.stringify({
            type: "username",
            username
        }));

        ws.on("close", () => {
            console.log("Websocket disconnected");
        });

        ws.on("message", async (message) => {
            const parsed = JSON.parse(message.toString());

            if (parsed.type === "message") {
                    
                const badWordResponse = await checkForBadWords(parsed.message as string);

                if (badWordResponse.isProfanity) {
                    ws.send(JSON.stringify({
                        type: "error",
                        message: "Message contains bad words"
                    }));
                    return;
                }

                await prisma.message.create({
                    data: {
                        content: parsed.message as string,
                        author: (ws as any).username
                    }
                });

                getWss().clients.forEach(client => {
                    client.send(JSON.stringify({
                        type: "message",
                        message: parsed.message,
                    }));
                });
            }
        });
    });

    app.get("/api/v1/chat/getMessages", async (req, res) => {
        const messages = await prisma.message.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            take: 50
        });

        res.json(messages);
    });

    app.get("/api/v1/chat/whoamI", async (req, res) => {
        const username = generateUsername(req);

        res.json({
            username
        });
    });
} 