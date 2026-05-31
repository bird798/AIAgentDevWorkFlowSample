import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7일

export interface AccessTokenPayload {
  userId: string;
  email: string;
}

interface RefreshTokenRecord {
  userId: string;
  token: string;
  expiresAt: Date;
}

// 인메모리 리프레시 토큰 저장소 (실제 환경에서는 DB로 교체)
const refreshTokenStore: Map<string, RefreshTokenRecord> = new Map();

export function issueAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function issueRefreshToken(userId: string): string {
  const token = crypto.randomBytes(40).toString('hex');
  refreshTokenStore.set(token, {
    userId,
    token,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
  });
  return token;
}

export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AccessTokenPayload;
  } catch {
    return null;
  }
}

export function consumeRefreshToken(token: string): RefreshTokenRecord | null {
  const record = refreshTokenStore.get(token);
  if (!record) return null;
  if (new Date() > record.expiresAt) {
    refreshTokenStore.delete(token);
    return null;
  }
  // 리프레시 토큰 1회 사용 후 교체 (rotation)
  refreshTokenStore.delete(token);
  return record;
}
