import type { AnchorHTMLAttributes, PropsWithChildren } from 'react';
import { isSafeContactUrl, isSafeContentUrl } from '../lib/urls';

interface SafeExternalLinkProps extends PropsWithChildren,
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'rel' | 'target'> {
  href: string;
  mode?: 'content' | 'contact';
  newTab?: boolean;
}

export function SafeExternalLink({
  children,
  href,
  mode = 'content',
  newTab = true,
  ...props
}: SafeExternalLinkProps) {
  const safe = mode === 'contact' ? isSafeContactUrl(href) : isSafeContentUrl(href);
  if (!safe) return null;

  return (
    <a
      {...props}
      dir="auto"
      href={href}
      rel={newTab ? 'noopener noreferrer' : undefined}
      target={newTab ? '_blank' : undefined}
    >
      {children}
    </a>
  );
}
