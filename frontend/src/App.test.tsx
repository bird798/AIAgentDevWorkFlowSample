import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// 폼을 채워 거래 내역 한 건을 추가하는 헬퍼
async function addTransaction(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('날짜'), '2026-06-05');
  await user.type(screen.getByLabelText('금액'), '12000');
  await user.selectOptions(screen.getByLabelText('카테고리'), '식비');
  // '저장' 버튼은 거래 폼과 예산 폼 두 곳에 있으므로 거래 폼(클래스 submit-button)을 지정
  const submitButtons = screen.getAllByRole('button', { name: '저장' });
  const transactionSubmit = submitButtons.find(btn =>
    btn.classList.contains('submit-button'),
  );
  await user.click(transactionSubmit as HTMLElement);
}

describe('App 초기화 확인 다이얼로그', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  // 헤더 우측에 초기화 버튼이 렌더링되는지 확인
  it('초기화 버튼을 렌더링한다', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: '초기화' })).toBeInTheDocument();
  });

  // 확인(true) 케이스: 확인 메시지가 표시되고 내역이 비워진다
  it('초기화 확인 시 거래 내역을 모두 삭제한다', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<App />);

    await addTransaction(user);
    // 추가된 내역(카테고리 '식비')이 목록에 표시됨 (select 옵션과 구분)
    expect(
      screen.getByText('식비', { selector: '.transaction-item__category' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '초기화' }));

    // 확인 다이얼로그가 안내 메시지와 함께 호출됨
    expect(confirmSpy).toHaveBeenCalledWith('모든 내역을 삭제하시겠습니까?');
    // 내역이 비워져 빈 상태 안내가 표시됨
    expect(
      screen.queryByText('식비', { selector: '.transaction-item__category' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('등록된 내역이 없습니다.')).toBeInTheDocument();
  });

  // 취소(false) 케이스: 아무 동작도 일어나지 않는다
  it('초기화 취소 시 거래 내역을 그대로 유지한다', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<App />);

    await addTransaction(user);
    expect(
      screen.getByText('식비', { selector: '.transaction-item__category' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '초기화' }));

    expect(confirmSpy).toHaveBeenCalledWith('모든 내역을 삭제하시겠습니까?');
    // 취소했으므로 내역이 유지됨
    expect(
      screen.getByText('식비', { selector: '.transaction-item__category' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('등록된 내역이 없습니다.')).not.toBeInTheDocument();
  });

  // 확인(true) 케이스: 저장된 예산(budget:) localStorage 키도 삭제된다
  it('초기화 확인 시 저장된 예산 데이터를 삭제한다', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    localStorage.setItem('budget:2026-06', '500000');
    render(<App />);

    await user.click(screen.getByRole('button', { name: '초기화' }));

    expect(localStorage.getItem('budget:2026-06')).toBeNull();
  });

  // 취소(false) 케이스: 저장된 예산 데이터가 유지된다
  it('초기화 취소 시 저장된 예산 데이터를 유지한다', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    localStorage.setItem('budget:2026-06', '500000');
    render(<App />);

    await user.click(screen.getByRole('button', { name: '초기화' }));

    expect(localStorage.getItem('budget:2026-06')).toBe('500000');
  });
});
