import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import App from './App';

describe('App 헤더', () => {
  // 헤더에 제목과 초기화 버튼이 함께 렌더링되는지 확인
  it('헤더에 "가계부" 제목과 "초기화" 버튼을 렌더링한다', () => {
    render(<App />);

    const header = screen.getByRole('banner', { name: '앱 헤더' });
    expect(within(header).getByRole('heading', { name: '가계부', level: 1 })).toBeInTheDocument();
    expect(within(header).getByRole('button', { name: '초기화' })).toBeInTheDocument();
  });

  // 헤더가 제목과 버튼을 좌우로 배치하는 flex 레이아웃인지 확인
  it('헤더를 space-between flex 레이아웃으로 구성한다', () => {
    render(<App />);

    const header = screen.getByRole('banner', { name: '앱 헤더' });
    expect(header).toHaveStyle({ display: 'flex', justifyContent: 'space-between' });
  });
});
