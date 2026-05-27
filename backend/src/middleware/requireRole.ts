import { NextFunction, Request, Response } from "express";
import { UserRole } from "../utils/constants";

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const roleId = Number(req.user.role_id);

    if (!roles.includes(roleId as UserRole)) {
      return res.status(403).json({
        error: "Forbidden",
      });
    }

    next();
  };
};
