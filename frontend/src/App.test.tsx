import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// 현재 연-월을 'YYYY-MM' 형식으로 반환 (App 내부 로직과 동일)
function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// 지출 내역 하나를 폼으로 입력하는 헬퍼
async function addExpense(user: ReturnType<typeof userEvent.setup>) {
  // 거래 입력 폼은 '날짜' 라벨이 속한 form 으로 특정한다 (BudgetManager 의 저장 버튼과 구분)
  const form = screen.getByLabelText('날짜').closest('form') as HTMLFormElement;
  const formScope = within(form);

  await user.type(formScope.getByLabelText('날짜'), `${getCurrentMonth()}-10`);
  await user.type(formScope.getByLabelText('금액'), '12000');
  await user.selectOptions(formScope.getByLabelText('카테고리'), '식비');
  await user.click(formScope.getByRole('button', { name: '저장' }));
}

describe('App 화면 초기화', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('초기화 버튼을 클릭하면 거래 내역 목록이 비워진다', async () => {
    const user = userEvent.setup();
    render(<App />);

    await addExpense(user);

    // 입력한 내역(식비)이 목록 항목으로 표시되는지 확인
    // (카테고리 select 의 <option> 과 구분하기 위해 목록 항목 셀렉터로 좁힌다)
    const listItemSelector = { selector: '.transaction-item__category' };
    expect(screen.getByText('식비', listItemSelector)).toBeInTheDocument();
    expect(screen.queryByText('등록된 내역이 없습니다.')).not.toBeInTheDocument();

    // 초기화 실행
    await user.click(screen.getByRole('button', { name: '초기화' }));

    // 목록이 빈 상태로 갱신되었는지 확인
    expect(screen.queryByText('식비', listItemSelector)).not.toBeInTheDocument();
    expect(screen.getByText('등록된 내역이 없습니다.')).toBeInTheDocument();
  });

  it('초기화 시 localStorage 의 예산 데이터가 삭제되고 예산 현황이 사라진다', async () => {
    const user = userEvent.setup();
    render(<App />);

    const month = getCurrentMonth();
    const budgetForm = screen.getByLabelText('월별 예산').closest('form') as HTMLFormElement;
    const budgetScope = within(budgetForm);

    // 예산을 저장하면 localStorage 에 'budget:{YYYY-MM}' 키가 생긴다
    await user.type(budgetScope.getByLabelText('월별 예산'), '100000');
    await user.click(budgetScope.getByRole('button', { name: '저장' }));

    expect(localStorage.getItem(`budget:${month}`)).toBe('100000');
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // 초기화 실행
    await user.click(screen.getByRole('button', { name: '초기화' }));

    // 예산 키가 삭제되고 사용 현황(progressbar)도 사라졌는지 확인
    expect(localStorage.getItem(`budget:${month}`)).toBeNull();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});
