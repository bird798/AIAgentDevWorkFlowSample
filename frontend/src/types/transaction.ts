// 가계부 내역 데이터 모델 및 타입 정의 (#21 하위)

// 수입/지출 유형
export type TransactionType = 'income' | 'expense';

// 수입 카테고리 목록
export const INCOME_CATEGORIES = ['급여', '용돈', '금융수입', '기타수입'] as const;

// 지출 카테고리 목록
export const EXPENSE_CATEGORIES = [
  '식비',
  '교통',
  '주거',
  '쇼핑',
  '문화생활',
  '의료',
  '기타지출',
] as const;

// 유형별 선택 가능한 카테고리를 반환한다
export function getCategories(type: TransactionType): readonly string[] {
  return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

// 저장된 가계부 내역
export interface Transaction {
  // 고유 식별자
  id: string;
  // 수입/지출 유형
  type: TransactionType;
  // 날짜 (YYYY-MM-DD)
  date: string;
  // 금액 (양수)
  amount: number;
  // 카테고리
  category: string;
  // 메모 (선택)
  memo?: string;
}

// 신규 내역 입력값 (id 미포함)
export type NewTransaction = Omit<Transaction, 'id'>;
