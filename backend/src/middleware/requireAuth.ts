import { NextFunction, Request, Response } from "express";
import jwt from "./auth";

const verifyToken = jwt.verifyAuthToken;

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const payload = verifyToken(token);

    if (!payload) {
      return res.status(401).json({
        error: "Invalid token",
      });
    }

    req.user = payload as any;

    next();
  } catch {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }
};
