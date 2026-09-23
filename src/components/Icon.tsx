import type { ReactNode, SVGProps } from 'react';

export type IconName =
  | 'arrow-left'
  | 'arrow-right'
  | 'book'
  | 'brain'
  | 'chevron'
  | 'clipboard'
  | 'download'
  | 'external'
  | 'file'
  | 'game'
  | 'home'
  | 'layers'
  | 'mail'
  | 'map'
  | 'message'
  | 'play'
  | 'sparkle'
  | 'video';

const paths: Record<IconName, ReactNode> = {
  'arrow-left': <><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></>,
  'arrow-right': <><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></>,
  book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></>,
  brain: <><path d="M9.5 4.5A2.5 2.5 0 0 0 7 7v.2A3 3 0 0 0 5 10v.2A3 3 0 0 0 6 16v.5A2.5 2.5 0 0 0 10.5 18V6a2 2 0 0 0-1-1.5Z"/><path d="M14.5 4.5A2.5 2.5 0 0 1 17 7v.2a3 3 0 0 1 2 2.8v.2a3 3 0 0 1-1 5.8v.5a2.5 2.5 0 0 1-4.5 1.5V6a2 2 0 0 1 1-1.5Z"/></>,
  chevron: <path d="m9 18 6-6-6-6"/>,
  clipboard: <><rect width="14" height="18" x="5" y="4" rx="2"/><path d="M9 4.5V3h6v1.5M9 11h6M9 15h4"/></>,
  download: <><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></>,
  external: <><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></>,
  file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></>,
  game: <><path d="M6 12h4M8 10v4"/><path d="M15 13h.01M18 11h.01"/><path d="M17.3 6H6.7a4 4 0 0 0-3.8 2.7L1.5 15a3 3 0 0 0 4.9 3l2-2h7.2l2 2a3 3 0 0 0 4.9-3l-1.4-6.3A4 4 0 0 0 17.3 6Z"/></>,
  home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></>,
  layers: <><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/></>,
  mail: <><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-10 6L2 7"/></>,
  map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"/><path d="M9 3v15M15 6v15"/></>,
  message: <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z"/>,
  play: <path d="m8 5 11 7-11 7V5Z"/>,
  sparkle: <><path d="m12 3-1.2 3.2L8 7.5l2.8 1.3L12 12l1.2-3.2L16 7.5l-2.8-1.3L12 3Z"/><path d="m5 13-.8 2.2L2 16l2.2.8L5 19l.8-2.2L8 16l-2.2-.8L5 13ZM19 12l-.8 2.2-2.2.8 2.2.8L19 18l.8-2.2L22 15l-2.2-.8L19 12Z"/></>,
  video: <><path d="m16 13 5 3V8l-5 3"/><rect width="13" height="12" x="3" y="6" rx="2"/></>,
};

export function Icon({ name, ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="24"
      viewBox="0 0 24 24"
      width="24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
