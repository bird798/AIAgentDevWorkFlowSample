// RFC 5322 기반 이메일 정규식
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

// 비밀번호: 최소 8자, 영문+숫자+특수문자 각 1개 이상
const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateEmail(email: string): ValidationResult {
  if (!email.trim()) {
    return { isValid: false, error: '이메일을 입력해주세요.' };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, error: '유효한 이메일 형식이 아닙니다.' };
  }
  return { isValid: true };
}

export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: '비밀번호를 입력해주세요.' };
  }
  if (password.length < 8) {
    return { isValid: false, error: '비밀번호는 최소 8자 이상이어야 합니다.' };
  }
  if (!PASSWORD_REGEX.test(password)) {
    return {
      isValid: false,
      error: '비밀번호는 영문, 숫자, 특수문자를 각각 하나 이상 포함해야 합니다.',
    };
  }
  return { isValid: true };
}

export function validatePasswordConfirm(
  password: string,
  passwordConfirm: string,
): ValidationResult {
  if (!passwordConfirm) {
    return { isValid: false, error: '비밀번호 확인을 입력해주세요.' };
  }
  if (password !== passwordConfirm) {
    return { isValid: false, error: '비밀번호가 일치하지 않습니다.' };
  }
  return { isValid: true };
}

export interface SignupFormErrors {
  email?: string;
  password?: string;
  passwordConfirm?: string;
}

export function validateSignupForm(
  email: string,
  password: string,
  passwordConfirm: string,
): { isValid: boolean; errors: SignupFormErrors } {
  const errors: SignupFormErrors = {};

  const emailResult = validateEmail(email);
  if (!emailResult.isValid) errors.email = emailResult.error;

  const passwordResult = validatePassword(password);
  if (!passwordResult.isValid) errors.password = passwordResult.error;

  const confirmResult = validatePasswordConfirm(password, passwordConfirm);
  if (!confirmResult.isValid) errors.passwordConfirm = confirmResult.error;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * 중복 이메일 사전 확인 (API 연동)
 * @returns true if email is available (not duplicate)
 */
export async function checkEmailAvailability(email: string): Promise<ValidationResult> {
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) return emailValidation;

  try {
    const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
    if (response.status === 409) {
      return { isValid: false, error: '이미 사용 중인 이메일입니다.' };
    }
    if (!response.ok) {
      return { isValid: false, error: '이메일 확인 중 오류가 발생했습니다.' };
    }
    return { isValid: true };
  } catch {
    return { isValid: false, error: '서버와 연결할 수 없습니다.' };
  }
}
