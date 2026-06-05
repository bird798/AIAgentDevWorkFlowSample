import { Transaction } from '../types/transaction';

// 특정 월의 수입/지출 합계 집계 결과
export interface MonthlySummary {
  // 총 수입 합계
  totalIncome: number;
  // 총 지출 합계
  totalExpense: number;
  // 잔액 (총 수입 - 총 지출)
  balance: number;
}

// 내역의 날짜('YYYY-MM-DD')에서 'YYYY-MM' 형태의 월 키를 추출한다
export function getMonthKey(date: string): string {
  return date.slice(0, 7);
}

// 주어진 내역 목록에서 선택한 월('YYYY-MM')의 수입/지출 합계와 잔액을 계산한다
export function calculateMonthlySummary(
  transactions: Transaction[],
  month: string
): MonthlySummary {
  let totalIncome = 0;
  let totalExpense = 0;

  for (const transaction of transactions) {
    // 선택한 월에 해당하지 않는 내역은 건너뛴다
    if (getMonthKey(transaction.date) !== month) {
      continue;
    }
    if (transaction.type === 'income') {
      totalIncome += transaction.amount;
    } else {
      totalExpense += transaction.amount;
    }
  }

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  };
}
