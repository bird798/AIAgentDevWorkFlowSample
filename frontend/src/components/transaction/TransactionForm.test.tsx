import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TransactionForm from './TransactionForm';

describe('TransactionForm', () => {
  // 입력 필드 렌더링 테스트
  it('날짜/금액/카테고리/메모 입력 필드를 렌더링한다', () => {
    render(<TransactionForm onSubmit={vi.fn()} />);
    expect(screen.getByLabelText('날짜')).toBeInTheDocument();
    expect(screen.getByLabelText('금액')).toBeInTheDocument();
    expect(screen.getByLabelText('카테고리')).toBeInTheDocument();
    expect(screen.getByLabelText('메모')).toBeInTheDocument();
  });

  // 수입/지출 유형 선택 UI 테스트
  it('유형 선택 시 카테고리 목록이 유형에 맞게 바뀐다', async () => {
    const user = userEvent.setup();
    render(<TransactionForm onSubmit={vi.fn()} />);

    // 기본값은 지출 → 지출 카테고리 노출
    expect(screen.getByRole('option', { name: '식비' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '수입' }));
    // 수입으로 전환되면 수입 카테고리 노출
    expect(screen.getByRole('option', { name: '급여' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: '식비' })).not.toBeInTheDocument();
  });

  // 유효성 검사 테스트
  it('금액이 비어 있으면 에러를 표시하고 저장하지 않는다', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<TransactionForm onSubmit={handleSubmit} />);

    await user.click(screen.getByRole('button', { name: '저장' }));

    expect(screen.getByText('금액을 입력해주세요.')).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('금액이 0 이하면 에러를 표시한다', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<TransactionForm onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText('날짜'), '2026-06-05');
    await user.type(screen.getByLabelText('금액'), '-1000');
    await user.selectOptions(screen.getByLabelText('카테고리'), '식비');
    await user.click(screen.getByRole('button', { name: '저장' }));

    expect(screen.getByText('금액은 0보다 큰 값이어야 합니다.')).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  // 저장 동작 테스트
  it('유효한 입력을 저장하면 onSubmit으로 내역을 전달한다', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<TransactionForm onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText('날짜'), '2026-06-05');
    await user.type(screen.getByLabelText('금액'), '15000');
    await user.selectOptions(screen.getByLabelText('카테고리'), '식비');
    await user.type(screen.getByLabelText('메모'), '점심 식사');
    await user.click(screen.getByRole('button', { name: '저장' }));

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith({
      type: 'expense',
      date: '2026-06-05',
      amount: 15000,
      category: '식비',
      memo: '점심 식사',
    });
  });

  // 저장 후 폼 초기화 테스트
  it('저장 후 입력 필드를 초기화한다', async () => {
    const user = userEvent.setup();
    render(<TransactionForm onSubmit={vi.fn()} />);

    await user.type(screen.getByLabelText('날짜'), '2026-06-05');
    await user.type(screen.getByLabelText('금액'), '15000');
    await user.selectOptions(screen.getByLabelText('카테고리'), '식비');
    await user.click(screen.getByRole('button', { name: '저장' }));

    expect(screen.getByLabelText('금액')).toHaveValue(null);
    expect(screen.getByLabelText('카테고리')).toHaveValue('');
  });
});
