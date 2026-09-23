import { describe, expect, it } from 'vitest';
import { isSafeContactUrl, isSafeContentUrl, isSafeLocalAssetPath } from '../src/lib/urls';
import { getYouTubeId } from '../src/lib/youtube';

describe('سلامة الروابط', () => {
  it('تقبل HTTPS والمسارات المحلية المقيدة', () => {
    expect(isSafeContentUrl('https://example.com/file.pdf')).toBe(true);
    expect(isSafeLocalAssetPath('/assets/lessons/file.pdf')).toBe(true);
  });

  it('ترفض البروتوكولات الخطرة وبيانات الدخول وتجاوز المسار', () => {
expect(isSafeContentUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeContentUrl('https://user:secret@example.com/file')).toBe(false);
    expect(isSafeLocalAssetPath('/assets/%2e%2e/secret')).toBe(false);
    expect(isSafeLocalAssetPath('/assets/%252e%252e/secret')).toBe(false);
  });

  it('تقيد روابط التواصل بالبروتوكولات المعتمدة', () => {
    expect(isSafeContactUrl('mailto:teacher@example.com')).toBe(true);
    expect(isSafeContactUrl('tel:+201000000000')).toBe(true);
    expect(isSafeContactUrl('data:text/html,unsafe')).toBe(false);
  });
});

describe('روابط YouTube', () => {
  it.each([
    ['https://youtu.be/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://youtube.com/embed/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://youtube.com/shorts/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
  ])('تستخرج المعرّف من %s', (url, id) => expect(getYouTubeId(url)).toBe(id));

  it('ترفض النطاقات المضللة والمعرّفات غير الصالحة', () => {
    expect(getYouTubeId('https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ')).toBeNull();
    expect(getYouTubeId('https://youtube.com/watch?v=short')).toBeNull();
    expect(getYouTubeId('https://user:pass@youtube.com/watch?v=dQw4w9WgXcQ')).toBeNull();
  });
});
