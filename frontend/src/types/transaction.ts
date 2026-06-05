// 거래 종류: 수입 또는 지출
export type TransactionType = 'income' | 'expense';

// 가계부 내역 한 건을 나타내는 타입
export interface Transaction {
  // 고유 식별자
  id: string;
  // 수입/지출 구분
  type: TransactionType;
  // 금액 (원 단위, 양수)
  amount: number;
  // 카테고리 (예: 식비, 급여)
  category: string;
  // 메모 (선택)
  memo?: string;
  // 발생 일자 (ISO 8601 문자열, 예: '2026-06-05')
  date: string;
}
