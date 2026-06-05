import { describe, it, expect } from 'vitest';
import { calculateMonthlySummary, getMonthKey } from './summary';
import { Transaction } from '../types/transaction';

// 테스트용 내역 목록
const transactions: Transaction[] = [
  { id: '1', type: 'income', amount: 3000, date: '2026-05-01' },
  { id: '2', type: 'expense', amount: 1000, date: '2026-05-15' },
  { id: '3', type: 'expense', amount: 500, date: '2026-05-20' },
  { id: '4', type: 'income', amount: 2000, date: '2026-06-01' },
  { id: '5', type: 'expense', amount: 700, date: '2026-06-10' },
];

describe('getMonthKey', () => {
  it("날짜에서 'YYYY-MM' 형식의 월 키를 추출한다", () => {
    expect(getMonthKey('2026-05-20')).toBe('2026-05');
  });
});

describe('calculateMonthlySummary', () => {
  it('선택한 월의 총 수입을 계산한다', () => {
    const result = calculateMonthlySummary(transactions, '2026-05');
    expect(result.totalIncome).toBe(3000);
  });

  it('선택한 월의 총 지출을 계산한다', () => {
    const result = calculateMonthlySummary(transactions, '2026-05');
    expect(result.totalExpense).toBe(1500);
  });

  it('잔액(수입-지출)을 계산한다', () => {
    const result = calculateMonthlySummary(transactions, '2026-05');
    expect(result.balance).toBe(1500);
  });

  it('다른 월의 내역은 합계에 포함하지 않는다', () => {
    const result = calculateMonthlySummary(transactions, '2026-06');
    expect(result.totalIncome).toBe(2000);
    expect(result.totalExpense).toBe(700);
    expect(result.balance).toBe(1300);
  });

  it('해당 월에 내역이 없으면 모든 합계가 0이다', () => {
    const result = calculateMonthlySummary(transactions, '2026-01');
    expect(result).toEqual({ totalIncome: 0, totalExpense: 0, balance: 0 });
  });

  it('지출이 수입보다 크면 잔액이 음수가 된다', () => {
    const overspent: Transaction[] = [
      { id: '1', type: 'income', amount: 1000, date: '2026-05-01' },
      { id: '2', type: 'expense', amount: 1500, date: '2026-05-02' },
    ];
    const result = calculateMonthlySummary(overspent, '2026-05');
    expect(result.balance).toBe(-500);
  });
});
