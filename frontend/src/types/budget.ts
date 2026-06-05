// 가계부 데이터 모델 및 타입 정의

// 거래 유형: 수입 또는 지출
export type TransactionType = 'income' | 'expense';

// 카테고리: 거래 내역을 분류하는 단위
export interface Category {
  id: string;
  name: string;
  // 수입용/지출용 카테고리 구분
  type: TransactionType;
  // 화면 표시용 색상 (선택)
  color?: string;
}

// 거래 내역: 수입/지출 한 건의 기록
export interface Transaction {
  id: string;
  // 거래 날짜 (ISO 8601, 예: '2026-05-31')
  date: string;
  // 금액 (양수로 저장하고 수입/지출은 type으로 구분)
  amount: number;
  // 수입/지출 구분
  type: TransactionType;
  // 연결된 카테고리 식별자
  categoryId: string;
  // 메모 (선택)
  memo?: string;
}

// 예산: 특정 월/카테고리에 설정한 지출 한도
export interface Budget {
  id: string;
  // 대상 카테고리 식별자
  categoryId: string;
  // 예산 금액
  amount: number;
  // 적용 월 (예: '2026-05')
  month: string;
}
