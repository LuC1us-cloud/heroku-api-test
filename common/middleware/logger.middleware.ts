import { Request, Response, NextFunction } from 'express';

export function logger(req: Request, res: Response, next: NextFunction) {
    // log the request  to console and timestamp it
    console.log(`${new Date().toLocaleString()} - ${req.method} ${req.originalUrl}`);
    next();
};