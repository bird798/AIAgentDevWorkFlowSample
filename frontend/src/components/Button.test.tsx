import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  // 라벨(children) 렌더링 테스트
  it('children으로 전달한 라벨을 렌더링한다', () => {
    render(<Button>확인</Button>);
    expect(screen.getByRole('button', { name: '확인' })).toBeInTheDocument();
  });

  // onClick 이벤트 호출 테스트
  it('클릭하면 onClick 핸들러를 호출한다', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>클릭</Button>);

    await user.click(screen.getByRole('button', { name: '클릭' }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // disabled 상태일 때 클릭 비활성화 테스트
  it('disabled 상태에서는 클릭해도 onClick이 호출되지 않는다', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <Button onClick={handleClick} disabled>
        비활성
      </Button>
    );

    const button = screen.getByRole('button', { name: '비활성' });
    expect(button).toBeDisabled();

    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  // variant별 렌더링 테스트
  describe('variant', () => {
    it.each([
      ['primary', 'btn--primary'],
      ['secondary', 'btn--secondary'],
      ['danger', 'btn--danger'],
    ] as const)('variant=%s 이면 %s 클래스를 적용한다', (variant, expectedClass) => {
      render(<Button variant={variant}>버튼</Button>);
      expect(screen.getByRole('button', { name: '버튼' })).toHaveClass(expectedClass);
    });

    it('variant를 지정하지 않으면 기본값 primary를 사용한다', () => {
      render(<Button>버튼</Button>);
      expect(screen.getByRole('button', { name: '버튼' })).toHaveClass('btn--primary');
    });
  });

  // size별 렌더링 테스트
  describe('size', () => {
    it.each([
      ['sm', 'btn--sm'],
      ['md', 'btn--md'],
      ['lg', 'btn--lg'],
    ] as const)('size=%s 이면 %s 클래스를 적용한다', (size, expectedClass) => {
      render(<Button size={size}>버튼</Button>);
      expect(screen.getByRole('button', { name: '버튼' })).toHaveClass(expectedClass);
    });

    it('size를 지정하지 않으면 기본값 md를 사용한다', () => {
      render(<Button>버튼</Button>);
      expect(screen.getByRole('button', { name: '버튼' })).toHaveClass('btn--md');
    });
  });
});
