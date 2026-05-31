import crypto from 'crypto';

const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24시간

interface VerificationToken {
  userId: string;
  email: string;
  token: string;
  expiresAt: Date;
}

// 인메모리 토큰 저장소 (실제 환경에서는 DB로 교체)
const tokenStore: Map<string, VerificationToken> = new Map();

export function generateVerificationToken(userId: string, email: string): string {
  // 기존 토큰 삭제 (재발송 처리)
  for (const [key, val] of tokenStore.entries()) {
    if (val.userId === userId) tokenStore.delete(key);
  }

  const token = crypto.randomBytes(32).toString('hex');
  tokenStore.set(token, {
    userId,
    email,
    token,
    expiresAt: new Date(Date.now() + TOKEN_EXPIRY_MS),
  });
  return token;
}

export function findVerificationToken(token: string): VerificationToken | undefined {
  return tokenStore.get(token);
}

export function deleteVerificationToken(token: string): void {
  tokenStore.delete(token);
}

function buildVerificationEmailHtml(verificationLink: string): string {
  return `
<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><title>이메일 인증</title></head>
<body style="font-family: sans-serif; background: #f5f5f5; padding: 2rem;">
  <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 8px; padding: 2rem;">
    <h2 style="color: #1a1a1a;">이메일 인증</h2>
    <p>아래 버튼을 클릭하여 이메일 주소를 인증해주세요.</p>
    <p>링크는 <strong>24시간</strong> 동안 유효합니다.</p>
    <a href="${verificationLink}"
       style="display: inline-block; padding: 0.75rem 1.5rem; background: #4f46e5; color: #fff; border-radius: 6px; text-decoration: none; font-weight: 600;">
      이메일 인증하기
    </a>
    <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid #e5e7eb;">
    <p style="font-size: 0.875rem; color: #6b7280;">
      본인이 요청하지 않은 경우 이 메일을 무시해주세요.
    </p>
  </div>
</body>
</html>`;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * 이메일 인증 메일 발송
 * 실제 환경에서는 SENDGRID_API_KEY 또는 AWS SES 설정 필요
 */
export async function sendVerificationEmail(
  email: string,
  verificationToken: string,
): Promise<EmailSendResult> {
  const baseUrl = process.env.APP_BASE_URL ?? 'http://localhost:3000';
  const verificationLink = `${baseUrl}/api/auth/verify-email?token=${verificationToken}`;
  const html = buildVerificationEmailHtml(verificationLink);

  // SendGrid 연동 (SENDGRID_API_KEY 환경변수 설정 시 활성화)
  if (process.env.SENDGRID_API_KEY) {
    return sendViaSendGrid(email, html);
  }

  // 개발 환경: 콘솔 출력
  console.log(`[EmailService] 인증 메일 발송 (개발 모드)`);
  console.log(`  수신: ${email}`);
  console.log(`  인증 링크: ${verificationLink}`);
  return { success: true, messageId: `dev-${Date.now()}` };
}

async function sendViaSendGrid(
  to: string,
  html: string,
): Promise<EmailSendResult> {
  const from = process.env.SENDGRID_FROM_EMAIL ?? 'noreply@example.com';
  const payload = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: from },
    subject: '이메일 인증을 완료해주세요',
    content: [{ type: 'text/html', value: html }],
  };

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    return { success: false, error: `SendGrid 오류: ${response.status} ${body}` };
  }

  const messageId = response.headers.get('x-message-id') ?? undefined;
  return { success: true, messageId };
}
