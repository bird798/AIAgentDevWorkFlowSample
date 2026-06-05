import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MonthlySummary from './MonthlySummary';
import { Transaction } from '../../types/transaction';

// 테스트용 내역 목록 (5월/6월)
const transactions: Transaction[] = [
  { id: '1', type: 'income', amount: 3000, date: '2026-05-01' },
  { id: '2', type: 'expense', amount: 1000, date: '2026-05-15' },
  { id: '3', type: 'income', amount: 2000, date: '2026-06-01' },
  { id: '4', type: 'expense', amount: 700, date: '2026-06-10' },
];

// 합계 항목의 값 텍스트를 읽어오는 헬퍼
function getValue(label: string): string {
  const dt = screen.getByText(label);
  const dd = dt.parentElement?.querySelector('.summary-item-value');
  return dd?.textContent ?? '';
}

describe('MonthlySummary', () => {
  it('월 선택 UI를 렌더링한다', () => {
    render(<MonthlySummary transactions={transactions} defaultMonth="2026-05" />);
    expect(screen.getByLabelText('조회할 월 선택')).toBeInTheDocument();
  });

  it('선택한 월의 총 수입/총 지출/잔액을 표시한다', () => {
    render(<MonthlySummary transactions={transactions} defaultMonth="2026-05" />);
    expect(getValue('총 수입')).toBe('3,000원');
    expect(getValue('총 지출')).toBe('1,000원');
    expect(getValue('잔액')).toBe('2,000원');
  });

  it('월을 변경하면 합계가 자동으로 갱신된다', async () => {
    const user = userEvent.setup();
    render(<MonthlySummary transactions={transactions} defaultMonth="2026-05" />);

    const monthInput = screen.getByLabelText('조회할 월 선택');
    await user.clear(monthInput);
    await user.type(monthInput, '2026-06');

    expect(getValue('총 수입')).toBe('2,000원');
    expect(getValue('총 지출')).toBe('700원');
    expect(getValue('잔액')).toBe('1,300원');
  });

  it('defaultMonth를 지정하지 않으면 가장 최근 내역의 월을 기본 선택한다', () => {
    render(<MonthlySummary transactions={transactions} />);
    // 가장 최근 내역은 2026-06 이므로 6월 합계가 표시된다
    expect(getValue('총 수입')).toBe('2,000원');
    expect(getValue('총 지출')).toBe('700원');
  });

  it('내역이 없는 월은 모든 합계를 0원으로 표시한다', () => {
    render(<MonthlySummary transactions={transactions} defaultMonth="2026-01" />);
    expect(getValue('총 수입')).toBe('0원');
    expect(getValue('총 지출')).toBe('0원');
    expect(getValue('잔액')).toBe('0원');
  });
});
