import { ReactNode, MouseEventHandler } from 'react';

interface ButtonProps {
  // 버튼에 표시할 라벨(자식 노드)
  children: ReactNode;
  // 클릭 이벤트 핸들러
  onClick?: MouseEventHandler<HTMLButtonElement>;
  // 비활성화 상태
  disabled?: boolean;
  // 버튼 타입 (기본값: button)
  type?: 'button' | 'submit';
}

// 재사용 가능한 Button 컴포넌트의 기본 구조
export function Button({ children, onClick, disabled = false, type = 'button' }: ButtonProps) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
