import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BudgetManager from './BudgetManager';

describe('BudgetManager', () => {
  // 각 테스트 전에 localStorage 를 초기화한다
  beforeEach(() => {
    localStorage.clear();
  });

  // 예산 금액 설정 입력 UI 렌더링 테스트
  it('예산 입력 UI와 저장 버튼을 렌더링한다', () => {
    render(<BudgetManager totalSpent={0} month="2026-06" />);
    expect(screen.getByLabelText('월별 예산')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument();
  });

  // 예산 저장 후 사용 현황 표시 테스트
  it('예산을 저장하면 사용 현황을 표시한다', async () => {
    const user = userEvent.setup();
    render(<BudgetManager totalSpent={30000} month="2026-06" />);

    await user.type(screen.getByLabelText('월별 예산'), '100000');
    await user.click(screen.getByRole('button', { name: '저장' }));

    // 예산 대비 지출 비율(30%) 표시 확인
    expect(screen.getByText('30.0% 사용')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '30');
  });

  // 예산 초과 시 경고 표시 테스트
  it('지출이 예산을 초과하면 경고를 표시한다', async () => {
    const user = userEvent.setup();
    render(<BudgetManager totalSpent={120000} month="2026-06" />);

    await user.type(screen.getByLabelText('월별 예산'), '100000');
    await user.click(screen.getByRole('button', { name: '저장' }));

    const warning = screen.getByRole('alert');
    expect(warning).toHaveTextContent('예산을');
    expect(warning).toHaveTextContent('초과');
  });

  // 예산 미초과 시 경고 미표시 테스트
  it('지출이 예산 이내이면 경고를 표시하지 않는다', async () => {
    const user = userEvent.setup();
    render(<BudgetManager totalSpent={50000} month="2026-06" />);

    await user.type(screen.getByLabelText('월별 예산'), '100000');
    await user.click(screen.getByRole('button', { name: '저장' }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  // 설정한 예산이 localStorage 에 유지되는지 테스트
  it('저장한 예산이 localStorage 에 유지되어 재렌더 시 복원된다', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<BudgetManager totalSpent={0} month="2026-06" />);

    await user.type(screen.getByLabelText('월별 예산'), '200000');
    await user.click(screen.getByRole('button', { name: '저장' }));
    expect(localStorage.getItem('budget:2026-06')).toBe('200000');

    unmount();

    // 동일한 월로 다시 렌더링하면 저장된 예산이 입력값으로 복원된다
    render(<BudgetManager totalSpent={0} month="2026-06" />);
    expect(screen.getByLabelText('월별 예산')).toHaveValue(200000);
  });

  // 월이 다르면 예산이 공유되지 않는지 테스트
  it('월별로 예산을 분리해서 저장한다', () => {
    localStorage.setItem('budget:2026-06', '100000');
    render(<BudgetManager totalSpent={0} month="2026-07" />);
    // 7월은 저장된 예산이 없으므로 입력값이 비어 있다
    expect(screen.getByLabelText('월별 예산')).toHaveValue(null);
  });

  // 음수 입력은 저장하지 않는지 테스트
  it('음수 예산은 저장하지 않는다', async () => {
    const user = userEvent.setup();
    render(<BudgetManager totalSpent={0} month="2026-06" />);

    await user.type(screen.getByLabelText('월별 예산'), '-5000');
    await user.click(screen.getByRole('button', { name: '저장' }));

    expect(localStorage.getItem('budget:2026-06')).toBeNull();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});
