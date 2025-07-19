// middlewares/auth.ts
import { NextFunction, Request, Response } from "express";

export async function authenticate(
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
): Promise<void> {
  // TODO: Add JWT or session logic
  const user = req.user; // assume it's already decoded somewhere
  if (!user) res.status(401).json({ message: "Unauthorized" });
  next();
}

export function authorize(roles: string[]) {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const user = req.user;
    if (!user || !roles.includes(user.role)) {
      res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}
