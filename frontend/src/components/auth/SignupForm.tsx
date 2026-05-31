import React, { useState } from 'react';
import './SignupForm.css';

interface SignupFormData {
  email: string;
  password: string;
  passwordConfirm: string;
}

interface SignupFormErrors {
  email?: string;
  password?: string;
  passwordConfirm?: string;
  general?: string;
}

interface SignupFormProps {
  onSubmit: (data: Pick<SignupFormData, 'email' | 'password'>) => Promise<void>;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [errors, setErrors] = useState<SignupFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // 입력 시 해당 필드 에러 초기화
    if (errors[name as keyof SignupFormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      await onSubmit({ email: formData.email, password: formData.password });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '회원가입 중 오류가 발생했습니다.';
      setErrors({ general: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h1 className="signup-title">회원가입</h1>

        <form className="signup-form" onSubmit={handleSubmit} noValidate>
          {/* 이메일 입력 필드 */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              이메일
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'form-input--error' : ''}`}
              placeholder="example@email.com"
              autoComplete="email"
              disabled={isLoading}
            />
            {errors.email && (
              <span className="error-message" role="alert">
                {errors.email}
              </span>
            )}
          </div>

          {/* 비밀번호 입력 필드 */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? 'form-input--error' : ''}`}
              placeholder="최소 8자, 영문+숫자+특수문자"
              autoComplete="new-password"
              disabled={isLoading}
            />
            {errors.password && (
              <span className="error-message" role="alert">
                {errors.password}
              </span>
            )}
          </div>

          {/* 비밀번호 확인 필드 */}
          <div className="form-group">
            <label htmlFor="passwordConfirm" className="form-label">
              비밀번호 확인
            </label>
            <input
              id="passwordConfirm"
              type="password"
              name="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={handleChange}
              className={`form-input ${errors.passwordConfirm ? 'form-input--error' : ''}`}
              placeholder="비밀번호를 다시 입력하세요"
              autoComplete="new-password"
              disabled={isLoading}
            />
            {errors.passwordConfirm && (
              <span className="error-message" role="alert">
                {errors.passwordConfirm}
              </span>
            )}
          </div>

          {/* 일반 에러 메시지 표시 영역 */}
          {errors.general && (
            <div className="error-box" role="alert">
              {errors.general}
            </div>
          )}

          {/* 회원가입 제출 버튼 */}
          <button
            type="submit"
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? '처리 중...' : '회원가입'}
          </button>
        </form>

        <p className="login-link">
          이미 계정이 있으신가요?{' '}
          <a href="/login">로그인</a>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;
