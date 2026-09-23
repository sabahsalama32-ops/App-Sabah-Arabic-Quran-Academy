import { useState } from 'react';
import { isSafeContentUrl, isSafeLocalAssetPath } from '../lib/urls';
import { getYouTubeId } from '../lib/youtube';
import type { HomeworkItem, Resource, SummaryResource, VideoResource } from '../types/content';
import { Icon } from './Icon';
import { SafeExternalLink } from './SafeExternalLink';

function SafeResourceLink({ resource, action = 'افتح المورد' }: { resource: Resource; action?: string }) {
  if (!isSafeContentUrl(resource.url)) return null;
  const actionLabel = resource.action === 'download' ? 'تحميل الملف' : action;
  const nativeDownload = resource.action === 'download' && isSafeLocalAssetPath(resource.url);
  const thumbnail = resource.thumbnail && isSafeContentUrl(resource.thumbnail.src)
    ? resource.thumbnail
    : null;

  return (
    <article className="resource-card">
      <div className="resource-card__body">
        {thumbnail && (
          <img
            alt={thumbnail.alt}
            decoding="async"
            height={96}
            loading="lazy"
            onError={(event) => { event.currentTarget.hidden = true; }}
            src={thumbnail.src}
            style={{
              width: 'clamp(88px, 24vw, 132px)',
              aspectRatio: '4 / 3',
              flex: '0 0 auto',
              border: '1px solid var(--border)',
              borderRadius: '0.85rem',
              background: 'var(--color-warm-surface)',
              objectFit: 'cover',
            }}
            width={132}
          />
        )}
        <span className="resource-icon"><Icon name="file" /></span>
        <div>
          <h3>{resource.title}</h3>
          {resource.description && <p>{resource.description}</p>}
          {resource.format && <span className="resource-format">{resource.format}</span>}
        </div>
      </div>
      <SafeExternalLink
        className="text-link resource-action"
        download={nativeDownload || undefined}
        href={resource.url}
        newTab={!nativeDownload}
      >
        <span>{actionLabel}</span>
        <Icon name="external" />
      </SafeExternalLink>
    </article>
  );
}

export function ResourceList({ resources, action }: { resources: Resource[]; action?: string }) {
  const safeResources = resources.filter(({ url }) => isSafeContentUrl(url));
  return (
    <div className="resource-list">
      {safeResources.map((resource) => <SafeResourceLink action={action} key={resource.id} resource={resource} />)}
    </div>
  );
}

function SummaryImage({ resource }: { resource: SummaryResource }) {
  const [failed, setFailed] = useState(false);
  if (!isSafeContentUrl(resource.url)) return null;

  if (failed) {
    return <SafeResourceLink action="افتح الصورة" resource={resource} />;
  }

  return (
    <figure className="summary-image">
      <img
        alt={resource.alt ?? resource.title}
        loading="lazy"
        onError={() => setFailed(true)}
        src={resource.url}
      />
      <figcaption>
        <strong>{resource.title}</strong>
        <SafeExternalLink href={resource.url}>افتح الصورة</SafeExternalLink>
      </figcaption>
    </figure>
  );
}

export function SummaryResources({ resources }: { resources: SummaryResource[] }) {
  return (
    <div className="resource-list">
      {resources.map((resource) => resource.kind === 'image'
        ? <SummaryImage key={resource.id} resource={resource} />
        : <SafeResourceLink key={resource.id} resource={resource} />)}
    </div>
  );
}

