import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { buttonClasses, type ButtonSize, type ButtonVariant } from './buttonStyles'

interface StyleProps {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function Button({
  variant,
  size,
  className,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & StyleProps) {
  return <button type={type} className={buttonClasses(variant, size, className)} {...props} />
}

/** Link interno (React Router) com aparência de botão. */
export function ButtonLink({ variant, size, className, ...props }: LinkProps & StyleProps) {
  return <Link className={buttonClasses(variant, size, className)} {...props} />
}

/**
 * Link externo com aparência de botão. Abre em nova aba e avisa leitores de tela.
 * Para mailto:/tel: use newTab={false}.
 */
export function ExternalButtonLink({
  variant,
  size,
  className,
  newTab = true,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & StyleProps & { newTab?: boolean }) {
  return (
    <a
      className={buttonClasses(variant, size, className)}
      {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...props}
    >
      {children}
      {newTab && <span className="sr-only"> (abre em nova aba)</span>}
    </a>
  )
}
