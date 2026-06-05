// 수입/지출 구분
export type TransactionType = 'income' | 'expense';

// 가계부 내역 한 건을 나타내는 타입
export interface Transaction {
  // 내역 고유 식별자
  id: string;
  // 수입/지출 구분
  type: TransactionType;
  // 금액 (0 이상의 정수, 단위: 원)
  amount: number;
  // 발생 날짜 (ISO 형식: 'YYYY-MM-DD')
  date: string;
  // 카테고리 (선택)
  category?: string;
  // 메모 (선택)
  memo?: string;
}
