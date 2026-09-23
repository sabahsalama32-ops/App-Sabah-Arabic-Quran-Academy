const localAssetPrefix = '/assets/';

function hasCredentials(url: URL): boolean {
  return Boolean(url.username || url.password);
}

export function isSafeLocalAssetPath(value: string): boolean {
  if (!value.startsWith(localAssetPrefix) || value.includes('\\')) return false;

  try {
    let decoded = value.split(/[?#]/, 1)[0];
    for (let pass = 0; pass < 3; pass += 1) {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    }
    return !decoded.split('/').includes('..');
  } catch {
    return false;
  }
}

export function isSafeContentUrl(value: string): boolean {
  if (typeof value !== 'string' || value.trim() !== value || !value) return false;
  if (isSafeLocalAssetPath(value)) return true;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !hasCredentials(url);
  } catch {
    return false;
  }
}

export function isSafeContactUrl(value: string): boolean {
  if (typeof value !== 'string' || value.trim() !== value || !value) return false;

  try {
    const url = new URL(value);
    return ['https:', 'mailto:', 'tel:'].includes(url.protocol) && !hasCredentials(url);
  } catch {
    return false;
  }
}

export function isExternalHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !hasCredentials(url) && !isSafeLocalAssetPath(value);
  } catch {
    return false;
  }
}
