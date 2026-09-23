const youtubeIdPattern = /^[A-Za-z0-9_-]{11}$/;

function validId(value: string | null | undefined): string | null {
  return value && youtubeIdPattern.test(value) ? value : null;
}

export function getYouTubeId(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.username || url.password || url.protocol !== 'https:') return null;
    const host = url.hostname.toLowerCase().replace(/^www\./, '');

    if (host === 'youtu.be') {
      return validId(url.pathname.split('/').filter(Boolean)[0]);
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (url.pathname === '/watch') return validId(url.searchParams.get('v'));
      const match = url.pathname.match(/^\/(?:embed|shorts)\/([^/?#]+)/);
      return validId(match?.[1]);
    }
  } catch {
    return null;
  }

  return null;
}
