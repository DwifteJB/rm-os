
import { RequestListener } from 'node:http';

interface Middleware extends RequestListener {
    upgrade: (req: any, socket: any, head: any) => void;
}

export function createMiddleware(): Middleware;