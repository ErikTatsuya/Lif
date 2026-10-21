import logo from '../assets/logo.svg';

type BrandProps = {
  href?: string;
  label?: string;
  ariaLabel?: string;
  variant?: 'default' | 'sidebar';
};

export function Brand({
  href = '/',
  label = 'Lif',
  ariaLabel = `${label} — página inicial`,
  variant = 'default'
}: BrandProps) {
  return (
    <a className={`brand${variant === 'sidebar' ? ' brand--sidebar' : ''}`} href={href} aria-label={ariaLabel}>
      <img src={logo} alt="" />
      <span>{label}</span>
    </a>
  );
}
