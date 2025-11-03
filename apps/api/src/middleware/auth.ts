import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CustomError, asyncHandler } from './errorHandler';
import { db } from '@social-genie/database';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const protect = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return next(new CustomError('Access token required', 401));
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

      // Get user from database
      const user = await db('users').where('id', decoded.userId).first();

      if (!user) {
        return next(new CustomError('User not found', 401));
      }

      // Set user on request object
      req.user = user;
      next();
    } catch (error) {
      return next(new CustomError('Invalid token', 401));
    }
  }
);

export const generateToken = (userId: string): string => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET!,
    {
      expiresIn: process.env.JWT_EXPIRE || '30d'
    }
  );
};

export const sendTokenResponse = (user: any, statusCode: number, res: Response) => {
  const token = generateToken(user.id);

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url
      }
    });
};