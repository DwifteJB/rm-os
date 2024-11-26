import { checkForBadWords } from "../lib/badWordDetector";
import express from 'express';
import expressWs from "express-ws"
import prisma from "../lib/Prisma";

import crypto from "crypto";

// we generate username so its anon!
const generateUsername = (req: express.Request) => {
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const uniqueString = `${userAgent}-${ip}`;
    const username = crypto.createHash('md5').update(uniqueString).digest('hex').substring(0, 8);

    return username
}

export default function ChatRoutes(app: expressWs.Application) {
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

    app.post("/api/v1/chat/send", async (req, res) => {
        const username = generateUsername(req);

        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                error: "Message is required"
            });
        }

        if (message.length > 300) {
            return res.status(400).json({
                error: "Message is too long"
            });
        }

        const badWordResponse = await checkForBadWords(message);

        if (badWordResponse.isProfanity) {
            return res.status(400).json({
                error: "Message contains bad words"
            });
        }

        await prisma.message.create({
            data: {
                author: username,
                content: message
            }
        });

        res.json({
            success: true
        });
    });
}