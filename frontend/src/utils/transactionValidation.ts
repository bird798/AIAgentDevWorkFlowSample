import { NewTransaction, TransactionType, getCategories } from '../types/transaction';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// 날짜: 입력값 필수, YYYY-MM-DD 형식
export function validateDate(date: string): ValidationResult {
  if (!date.trim()) {
    return { isValid: false, error: '날짜를 입력해주세요.' };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { isValid: false, error: '유효한 날짜 형식이 아닙니다.' };
  }
  return { isValid: true };
}

// 금액: 필수, 숫자, 양수
export function validateAmount(amount: string): ValidationResult {
  if (!amount.trim()) {
    return { isValid: false, error: '금액을 입력해주세요.' };
  }
  const value = Number(amount);
  if (Number.isNaN(value)) {
    return { isValid: false, error: '금액은 숫자만 입력할 수 있습니다.' };
  }
  if (value <= 0) {
    return { isValid: false, error: '금액은 0보다 큰 값이어야 합니다.' };
  }
  return { isValid: true };
}

// 카테고리: 필수, 유형별 허용 목록에 포함
export function validateCategory(
  category: string,
  type: TransactionType,
): ValidationResult {
  if (!category.trim()) {
    return { isValid: false, error: '카테고리를 선택해주세요.' };
  }
  if (!getCategories(type).includes(category)) {
    return { isValid: false, error: '유효한 카테고리가 아닙니다.' };
  }
  return { isValid: true };
}

export interface TransactionFormErrors {
  date?: string;
  amount?: string;
  category?: string;
}

// 입력 폼 전체 유효성 검사
export function validateTransactionForm(input: {
  type: TransactionType;
  date: string;
  amount: string;
  category: string;
}): { isValid: boolean; errors: TransactionFormErrors } {
  const errors: TransactionFormErrors = {};

  const dateResult = validateDate(input.date);
  if (!dateResult.isValid) errors.date = dateResult.error;

  const amountResult = validateAmount(input.amount);
  if (!amountResult.isValid) errors.amount = amountResult.error;

  const categoryResult = validateCategory(input.category, input.type);
  if (!categoryResult.isValid) errors.category = categoryResult.error;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// 검증된 입력값을 NewTransaction 으로 변환한다 (메모는 공백 제거 후 있을 때만 포함)
export function toNewTransaction(input: {
  type: TransactionType;
  date: string;
  amount: string;
  category: string;
  memo: string;
}): NewTransaction {
  const memo = input.memo.trim();
  return {
    type: input.type,
    date: input.date,
    amount: Number(input.amount),
    category: input.category,
    ...(memo ? { memo } : {}),
  };
}