function YouTubeCard({ resource, videoId }: { resource: VideoResource; videoId: string }) {
  const [showPlayer, setShowPlayer] = useState(false);

  return (
    <article className="video-card">
      <div className="video-card__heading">
        <span className="resource-icon"><Icon name="video" /></span>
        <div>
          <h3>{resource.title}</h3>
          {resource.description && <p>{resource.description}</p>}
        </div>
      </div>
      {showPlayer ? (
        <div className="video-frame">
          <iframe
            allow="encrypted-media; picture-in-picture"
            allowFullScreen
            loading="lazy"
            src={`https://www.youtube-nocookie.com/embed/${videoId}`}
            title={resource.title}
          />
        </div>
      ) : (
        <button className="video-placeholder" onClick={() => setShowPlayer(true)} type="button">
          <span className="play-badge"><Icon name="play" /></span>
          <span>تشغيل الفيديو</span>
        </button>
      )}
      <SafeExternalLink className="text-link" href={resource.url}>
        افتح في المصدر <Icon name="external" />
      </SafeExternalLink>
    </article>
  );
}

function googleDrivePreviewUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.hostname !== 'drive.google.com') return null;
    const match = url.pathname.match(/^\/file\/d\/([^/]+)(?:\/|$)/);
    if (!match) return null;
    return `https://drive.google.com/file/d/${encodeURIComponent(match[1])}/preview`;
  } catch {
    return null;
  }
}

function DriveMediaCard({ resource, previewUrl }: { resource: VideoResource; previewUrl: string }) {
  const format = (resource.format ?? '').toLowerCase();
  const isAudio = format.includes('mp3') || format.includes('audio') || format.includes('صوت');

  return (
    <article className="video-card">
      <div className="video-card__heading">
        <span className="resource-icon"><Icon name="video" /></span>
        <div>
          <h3>{resource.title}</h3>
          {resource.description && <p>{resource.description}</p>}
          {resource.format && <span className="resource-format">{resource.format}</span>}
        </div>
      </div>
      <div className="video-frame" style={isAudio ? { aspectRatio: '16 / 5' } : undefined}>
        <iframe
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen={!isAudio}
          loading="lazy"
          src={previewUrl}
          title={resource.title}
        />
      </div>
      <SafeExternalLink className="text-link" href={resource.url}>
        افتح في المصدر <Icon name="external" />
      </SafeExternalLink>
    </article>
  );
}

export function VideoResources({ resources }: { resources: VideoResource[] }) {
  return (
    <div className="resource-list">
      {resources.map((resource) => {
        if (!isSafeContentUrl(resource.url)) return null;

        const drivePreview = googleDrivePreviewUrl(resource.url);
        if (drivePreview) {
          return <DriveMediaCard key={resource.id} previewUrl={drivePreview} resource={resource} />;
        }

        if (resource.kind === 'youtube') {
          const videoId = getYouTubeId(resource.url);
          if (videoId) return <YouTubeCard key={resource.id} resource={resource} videoId={videoId} />;
        }

        if (resource.kind === 'direct') {
          return (
            <article className="video-card" key={resource.id}>
              <h3>{resource.title}</h3>
              {resource.description && <p>{resource.description}</p>}
              <video controls preload="metadata" src={resource.url}>
                {resource.captions && (
                  <track
                    default
                    kind="captions"
                    label={resource.captions.label}
                    src={resource.captions.src}
                    srcLang={resource.captions.language}
                  />
                )}
                متصفحك لا يدعم تشغيل الفيديو.
              </video>
              <SafeExternalLink className="text-link" href={resource.url}>
                افتح في المصدر <Icon name="external" />
              </SafeExternalLink>
            </article>
          );
        }

        return <SafeResourceLink key={resource.id} resource={resource} action="شاهد الفيديو" />;
      })}
    </div>
  );
}

export function HomeworkList({ items }: { items: HomeworkItem[] }) {
  return (
    <div className="resource-list">
      {items.map((item) => (
        <article className="homework-card" key={item.id}>
          <div className="homework-card__heading">
            <span className="resource-icon"><Icon name="clipboard" /></span>
            <div>
              <h3>{item.title}</h3>
              {item.dueDate && <p className="due-date">موعد مقترح: <bdi>{item.dueDate}</bdi></p>}
            </div>
          </div>
          <p className="preserve-lines">{item.instructions}</p>
          {item.resources.length > 0 && <ResourceList resources={item.resources} />}
        </article>
      ))}
    </div>
  );
}
