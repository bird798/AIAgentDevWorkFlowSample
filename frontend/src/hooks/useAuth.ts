import { useState, useEffect, useCallback } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  email: string | null;
  isLoading: boolean;
}

const ACCESS_TOKEN_KEY = 'access_token';

function getStoredToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function storeToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

function clearToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    userId: null,
    email: null,
    isLoading: true,
  });

  // 저장된 토큰으로 세션 복원
  const restoreSession = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setAuth(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setAuth({ isAuthenticated: true, userId: data.userId, email: data.email, isLoading: false });
      } else if (res.status === 401) {
        // 액세스 토큰 만료 → 리프레시 시도
        await refreshToken();
      } else {
        clearToken();
        setAuth({ isAuthenticated: false, userId: null, email: null, isLoading: false });
      }
    } catch {
      clearToken();
      setAuth({ isAuthenticated: false, userId: null, email: null, isLoading: false });
    }
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
      if (!res.ok) {
        clearToken();
        setAuth({ isAuthenticated: false, userId: null, email: null, isLoading: false });
        return false;
      }
      const { accessToken } = await res.json();
      storeToken(accessToken);

      // 새 토큰으로 사용자 정보 재조회
      const meRes = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (meRes.ok) {
        const data = await meRes.json();
        setAuth({ isAuthenticated: true, userId: data.userId, email: data.email, isLoading: false });
        return true;
      }
    } catch {
      // 네트워크 오류 무시
    }
    clearToken();
    setAuth({ isAuthenticated: false, userId: null, email: null, isLoading: false });
    return false;
  }, []);

  // 이메일 인증 완료 후 자동 로그인 (URL의 access_token 파라미터 처리)
  const handleVerificationCallback = useCallback(async () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('access_token');
    if (!token) return false;

    storeToken(token);
    // URL에서 토큰 파라미터 제거
    params.delete('access_token');
    const newSearch = params.toString();
    window.history.replaceState({}, '', `${window.location.pathname}${newSearch ? '?' + newSearch : ''}`);

    // 사용자 정보 로드
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAuth({ isAuthenticated: true, userId: data.userId, email: data.email, isLoading: false });
        return true;
      }
    } catch {
      // 무시
    }
    return false;
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } finally {
      clearToken();
      setAuth({ isAuthenticated: false, userId: null, email: null, isLoading: false });
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      // 먼저 이메일 인증 콜백 처리 시도
      const handled = await handleVerificationCallback();
      if (!handled) {
        await restoreSession();
      }
    };
    init();
  }, [handleVerificationCallback, restoreSession]);

  return { ...auth, logout, refreshToken };
}
