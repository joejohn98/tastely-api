import { NextFunction, Request, Response } from "express";

const authorizeRoles =
  (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        status: "failed",
        message: "Unauthorized, user not found in request context",
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        status: "failed",
        message: "Forbidden: You do not have the necessary permissions.",
      });
      return;
    }

    next();
  };

export default authorizeRoles;
