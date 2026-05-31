import { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

// 버튼 종류
export type ButtonVariant = 'primary' | 'secondary';

// 버튼 크기
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  // 버튼 종류 (기본값: primary)
  variant?: ButtonVariant;
  // 버튼 크기 (기본값: medium)
  size?: ButtonSize;
}

export function Button({
  variant = 'primary',
  size = 'medium',
  type = 'button',
  className,
  children,
  ...rest
}: ButtonProps) {
  // variant / size / 추가 className 을 조합
  const classes = [styles.button, styles[variant], styles[size], className]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}

export default Button;
