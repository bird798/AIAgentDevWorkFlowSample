import {
  validateEmail,
  validatePassword,
  validatePasswordConfirm,
  validateSignupForm,
} from './validation';

describe('validateEmail', () => {
  test('유효한 이메일 통과', () => {
    expect(validateEmail('user@example.com').isValid).toBe(true);
    expect(validateEmail('user+tag@sub.domain.co.kr').isValid).toBe(true);
  });

  test('빈 이메일 실패', () => {
    expect(validateEmail('').isValid).toBe(false);
  });

  test('잘못된 형식 실패', () => {
    expect(validateEmail('notanemail').isValid).toBe(false);
    expect(validateEmail('missing@tld').isValid).toBe(false);
    expect(validateEmail('@nodomain.com').isValid).toBe(false);
  });
});

describe('validatePassword', () => {
  test('유효한 비밀번호 통과', () => {
    expect(validatePassword('Abcd1234!').isValid).toBe(true);
    expect(validatePassword('myP@ssw0rd').isValid).toBe(true);
  });

  test('8자 미만 실패', () => {
    expect(validatePassword('Ab1!').isValid).toBe(false);
  });

  test('특수문자 누락 실패', () => {
    expect(validatePassword('Abcd1234').isValid).toBe(false);
  });

  test('숫자 누락 실패', () => {
    expect(validatePassword('Abcdefg!').isValid).toBe(false);
  });

  test('영문 누락 실패', () => {
    expect(validatePassword('12345678!').isValid).toBe(false);
  });
});

describe('validatePasswordConfirm', () => {
  test('일치하는 비밀번호 통과', () => {
    expect(validatePasswordConfirm('Abcd1234!', 'Abcd1234!').isValid).toBe(true);
  });

  test('불일치 비밀번호 실패', () => {
    expect(validatePasswordConfirm('Abcd1234!', 'different!').isValid).toBe(false);
  });

  test('빈 확인 비밀번호 실패', () => {
    expect(validatePasswordConfirm('Abcd1234!', '').isValid).toBe(false);
  });
});

describe('validateSignupForm', () => {
  test('모든 값 유효 시 통과', () => {
    const result = validateSignupForm('user@example.com', 'Abcd1234!', 'Abcd1234!');
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  test('이메일 오류 시 실패', () => {
    const result = validateSignupForm('invalid', 'Abcd1234!', 'Abcd1234!');
    expect(result.isValid).toBe(false);
    expect(result.errors.email).toBeDefined();
  });

  test('다중 오류 동시 반환', () => {
    const result = validateSignupForm('', '', '');
    expect(result.isValid).toBe(false);
    expect(result.errors.email).toBeDefined();
    expect(result.errors.password).toBeDefined();
    expect(result.errors.passwordConfirm).toBeDefined();
  });
});
