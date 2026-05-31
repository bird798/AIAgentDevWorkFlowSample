import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { findUserByEmail, createUser } from '../models/User';
import {
  generateVerificationToken,
  sendVerificationEmail,
} from '../services/emailService';

const router = Router();

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
const BCRYPT_ROUNDS = 12;

// POST /api/auth/signup - 회원가입 + 인증 메일 자동 발송
router.post('/signup', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({ message: '유효한 이메일 형식이 아닙니다.' });
  }
  if (!password || !PASSWORD_REGEX.test(password)) {
    return res.status(400).json({
      message: '비밀번호는 최소 8자, 영문·숫자·특수문자를 각각 포함해야 합니다.',
    });
  }

  const existing = findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ message: '이미 사용 중인 이메일입니다.' });
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = createUser({ email, passwordHash, verified: false });

  // 회원가입 완료 즉시 인증 메일 자동 발송
  const token = generateVerificationToken(user.id, email);
  const result = await sendVerificationEmail(email, token);
  if (!result.success) {
    console.error('[Signup] 인증 메일 발송 실패:', result.error);
  }

  return res.status(201).json({
    message: '회원가입이 완료되었습니다. 이메일 인증 메일을 확인해주세요.',
    userId: user.id,
  });
});

// POST /api/auth/resend-verification - 인증 메일 재발송
router.post('/resend-verification', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ message: '이메일을 입력해주세요.' });
  }

  const user = findUserByEmail(email);
  if (!user) {
    // 이메일 열거 공격 방지: 존재하지 않아도 200 반환
    return res.status(200).json({ message: '인증 메일을 재발송했습니다.' });
  }
  if (user.verified) {
    return res.status(400).json({ message: '이미 인증된 이메일입니다.' });
  }

  const token = generateVerificationToken(user.id, email);
  await sendVerificationEmail(email, token);

  return res.status(200).json({ message: '인증 메일을 재발송했습니다.' });
});

// GET /api/auth/check-email
router.get('/check-email', (req: Request, res: Response) => {
  const { email } = req.query;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ message: '이메일을 입력해주세요.' });
  }
  const existing = findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ message: '이미 사용 중인 이메일입니다.' });
  }
  return res.status(200).json({ message: '사용 가능한 이메일입니다.' });
});

export default router;
