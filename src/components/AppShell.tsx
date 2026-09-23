import { useEffect, type PropsWithChildren } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { teacher } from '../lib/content';
import { uiCopy } from '../lib/ui-copy';
import { BrandImage } from './BrandImage';
import { Icon } from './Icon';

function applyTeacherIdentity() {
  const root = document.documentElement;
  root.lang = teacher.language;
  root.dir = teacher.direction;
  root.style.setProperty('--color-primary', teacher.theme.primary);
  root.style.setProperty('--color-primary-contrast', teacher.theme.primaryContrast);
  root.style.setProperty('--color-accent', teacher.theme.accent);
  root.style.setProperty('--color-background', teacher.theme.background);
  root.style.setProperty('--color-surface', teacher.theme.surface);
  root.style.setProperty('--color-text', teacher.theme.text);
  root.style.setProperty('--color-muted', teacher.theme.mutedText);
  root.style.setProperty('--color-border', teacher.theme.border);
  root.style.setProperty('--color-focus', teacher.theme.focus);
  root.style.setProperty('--color-secondary', teacher.theme.secondary ?? teacher.theme.text);
  root.style.setProperty('--color-creative', teacher.theme.creativeAccent ?? teacher.theme.accent);
  root.style.setProperty('--color-warm-surface', teacher.theme.warmSurface ?? teacher.theme.surface);
  root.style.setProperty('--font-family', teacher.theme.fontFamily);
  document.title = teacher.appName;

  const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (description) description.content = teacher.bio ?? teacher.appName;
  const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (themeColor) themeColor.content = teacher.theme.background;
}

export function AppShell({ children }: PropsWithChildren) {
  const location = useLocation();

  useEffect(() => {
    applyTeacherIdentity();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const timer = window.setTimeout(() => document.querySelector<HTMLElement>('#page-title')?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">انتقل إلى المحتوى</a>
      <header className="site-header">
        <div className="container header-inner">
          <NavLink className="brand-link" to="/" aria-label={`${teacher.appName} — الرئيسية`}>
            {teacher.logo && <BrandImage className="header-logo" image={teacher.logo} eager />}
            <span>
              <strong>{teacher.appName}</strong>
              {teacher.brandName && <small>{teacher.brandName}</small>}
            </span>
          </NavLink>
          <nav aria-label="التنقل الرئيسي" className="main-nav">
            <NavLink to="/" end>
              <Icon name="home" />
              <span>{uiCopy.nav.home}</span>
            </NavLink>
            <NavLink to="/curriculum">
              <Icon name="book" />
              <span>{uiCopy.nav.curriculum}</span>
            </NavLink>
          </nav>
        </div>
      </header>
      <main id="main-content">{children}</main>
      <footer className="site-footer">
        <div className="container footer-inner">
          <p>{teacher.name ? `${teacher.appName} · ${teacher.name}` : teacher.appName}</p>
          {teacher.tagline && <p className="footer-tagline">{teacher.tagline}</p>}
        </div>
      </footer>
    </div>
  );
}
