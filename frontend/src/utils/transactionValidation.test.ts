import { describe, it, expect } from 'vitest';
import {
  validateDate,
  validateAmount,
  validateCategory,
  validateTransactionForm,
  toNewTransaction,
} from './transactionValidation';

describe('validateDate', () => {
  it('빈 값이면 실패한다', () => {
    expect(validateDate('').isValid).toBe(false);
  });

  it('형식이 잘못되면 실패한다', () => {
    expect(validateDate('2026/06/05').isValid).toBe(false);
  });

  it('YYYY-MM-DD 형식이면 통과한다', () => {
    expect(validateDate('2026-06-05').isValid).toBe(true);
  });
});

describe('validateAmount', () => {
  it('빈 값이면 실패한다', () => {
    expect(validateAmount('').isValid).toBe(false);
  });

  it('숫자가 아니면 실패한다', () => {
    expect(validateAmount('abc').isValid).toBe(false);
  });

  it('0 이하면 실패한다', () => {
    expect(validateAmount('0').isValid).toBe(false);
    expect(validateAmount('-1000').isValid).toBe(false);
  });

  it('양수면 통과한다', () => {
    expect(validateAmount('1000').isValid).toBe(true);
  });
});

describe('validateCategory', () => {
  it('빈 값이면 실패한다', () => {
    expect(validateCategory('', 'expense').isValid).toBe(false);
  });

  it('유형에 없는 카테고리면 실패한다', () => {
    expect(validateCategory('급여', 'expense').isValid).toBe(false);
  });

  it('유형에 맞는 카테고리면 통과한다', () => {
    expect(validateCategory('식비', 'expense').isValid).toBe(true);
    expect(validateCategory('급여', 'income').isValid).toBe(true);
  });
});

describe('validateTransactionForm', () => {
  it('모든 필드가 유효하면 통과한다', () => {
    const result = validateTransactionForm({
      type: 'expense',
      date: '2026-06-05',
      amount: '15000',
      category: '식비',
    });
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('유효하지 않은 필드별 에러를 반환한다', () => {
    const result = validateTransactionForm({
      type: 'expense',
      date: '',
      amount: '-1',
      category: '',
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.date).toBeDefined();
    expect(result.errors.amount).toBeDefined();
    expect(result.errors.category).toBeDefined();
  });
});

describe('toNewTransaction', () => {
  it('금액을 숫자로 변환하고 메모를 포함한다', () => {
    const tx = toNewTransaction({
      type: 'income',
      date: '2026-06-05',
      amount: '50000',
      category: '급여',
      memo: '6월 급여',
    });
    expect(tx).toEqual({
      type: 'income',
      date: '2026-06-05',
      amount: 50000,
      category: '급여',
      memo: '6월 급여',
    });
  });

  it('메모가 공백이면 memo 필드를 생략한다', () => {
    const tx = toNewTransaction({
      type: 'expense',
      date: '2026-06-05',
      amount: '3000',
      category: '교통',
      memo: '   ',
    });
    expect(tx).not.toHaveProperty('memo');
  });
});
