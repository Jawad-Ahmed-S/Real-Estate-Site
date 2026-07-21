import type { Request, Response, NextFunction } from "express";

export default function catchAsyncError<T extends Request>(
    func: (
        req: T,
        res: Response,
        next: NextFunction
    ) => Promise<unknown>
) {
    return (req: T, res: Response, next: NextFunction) => {
        Promise.resolve(func(req, res, next)).catch(next);
    };
} 