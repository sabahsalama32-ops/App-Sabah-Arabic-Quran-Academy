import { useEffect, useId, useState } from 'react';
import { isSafeContentUrl } from '../lib/urls';
import type { Resource } from '../types/content';
import { Icon } from './Icon';
import { SafeExternalLink } from './SafeExternalLink';

function getGoogleDriveFileId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'drive.google.com') return null;
    const fileMatch = parsed.pathname.match(/\/file\/d\/([^/]+)/);
    return fileMatch?.[1] ?? parsed.searchParams.get('id');
  } catch {
    return null;
  }
}

function getPreviewUrl(url: string): string {
  const fileId = getGoogleDriveFileId(url);
  return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : url;
}

function getDownloadUrl(url: string): string {
  const fileId = getGoogleDriveFileId(url);
  return fileId ? `https://drive.google.com/uc?export=download&id=${fileId}` : url;
}

export function BookletViewer({ resources }: { resources: Resource[] }) {
  const safeResources = resources.filter(({ url }) => isSafeContentUrl(url));
  const [active, setActive] = useState<Resource | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (!active) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActive(null);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [active]);

  return (
    <>
      <div className="resource-list booklet-list">
        {safeResources.map((resource) => (
          <article className="resource-card booklet-card" key={resource.id}>
            <div className="resource-card__body">
              <span className="resource-icon"><Icon name="book" /></span>
              <div>
                <h3>{resource.title}</h3>
                {resource.description && <p>{resource.description}</p>}
                <span className="resource-format">{resource.format ?? 'بوكليت PDF'}</span>
              </div>
            </div>
            <div className="booklet-card__actions">
              <button className="secondary-button booklet-open-button" onClick={() => setActive(resource)} type="button">
                <Icon name="book" />
                عرض البوكليت
              </button>
              <SafeExternalLink
                className="text-link booklet-download-link"
                href={getDownloadUrl(resource.url)}
              >
                <Icon name="download" />
                تحميل PDF
              </SafeExternalLink>
            </div>
          </article>
        ))}
      </div>

      {active && (
        <div className="pdf-drawer-layer">
          <button
            aria-label="إغلاق عارض البوكليت"
            className="pdf-drawer-backdrop"
            onClick={() => setActive(null)}
            type="button"
          />
          <aside aria-labelledby={titleId} aria-modal="true" className="pdf-drawer" role="dialog">
            <header className="pdf-drawer__header">
              <div>
                <span className="resource-format">البوكليت</span>
                <h2 id={titleId}>{active.title}</h2>
              </div>
              <button autoFocus className="pdf-drawer__close" onClick={() => setActive(null)} type="button">
                <span aria-hidden="true">×</span>
                <span className="sr-only">إغلاق</span>
              </button>
            </header>
            <div className="pdf-drawer__actions">
              <SafeExternalLink className="primary-button" href={getDownloadUrl(active.url)}>
                <Icon name="download" />
                تحميل البوكليت
              </SafeExternalLink>
              <SafeExternalLink className="text-link" href={active.url}>
                فتح في Google Drive
                <Icon name="external" />
              </SafeExternalLink>
            </div>
            <iframe
              className="pdf-drawer__frame"
              src={getPreviewUrl(active.url)}
              title={`عرض ${active.title}`}
            />
          </aside>
        </div>
      )}
    </>
  );
}
