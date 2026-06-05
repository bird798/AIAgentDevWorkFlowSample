import React, { useMemo, useState } from 'react';
import { Transaction } from '../../types/transaction';
import { calculateMonthlySummary } from '../../utils/summary';
import './MonthlySummary.css';

interface MonthlySummaryProps {
  // 집계 대상이 되는 전체 내역 목록
  transactions: Transaction[];
  // 초기 선택 월 ('YYYY-MM'), 미지정 시 가장 최근 내역의 월 또는 빈 값
  defaultMonth?: string;
}

// 금액을 원화 형식(예: 1,000원)으로 표시한다
function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`;
}

// 내역 목록 중 가장 최근 내역의 월을 'YYYY-MM' 형식으로 반환한다
function getLatestMonth(transactions: Transaction[]): string {
  if (transactions.length === 0) {
    return '';
  }
  const latest = transactions.reduce((max, t) => (t.date > max ? t.date : max), transactions[0].date);
  return latest.slice(0, 7);
}

// 선택한 월의 수입/지출 합계와 잔액을 조회하는 컴포넌트
const MonthlySummary: React.FC<MonthlySummaryProps> = ({ transactions, defaultMonth }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    defaultMonth ?? getLatestMonth(transactions)
  );

  // 내역 또는 선택 월이 변경되면 합계를 자동으로 다시 계산한다
  const summary = useMemo(
    () => calculateMonthlySummary(transactions, selectedMonth),
    [transactions, selectedMonth]
  );

  return (
    <section className="summary-card">
      <header className="summary-header">
        <h2 className="summary-title">월별 합계</h2>
        {/* 월 선택 UI */}
        <label className="summary-month-label">
          조회 월
          <input
            type="month"
            className="summary-month-input"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            aria-label="조회할 월 선택"
          />
        </label>
      </header>

      <dl className="summary-list">
        {/* 총 수입 */}
        <div className="summary-item summary-item--income">
          <dt className="summary-item-label">총 수입</dt>
          <dd className="summary-item-value">{formatCurrency(summary.totalIncome)}</dd>
        </div>

        {/* 총 지출 */}
        <div className="summary-item summary-item--expense">
          <dt className="summary-item-label">총 지출</dt>
          <dd className="summary-item-value">{formatCurrency(summary.totalExpense)}</dd>
        </div>

        {/* 잔액 (수입 - 지출), 음수일 경우 별도 스타일 적용 */}
        <div
          className={`summary-item summary-item--balance${
            summary.balance < 0 ? ' summary-item--negative' : ''
          }`}
        >
          <dt className="summary-item-label">잔액</dt>
          <dd className="summary-item-value">{formatCurrency(summary.balance)}</dd>
        </div>
      </dl>
    </section>
  );
};

export default MonthlySummary;
