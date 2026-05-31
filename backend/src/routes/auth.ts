import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { findUserByEmail, createUser } from '../models/User';

const router = Router();

// RFC 5322 기반 이메일 정규식
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
// 최소 8자, 영문+숫자+특수문자 각 1개 이상
const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

const BCRYPT_ROUNDS = 12;

// POST /api/auth/signup - 회원가입
router.post('/signup', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // 서버 측 유효성 검사
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ message: '이메일을 입력해주세요.' });
  }
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ message: '유효한 이메일 형식이 아닙니다.' });
  }
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ message: '비밀번호를 입력해주세요.' });
  }
  if (!PASSWORD_REGEX.test(password)) {
    return res.status(400).json({
      message: '비밀번호는 최소 8자, 영문·숫자·특수문자를 각각 포함해야 합니다.',
    });
  }

  // 중복 이메일 409 응답 처리
  const existing = findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ message: '이미 사용 중인 이메일입니다.' });
  }

  // 비밀번호 해싱 (bcrypt)
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // 사용자 DB 저장
  const user = createUser({ email, passwordHash, verified: false });

  // 성공 시 201 응답
  return res.status(201).json({
    message: '회원가입이 완료되었습니다. 이메일 인증 메일을 확인해주세요.',
    userId: user.id,
  });
});

// GET /api/auth/check-email - 중복 이메일 사전 확인
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
