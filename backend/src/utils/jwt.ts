import jwt, { SignOptions } from 'jsonwebtoken';
import { ENV } from '../config/env';
import { ITokenPayload } from '../types';

// ENV values are plain strings; cast through unknown so TypeScript accepts them
// as jwt's StringValue (a branded string type from the 'ms' package).
const asExpiry = (v: string): SignOptions['expiresIn'] =>
  v as unknown as SignOptions['expiresIn'];

export const generateAccessToken = (payload: ITokenPayload): string => {
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: asExpiry(ENV.JWT_EXPIRES_IN),
  });
};

export const generateRefreshToken = (payload: ITokenPayload): string => {
  return jwt.sign(payload, ENV.JWT_REFRESH_SECRET, {
    expiresIn: asExpiry(ENV.JWT_REFRESH_EXPIRES_IN),
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
