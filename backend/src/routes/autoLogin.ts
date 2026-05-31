import { Router, Request, Response } from 'express';
import {
  findVerificationToken,
  deleteVerificationToken,
} from '../services/emailService';
import { findUserById, updateUser } from '../models/User';
import {
  issueAccessToken,
  issueRefreshToken,
  consumeRefreshToken,
  verifyAccessToken,
} from '../services/tokenService';

const router = Router();

const REFRESH_COOKIE_NAME = 'refresh_token';
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7일

// GET /api/auth/verify-email?token=xxx
// 이메일 인증 완료 후 JWT 액세스/리프레시 토큰 발급 → 자동 로그인
router.get('/verify-email', (req: Request, res: Response) => {
  const { token } = req.query;

  if (!token || typeof token !== 'string') {
    return res.status(400).json({ message: '유효하지 않은 인증 링크입니다.' });
  }

  const record = findVerificationToken(token);
  if (!record) {
    return res.status(400).json({
      message: '유효하지 않은 인증 토큰입니다.',
      code: 'INVALID_TOKEN',
    });
  }

  if (new Date() > record.expiresAt) {
    deleteVerificationToken(token);
    return res.status(400).json({
      message: '인증 링크가 만료되었습니다. 인증 메일을 다시 요청해주세요.',
      code: 'EXPIRED_TOKEN',
    });
  }

  const user = findUserById(record.userId);
  if (!user) {
    deleteVerificationToken(token);
    return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
  }

  if (user.verified) {
    deleteVerificationToken(token);
    return res.status(200).json({ message: '이미 인증된 이메일입니다.' });
  }

  // 인증 완료: 사용자 상태 업데이트
  updateUser(user.id, { verified: true });
  deleteVerificationToken(token);

  // JWT 액세스 토큰 발급
  const accessToken = issueAccessToken({ userId: user.id, email: user.email });

  // 리프레시 토큰 발급 및 쿠키 저장 (httpOnly, Secure)
  const refreshToken = issueRefreshToken(user.id);
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
  });

  // 메인 페이지 리다이렉트 (API 모드: 토큰 반환 / 서버 렌더링 모드: redirect)
  const redirectUrl = process.env.APP_AFTER_VERIFY_URL ?? '/';
  if (req.headers.accept?.includes('text/html')) {
    // 브라우저 직접 접근: 메인 페이지로 리다이렉트
    return res.redirect(302, `${redirectUrl}?access_token=${accessToken}`);
  }

  // API 클라이언트: JSON 응답
  return res.status(200).json({
    message: '이메일 인증이 완료되었습니다. 자동 로그인 처리됩니다.',
    accessToken,
    redirectUrl,
  });
});

// POST /api/auth/refresh - 액세스 토큰 갱신 (세션 유지)
router.post('/refresh', (req: Request, res: Response) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!refreshToken) {
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }

  const record = consumeRefreshToken(refreshToken);
  if (!record) {
    res.clearCookie(REFRESH_COOKIE_NAME);
    return res.status(401).json({ message: '세션이 만료되었습니다. 다시 로그인해주세요.' });
  }

  const user = findUserById(record.userId);
  if (!user) {
    return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
  }

  // 새 토큰 쌍 발급 (rotation)
  const newAccessToken = issueAccessToken({ userId: user.id, email: user.email });
  const newRefreshToken = issueRefreshToken(user.id);

  res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
  });

  return res.status(200).json({ accessToken: newAccessToken });
});

// POST /api/auth/logout - 로그아웃 (쿠키 삭제)
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie(REFRESH_COOKIE_NAME);
  return res.status(200).json({ message: '로그아웃되었습니다.' });
});

// GET /api/auth/me - 현재 로그인 사용자 정보 (액세스 토큰 검증)
router.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }

  const token = authHeader.slice(7);
  const payload = verifyAccessToken(token);
  if (!payload) {
    return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }

  const user = findUserById(payload.userId);
  if (!user) {
    return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
  }

  return res.status(200).json({ userId: user.id, email: user.email, verified: user.verified });
});

export default router;
