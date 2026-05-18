import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { ITokenPayload } from '../types';

export const generateAccessToken = (payload: ITokenPayload): string => {
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN as string,
  });
};

export const generateRefreshToken = (payload: ITokenPayload): string => {
  return jwt.sign(payload, ENV.JWT_REFRESH_SECRET, {
    expiresIn: ENV.JWT_REFRESH_EXPIRES_IN as string,
  });
};

export const verifyAccessToken = (token: string): ITokenPayload => {
  return jwt.verify(token, ENV.JWT_SECRET) as ITokenPayload;
};

export const verifyRefreshToken = (token: string): ITokenPayload => {
  return jwt.verify(token, ENV.JWT_REFRESH_SECRET) as ITokenPayload;
};

export const generateTokenPair = (
  payload: ITokenPayload
): { accessToken: string; refreshToken: string } => ({
  accessToken: generateAccessToken(payload),
  refreshToken: generateRefreshToken(payload),
});
