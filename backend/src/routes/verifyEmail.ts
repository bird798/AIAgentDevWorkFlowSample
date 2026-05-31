import { Router, Request, Response } from 'express';
import {
  findVerificationToken,
  deleteVerificationToken,
} from '../services/emailService';
import { findUserById, updateUser } from '../models/User';

const router = Router();

// GET /api/auth/verify-email?token=xxx
router.get('/verify-email', (req: Request, res: Response) => {
  const { token } = req.query;

  if (!token || typeof token !== 'string') {
    return res.status(400).json({ message: '유효하지 않은 인증 링크입니다.' });
  }

  const record = findVerificationToken(token);

  // 토큰 존재 여부 확인
  if (!record) {
    return res.status(400).json({
      message: '유효하지 않은 인증 토큰입니다. 인증 메일을 다시 요청해주세요.',
      code: 'INVALID_TOKEN',
    });
  }

  // 만료 여부 검사
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

  // 이미 인증된 경우 중복 처리 방지
  if (user.verified) {
    deleteVerificationToken(token);
    return res.status(200).json({ message: '이미 인증된 이메일입니다.' });
  }

  // 인증 완료: 사용자 상태 업데이트 (verified=true)
  updateUser(user.id, { verified: true });
  deleteVerificationToken(token);

  return res.status(200).json({ message: '이메일 인증이 완료되었습니다.' });
});

export default router;
