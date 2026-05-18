import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { IAuthRequest, ITokenPayload, UserRole } from '../types';
import { AppError } from '../utils/AppError';
import { User } from '../models/User.model';

// ─── Verify JWT Token ──────────────────────────────────────────────────────────
export const authenticate = async (
  req: IAuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Check Authorization header
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check cookies
    else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new AppError('Authentication required. Please log in.', 401);
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET) as ITokenPayload;

    // Verify user still exists and is active
    const user = await User.findById(decoded.userId).select('_id email role isActive');
    if (!user || !user.isActive) {
      throw new AppError('User account not found or has been deactivated.', 401);
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token. Please log in again.', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Token expired. Please log in again.', 401));
    } else {
      next(error);
    }
  }
};

// ─── Authorize by Role ─────────────────────────────────────────────────────────
export const authorize = (...roles: UserRole[]) => {
  return (req: IAuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!roles.includes(req.user.role as UserRole)) {
      return next(
        new AppError(
          `Access denied. Required roles: ${roles.join(', ')}. Your role: ${req.user.role}`,
          403
        )
      );
    }

    next();
  };
};

// ─── Optional Auth ─────────────────────────────────────────────────────────────
export const optionalAuth = async (
  req: IAuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      const decoded = jwt.verify(token, ENV.JWT_SECRET) as ITokenPayload;
      req.user = decoded;
    }
  } catch {
    // Silently continue without auth
  }
  next();
};
