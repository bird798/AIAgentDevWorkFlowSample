import React from 'react';
import { Transaction } from '../../types/transaction';
import './TransactionList.css';

interface TransactionListProps {
  // 표시할 거래 내역 목록
  transactions: Transaction[];
}

// 금액을 한국 통화 형식으로 변환 (예: 12000 -> '12,000원')
const formatAmount = (amount: number): string => {
  return `${amount.toLocaleString('ko-KR')}원`;
};

// ISO 날짜 문자열을 'YYYY.MM.DD' 형식으로 변환
const formatDate = (date: string): string => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) {
    // 파싱 불가능한 경우 원본 문자열을 그대로 노출
    return date;
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};

// 최신순(날짜 내림차순) 정렬된 새 배열을 반환
const sortByLatest = (transactions: Transaction[]): Transaction[] => {
  return [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

// 수입/지출 내역을 목록으로 보여주는 컴포넌트
const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  // 내역이 없을 때 빈 상태 표시
  if (transactions.length === 0) {
    return (
      <div className="transaction-empty" role="status">
        <p className="transaction-empty__text">등록된 내역이 없습니다.</p>
      </div>
    );
  }

  // 최신순으로 정렬
  const sorted = sortByLatest(transactions);

  return (
    <ul className="transaction-list">
      {sorted.map((transaction) => {
        const isIncome = transaction.type === 'income';
        // 수입은 '+', 지출은 '-' 부호로 시각적 구분
        const sign = isIncome ? '+' : '-';
        const typeClass = isIncome
          ? 'transaction-item--income'
          : 'transaction-item--expense';

        return (
          <li
            key={transaction.id}
            className={`transaction-item ${typeClass}`}
          >
            <div className="transaction-item__main">
              <span className="transaction-item__category">
                {transaction.category}
              </span>
              <span className="transaction-item__amount">
                {sign}
                {formatAmount(transaction.amount)}
              </span>
            </div>
            <div className="transaction-item__sub">
              <span className="transaction-item__date">
                {formatDate(transaction.date)}
              </span>
              {transaction.memo && (
                <span className="transaction-item__memo">
                  {transaction.memo}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default TransactionList;
