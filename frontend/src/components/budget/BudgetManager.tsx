import React, { useEffect, useMemo, useState } from 'react';
import './BudgetManager.css';

// localStorage 에 예산을 저장할 때 사용하는 키 접두사
const STORAGE_KEY_PREFIX = 'budget';

interface BudgetManagerProps {
  // 해당 월의 총 지출액 (월별 합계 컴포넌트(#21 하위)에서 전달받는 연동 지점)
  totalSpent: number;
  // 예산을 관리할 대상 월 (예: '2026-06'). 미지정 시 현재 월을 사용한다
  month?: string;
}

// 현재 연-월을 'YYYY-MM' 형식으로 반환한다
function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const monthNumber = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${monthNumber}`;
}

// 금액을 원화(KRW) 형식 문자열로 변환한다
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(amount);
}

const BudgetManager: React.FC<BudgetManagerProps> = ({ totalSpent, month }) => {
  // month 미지정 시 현재 월을 기준으로 한다
  const targetMonth = month ?? getCurrentMonth();
  const storageKey = `${STORAGE_KEY_PREFIX}:${targetMonth}`;

  // 저장된 예산 금액 (설정 전에는 null)
  const [budget, setBudget] = useState<number | null>(null);
  // 입력 필드 값
  const [inputValue, setInputValue] = useState('');

  // 월이 바뀌면 해당 월의 저장된 예산을 불러온다 (설정한 예산 유지)
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved !== null) {
      const parsed = Number(saved);
      if (!Number.isNaN(parsed)) {
        setBudget(parsed);
        setInputValue(String(parsed));
        return;
      }
    }
    setBudget(null);
    setInputValue('');
  }, [storageKey]);

  // 예산 대비 지출 비율(%) 및 초과 여부 계산
  const { usageRatio, isOverBudget, remaining } = useMemo(() => {
    if (budget === null || budget <= 0) {
      return { usageRatio: 0, isOverBudget: false, remaining: budget ?? 0 };
    }
    const ratio = (totalSpent / budget) * 100;
    return {
      usageRatio: ratio,
      isOverBudget: totalSpent > budget,
      remaining: budget - totalSpent,
    };
  }, [budget, totalSpent]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(inputValue);
    // 숫자가 아니거나 음수면 저장하지 않는다
    if (inputValue.trim() === '' || Number.isNaN(parsed) || parsed < 0) {
      return;
    }
    localStorage.setItem(storageKey, String(parsed));
    setBudget(parsed);
  };

  return (
    <section className="budget-manager">
      <h2 className="budget-title">{targetMonth} 예산 관리</h2>

      {/* 예산 금액 설정 입력 UI */}
      <form className="budget-form" onSubmit={handleSave}>
        <label htmlFor="budget-input" className="budget-label">
          월별 예산
        </label>
        <div className="budget-input-row">
          <input
            id="budget-input"
            type="number"
            min="0"
            inputMode="numeric"
            className="budget-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="예산 금액을 입력하세요"
          />
          <button type="submit" className="budget-save-button">
            저장
          </button>
        </div>
      </form>

      {/* 예산 설정 후 사용 현황 표시 */}
      {budget !== null && (
        <div className="budget-status">
          <div className="budget-amounts">
            <span className="budget-amount-item">
              예산 <strong>{formatCurrency(budget)}</strong>
            </span>
            <span className="budget-amount-item">
              지출 <strong>{formatCurrency(totalSpent)}</strong>
            </span>
            <span className="budget-amount-item">
              {remaining >= 0 ? '남은 금액' : '초과 금액'}{' '}
              <strong>{formatCurrency(Math.abs(remaining))}</strong>
            </span>
          </div>

          {/* 예산 대비 지출 비율 표시 (진행 막대) */}
          <div
            className="budget-progress"
            role="progressbar"
            aria-valuenow={Math.round(usageRatio)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={`budget-progress-bar${isOverBudget ? ' budget-progress-bar--over' : ''}`}
              style={{ width: `${Math.min(usageRatio, 100)}%` }}
            />
          </div>
          <p className="budget-ratio-text">{usageRatio.toFixed(1)}% 사용</p>

          {/* 예산 초과 시 경고 표시 */}
          {isOverBudget && (
            <p className="budget-warning" role="alert">
              ⚠️ 예산을 {formatCurrency(totalSpent - budget)} 초과했습니다.
            </p>
          )}
        </div>
      )}
    </section>
  );
};

export default BudgetManager;
