import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import TransactionList from './TransactionList';
import { Transaction } from '../../types/transaction';

// 테스트용 샘플 내역
const sampleTransactions: Transaction[] = [
  {
    id: '1',
    type: 'expense',
    amount: 12000,
    category: '식비',
    memo: '점심',
    date: '2026-06-01',
  },
  {
    id: '2',
    type: 'income',
    amount: 3000000,
    category: '급여',
    date: '2026-06-05',
  },
  {
    id: '3',
    type: 'expense',
    amount: 5000,
    category: '교통',
    memo: '버스',
    date: '2026-06-03',
  },
];

describe('TransactionList', () => {
  // 리스트 렌더링 테스트
  it('전달한 내역 개수만큼 항목을 렌더링한다', () => {
    render(<TransactionList transactions={sampleTransactions} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  // 날짜/금액/카테고리/메모 표시 테스트
  it('각 항목에 날짜, 금액, 카테고리, 메모를 표시한다', () => {
    render(<TransactionList transactions={[sampleTransactions[0]]} />);
    const item = screen.getByRole('listitem');

    expect(within(item).getByText('식비')).toBeInTheDocument();
    expect(within(item).getByText('점심')).toBeInTheDocument();
    expect(within(item).getByText('2026.06.01')).toBeInTheDocument();
    expect(within(item).getByText('-12,000원')).toBeInTheDocument();
  });

  // 수입/지출 시각적 구분 테스트
  it('수입과 지출에 서로 다른 클래스를 적용한다', () => {
    render(
      <TransactionList
        transactions={[sampleTransactions[1], sampleTransactions[0]]}
      />
    );

    const income = screen.getByText('급여').closest('li');
    const expense = screen.getByText('식비').closest('li');

    expect(income).toHaveClass('transaction-item--income');
    expect(expense).toHaveClass('transaction-item--expense');
  });

  // 수입은 '+', 지출은 '-' 부호 표시 테스트
  it('수입은 + 부호를, 지출은 - 부호를 금액 앞에 붙인다', () => {
    render(<TransactionList transactions={sampleTransactions} />);

    expect(screen.getByText('+3,000,000원')).toBeInTheDocument();
    expect(screen.getByText('-12,000원')).toBeInTheDocument();
  });

  // 최신순 정렬 테스트
  it('내역을 최신순(날짜 내림차순)으로 정렬해 렌더링한다', () => {
    render(<TransactionList transactions={sampleTransactions} />);
    const items = screen.getAllByRole('listitem');

    // 06-05(급여) > 06-03(교통) > 06-01(식비) 순서여야 한다
    expect(within(items[0]).getByText('급여')).toBeInTheDocument();
    expect(within(items[1]).getByText('교통')).toBeInTheDocument();
    expect(within(items[2]).getByText('식비')).toBeInTheDocument();
  });

  // 원본 배열을 변경하지 않는지 테스트
  it('정렬 시 원본 배열을 변경하지 않는다', () => {
    const original = [...sampleTransactions];
    render(<TransactionList transactions={sampleTransactions} />);
    expect(sampleTransactions).toEqual(original);
  });

  // 빈 상태 표시 테스트
  it('내역이 없으면 빈 상태 메시지를 표시한다', () => {
    render(<TransactionList transactions={[]} />);

    expect(screen.getByText('등록된 내역이 없습니다.')).toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  // 메모가 없는 경우 처리 테스트
  it('메모가 없는 항목도 정상적으로 렌더링한다', () => {
    render(<TransactionList transactions={[sampleTransactions[1]]} />);
    const item = screen.getByRole('listitem');

    expect(within(item).getByText('급여')).toBeInTheDocument();
    expect(within(item).getByText('+3,000,000원')).toBeInTheDocument();
  });
});
