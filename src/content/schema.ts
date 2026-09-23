import { getYouTubeId } from '../lib/youtube';
import { isExternalHttpsUrl, isSafeContactUrl, isSafeContentUrl } from '../lib/urls';

export type Direction = 'rtl' | 'ltr';
export type ResourceAction = 'open' | 'download';

export interface ImageAsset {
  src: string;
  alt: string;
}

export interface Contact {
  id: string;
  label: string;
  url: string;
}

export interface TeacherTheme {
  primary: string;
  primaryContrast: string;
  accent: string;
  secondary?: string;
  background: string;
  surface: string;
  text: string;
  mutedText: string;
  border: string;
  focus: string;
  creativeAccent?: string;
  warmSurface?: string;
  fontFamily: string;
}

export interface TeacherProfile {
  schemaVersion: 1;
  appName: string;
  name: string;
  brandName?: string;
  professionalTitle?: string;
  specialization?: string;
  bio?: string;
  tagline?: string;
  language: string;
  direction: Direction;
  photo?: ImageAsset | null;
  logo?: ImageAsset | null;
  contacts: Contact[];
  theme: TeacherTheme;
  designPreferences?: {
    style?: string;
    avoid?: string[];
  };
}

export interface LessonReference {
  id: string;
  title: string;
}

export interface CurriculumUnit {
  id: string;
  title: string;
  description?: string;
  lessons: LessonReference[];
}

export interface CurriculumSubject {
  id: string;
  title: string;
  units: CurriculumUnit[];
}

export interface CurriculumLevel {
  id: string;
  title: string;
  stage?: string;
  subjects: CurriculumSubject[];
}

export interface Curriculum {
  schemaVersion: 1;
  levels: CurriculumLevel[];
}

export interface CaptionsTrack {
  src: string;
  label: string;
  language: string;
}

export interface Resource {
  id: string;
  title: string;
  url: string;
  description?: string;
  format?: string;
  action?: ResourceAction;
  thumbnail?: ImageAsset | null;
  kind?: 'link' | 'direct' | 'image' | 'youtube';
  transcript?: string;
  captions?: CaptionsTrack;
}

export interface AudioResource extends Resource {
  kind: 'direct';
}

export type SummaryResource = Omit<Resource, 'kind'> & (
  | { kind: 'image'; alt: string }
  | { kind: 'link'; alt?: string }
);

export interface VideoResource extends Omit<Resource, 'kind'> {
  kind: 'youtube' | 'direct' | 'link';
}

export interface HomeworkItem {
  id: string;
  title: string;
  instructions: string;
  resources: Resource[];
  dueDate?: string;
}

export interface LessonContent {
  schemaVersion: 1;
  id: string;
  explanation: {
    text: string;
    audio: AudioResource | null;
  };
  summary: {
    text: string;
    resources: SummaryResource[];
  };
  videos: VideoResource[];
  activities: Resource[];
  assessments: Resource[];
  files: Resource[];
  homework: HomeworkItem[];
}

export interface LessonContext {
  level: CurriculumLevel;
  subject: CurriculumSubject;
  unit: CurriculumUnit;
  lesson: LessonReference;
  lessonIndex: number;
}

export interface ValidationIssue {
  path: string;
  rule: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult<T> {
  data: T | null;
  issues: ValidationIssue[];
}

type UnknownRecord = Record<string, unknown>;

const stableIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const hexColorPattern = /^#[0-9a-f]{6}$/i;
const htmlPattern = /<\s*\/?\s*[a-z][^>]*>/i;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export function isStableId(value: unknown): value is string {
  return typeof value === 'string' && stableIdPattern.test(value);
}

export function containsExecutableHtml(value: string): boolean {
  return htmlPattern.test(value);
}

export function isValidDate(value: string): boolean {
  if (!datePattern.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

export function contrastRatio(first: string, second: string): number {
  const luminance = (hex: string) => {
    const channels = [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16) / 255);
    const [red, green, blue] = channels.map((channel) => channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4);
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  };
  const high = Math.max(luminance(first), luminance(second));
  const low = Math.min(luminance(first), luminance(second));
  return (high + 0.05) / (low + 0.05);
}

function isRecord(value: unknown): value is UnknownRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function error(issues: ValidationIssue[], path: string, rule: string, message: string) {
  issues.push({ path, rule, message, severity: 'error' });
}

function warning(issues: ValidationIssue[], path: string, rule: string, message: string) {
  issues.push({ path, rule, message, severity: 'warning' });
}

function validateString(
  issues: ValidationIssue[],
  value: unknown,
  path: string,
  { allowEmpty = false, plainText = true }: { allowEmpty?: boolean; plainText?: boolean } = {},
): value is string {
  if (typeof value !== 'string' || (!allowEmpty && value.trim() === '')) {
    error(issues, path, 'required-string', allowEmpty ? 'يجب أن تكون القيمة نصًا.' : 'يجب أن تكون القيمة نصًا غير فارغ.');
    return false;
  }
  if (plainText && containsExecutableHtml(value)) {
    error(issues, path, 'plain-text-only', 'HTML غير مسموح في بيانات العرض.');
    return false;
  }
  return true;
}

function validateOptionalString(issues: ValidationIssue[], value: unknown, path: string) {
  if (value !== undefined) validateString(issues, value, path, { allowEmpty: true });
}

function validateArray(issues: ValidationIssue[], value: unknown, path: string): value is unknown[] {
  if (!Array.isArray(value)) {
    error(issues, path, 'array-type', 'يجب أن تكون القيمة مصفوفة.');
    return false;
  }
  return true;
}

function validateId(issues: ValidationIssue[], value: unknown, path: string) {
  if (!isStableId(value)) error(issues, path, 'stable-id', 'المعرّف مطلوب ويجب أن يكون بصيغة kebab-case.');
}

function validateImage(issues: ValidationIssue[], value: unknown, path: string) {
  if (!isRecord(value)) {
    error(issues, path, 'image-object', 'يجب أن تكون الصورة كائنًا يحتوي src وalt.');
    return;
  }
  validateString(issues, value.src, `${path}.src`);
  validateString(issues, value.alt, `${path}.alt`);
  if (typeof value.src === 'string' && !isSafeContentUrl(value.src)) {
    error(issues, `${path}.src`, 'safe-url', 'رابط أو مسار الصورة غير آمن.');
  }
}

function validateResource(
  issues: ValidationIssue[],
  value: unknown,
  path: string,
  allowedKinds?: string[],
  requireKind = false,
) {
  if (!isRecord(value)) {
    error(issues, path, 'resource-object', 'يجب أن يكون المورد كائنًا.');
    return;
  }
  validateId(issues, value.id, `${path}.id`);
  validateString(issues, value.title, `${path}.title`);
  validateString(issues, value.url, `${path}.url`, { plainText: false });
  if (typeof value.url === 'string') {
    if (!isSafeContentUrl(value.url)) {
      error(issues, `${path}.url`, 'safe-url', 'يُقبل HTTPS بلا credentials أو مسار محلي آمن يبدأ بـ /assets/ فقط.');
    } else if (isExternalHttpsUrl(value.url)) {
      warning(issues, `${path}.url`, 'external-availability', 'مورد خارجي؛ تحقّق يدويًا من الإتاحة وسياسة الخصوصية.');
    }
  }
  validateOptionalString(issues, value.description, `${path}.description`);
  validateOptionalString(issues, value.format, `${path}.format`);
  validateOptionalString(issues, value.transcript, `${path}.transcript`);
  if (value.action !== undefined && !['open', 'download'].includes(String(value.action))) {
    error(issues, `${path}.action`, 'resource-action', 'القيمة المسموحة هي open أو download.');
  }
  if (value.thumbnail !== undefined && value.thumbnail !== null) validateImage(issues, value.thumbnail, `${path}.thumbnail`);
  if (requireKind && value.kind === undefined) {
    error(issues, `${path}.kind`, 'resource-kind-required', 'نوع المورد مطلوب في هذا القسم.');
  } else if (allowedKinds && value.kind !== undefined && !allowedKinds.includes(String(value.kind))) {
    error(issues, `${path}.kind`, 'resource-kind', `القيمة المسموحة: ${allowedKinds.join(' أو ')}.`);
  }
  if (value.captions !== undefined) {
    if (!isRecord(value.captions)) {
      error(issues, `${path}.captions`, 'captions-object', 'يجب أن تكون captions كائنًا.');
} else {
      validateString(issues, value.captions.src, `${path}.captions.src`, { plainText: false });
      validateString(issues, value.captions.label, `${path}.captions.label`);
      validateString(issues, value.captions.language, `${path}.captions.language`);
      if (typeof value.captions.src === 'string' && !isSafeContentUrl(value.captions.src)) {
        error(issues, `${path}.captions.src`, 'safe-url', 'مسار captions غير آمن.');
      }
    }
  }
}

export function validateTeacherData(value: unknown): ValidationResult<TeacherProfile> {
  const issues: ValidationIssue[] = [];
  if (!isRecord(value)) {
    error(issues, '$', 'object-type', 'يجب أن يكون ملف الهوية كائنًا.');
    return { data: null, issues };
  }
  if (value.schemaVersion !== 1) error(issues, 'schemaVersion', 'schema-version', 'الإصدار المدعوم هو 1.');
  validateString(issues, value.appName, 'appName');
  validateString(issues, value.name, 'name', { allowEmpty: true });
  validateString(issues, value.language, 'language');
  if (!['rtl', 'ltr'].includes(String(value.direction))) error(issues, 'direction', 'direction-enum', 'القيمة المسموحة rtl أو ltr.');
  for (const field of ['brandName', 'professionalTitle', 'specialization', 'bio', 'tagline'] as const) {
    validateOptionalString(issues, value[field], field);
  }
  if (value.photo !== undefined && value.photo !== null) validateImage(issues, value.photo, 'photo');
  if (value.logo !== undefined && value.logo !== null) validateImage(issues, value.logo, 'logo');

  if (!isRecord(value.theme)) {
    error(issues, 'theme', 'theme-object', 'يجب أن تكون theme كائنًا.');
  } else {
    for (const field of ['primary', 'primaryContrast', 'accent', 'background', 'surface', 'text', 'mutedText', 'border', 'focus'] as const) {
      validateString(issues, value.theme[field], `theme.${field}`);
      if (typeof value.theme[field] === 'string' && !hexColorPattern.test(value.theme[field])) {
        error(issues, `theme.${field}`, 'hex-color', 'استخدم لونًا سداسيًا من ست خانات.');
      }
    }
    for (const field of ['secondary', 'creativeAccent', 'warmSurface'] as const) {
      if (value.theme[field] !== undefined && (typeof value.theme[field] !== 'string' || !hexColorPattern.test(value.theme[field]))) {
        error(issues, `theme.${field}`, 'hex-color', 'استخدم لونًا سداسيًا من ست خانات.');
      }
    }
    validateString(issues, value.theme.fontFamily, 'theme.fontFamily');
    const contrastPairs: Array<[string, string, number, string]> = [
      ['primary', 'primaryContrast', 4.5, 'نص الزر الأساسي'],
      ['background', 'text', 4.5, 'النص الأساسي'],
      ['background', 'mutedText', 4.5, 'النص الثانوي'],
      ['background', 'focus', 3, 'مؤشر التركيز'],
    ];
    for (const [first, second, minimum, label] of contrastPairs) {
      const firstColor = value.theme[first];
      const secondColor = value.theme[second];
      if (typeof firstColor === 'string' && typeof secondColor === 'string'
        && hexColorPattern.test(firstColor) && hexColorPattern.test(secondColor)
        && contrastRatio(firstColor, secondColor) < minimum) {
        error(issues, `theme.${second}`, 'color-contrast', `${label} لا يحقق نسبة التباين الدنيا ${minimum}:1.`);
      }
    }
  }

  if (validateArray(issues, value.contacts, 'contacts')) {
    const ids = new Set<string>();
    value.contacts.forEach((contact, index) => {
      const path = `contacts[${index}]`;
      if (!isRecord(contact)) return error(issues, path, 'contact-object', 'يجب أن تكون وسيلة التواصل كائنًا.');
      validateId(issues, contact.id, `${path}.id`);
      if (typeof contact.id === 'string' && ids.has(contact.id)) error(issues, `${path}.id`, 'unique-id', 'معرّف وسيلة التواصل مكرر.');
      if (typeof contact.id === 'string') ids.add(contact.id);
      validateString(issues, contact.label, `${path}.label`);
      validateString(issues, contact.url, `${path}.url`, { plainText: false });
      if (typeof contact.url === 'string' && !isSafeContactUrl(contact.url)) {
        error(issues, `${path}.url`, 'safe-contact-url', 'يُقبل HTTPS أو mailto أو tel بلا credentials فقط.');
      }
    });
  }

  if (value.designPreferences !== undefined) {
    if (!isRecord(value.designPreferences)) {
      error(issues, 'designPreferences', 'object-type', 'يجب أن تكون تفضيلات التصميم كائنًا.');
    } else {
      validateOptionalString(issues, value.designPreferences.style, 'designPreferences.style');
      if (value.designPreferences.avoid !== undefined && validateArray(issues, value.designPreferences.avoid, 'designPreferences.avoid')) {
        value.designPreferences.avoid.forEach((item, index) => validateString(issues, item, `designPreferences.avoid[${index}]`));
      }
    }
  }

  return { data: issues.some(({ severity }) => severity === 'error') ? null : value as unknown as TeacherProfile, issues };
}

export function validateCurriculumData(value: unknown): ValidationResult<Curriculum> {
  const issues: ValidationIssue[] = [];
  if (!isRecord(value)) {
    error(issues, '$', 'object-type', 'يجب أن يكون فهرس المنهج كائنًا.');
    return { data: null, issues };
  }
  if (value.schemaVersion !== 1) error(issues, 'schemaVersion', 'schema-version', 'الإصدار المدعوم هو 1.');
  const allIds = new Set<string>();
  const addUniqueId = (id: unknown, path: string) => {
    validateId(issues, id, path);
    if (typeof id === 'string' && allIds.has(id)) error(issues, path, 'unique-id', `المعرّف ${id} مكرر على مستوى المشروع.`);
    if (typeof id === 'string') allIds.add(id);
  };

  if (validateArray(issues, value.levels, 'levels')) {
    value.levels.forEach((level, levelIndex) => {
      const levelPath = `levels[${levelIndex}]`;
      if (!isRecord(level)) return error(issues, levelPath, 'level-object', 'يجب أن يكون المستوى كائنًا.');
      addUniqueId(level.id, `${levelPath}.id`);
      validateString(issues, level.title, `${levelPath}.title`);
      validateOptionalString(issues, level.stage, `${levelPath}.stage`);
      if (!validateArray(issues, level.subjects, `${levelPath}.subjects`)) return;
      level.subjects.forEach((subject, subjectIndex) => {
        const subjectPath = `${levelPath}.subjects[${subjectIndex}]`;
        if (!isRecord(subject)) return error(issues, subjectPath, 'subject-object', 'يجب أن تكون المادة كائنًا.');
        addUniqueId(subject.id, `${subjectPath}.id`);
        validateString(issues, subject.title, `${subjectPath}.title`);
        if (!validateArray(issues, subject.units, `${subjectPath}.units`)) return;
        subject.units.forEach((unit, unitIndex) => {
          const unitPath = `${subjectPath}.units[${unitIndex}]`;
          if (!isRecord(unit)) return error(issues, unitPath, 'unit-object', 'يجب أن تكون الوحدة كائنًا.');
          addUniqueId(unit.id, `${unitPath}.id`);
          validateString(issues, unit.title, `${unitPath}.title`);
          validateOptionalString(issues, unit.description, `${unitPath}.description`);
          if (!validateArray(issues, unit.lessons, `${unitPath}.lessons`)) return;
          unit.lessons.forEach((lesson, lessonIndex) => {
            const lessonPath = `${unitPath}.lessons[${lessonIndex}]`;
            if (!isRecord(lesson)) return error(issues, lessonPath, 'lesson-reference-object', 'يجب أن يكون مرجع الدرس كائنًا.');
            addUniqueId(lesson.id, `${lessonPath}.id`);
            validateString(issues, lesson.title, `${lessonPath}.title`);
          });
        });
      });
    });
  }

  return { data: issues.some(({ severity }) => severity === 'error') ? null : value as unknown as Curriculum, issues };
}

export function validateLessonData(value: unknown, expectedId?: string): ValidationResult<LessonContent> {
  const issues: ValidationIssue[] = [];
  if (!isRecord(value)) {
    error(issues, '$', 'object-type', 'يجب أن يكون ملف الدرس كائنًا.');
    return { data: null, issues };
  }
  if (value.schemaVersion !== 1) error(issues, 'schemaVersion', 'schema-version', 'الإصدار المدعوم هو 1.');
  validateId(issues, value.id, 'id');
  if (expectedId && value.id !== expectedId) error(issues, 'id', 'file-id-match', `يجب أن يطابق اسم الملف والمرجع: ${expectedId}.`);

  if (!isRecord(value.explanation)) {
    error(issues, 'explanation', 'explanation-object', 'يجب أن يكون الشرح كائنًا.');
  } else {
    validateString(issues, value.explanation.text, 'explanation.text', { allowEmpty: true });
    if (value.explanation.audio !== null) {
      validateResource(issues, value.explanation.audio, 'explanation.audio', ['direct'], true);
      if (isRecord(value.explanation.audio) && !value.explanation.audio.transcript) {
        warning(issues, 'explanation.audio.transcript', 'audio-transcript', 'لا يوجد transcript للصوت المباشر.');
      }
    }
  }

  if (!isRecord(value.summary)) {
    error(issues, 'summary', 'summary-object', 'يجب أن يكون التلخيص كائنًا.');
  } else {
    validateString(issues, value.summary.text, 'summary.text', { allowEmpty: true });
    if (validateArray(issues, value.summary.resources, 'summary.resources')) {
      value.summary.resources.forEach((resource, index) => {
        const path = `summary.resources[${index}]`;
        validateResource(issues, resource, path, ['image', 'link'], true);
        if (isRecord(resource) && resource.kind === 'image') validateString(issues, resource.alt, `${path}.alt`);
      });
    }
  }

  const lists: Array<[string, string[]]> = [
    ['videos', ['youtube', 'direct', 'link']],
    ['activities', ['link']],
    ['assessments', ['link']],
    ['files', ['link', 'direct']],
  ];
  for (const [field, allowedKinds] of lists) {
    const list = value[field];
    if (!validateArray(issues, list, field)) continue;
    list.forEach((resource, index) => {
      const path = `${field}[${index}]`;
      validateResource(issues, resource, path, allowedKinds, field === 'videos');
      if (field === 'videos' && isRecord(resource)) {
        if (resource.kind === 'youtube' && typeof resource.url === 'string' && !getYouTubeId(resource.url)) {
          error(issues, `${path}.url`, 'youtube-url', 'رابط YouTube لا يحتوي معرّف فيديو صالحًا.');
        }
        if (resource.kind === 'direct' && !resource.captions) {
          warning(issues, `${path}.captions`, 'video-captions', 'لا توجد captions للفيديو المباشر.');
        }
      }
    });
  }

  if (validateArray(issues, value.homework, 'homework')) {
    value.homework.forEach((item, index) => {
      const path = `homework[${index}]`;
      if (!isRecord(item)) return error(issues, path, 'homework-object', 'يجب أن يكون الواجب كائنًا.');
      validateId(issues, item.id, `${path}.id`);
      validateString(issues, item.title, `${path}.title`);
      validateString(issues, item.instructions, `${path}.instructions`);
      if (item.dueDate !== undefined && (typeof item.dueDate !== 'string' || !isValidDate(item.dueDate))) {
        error(issues, `${path}.dueDate`, 'valid-date', 'استخدم تاريخًا حقيقيًا بصيغة YYYY-MM-DD.');
      }
      if (validateArray(issues, item.resources, `${path}.resources`)) {
        item.resources.forEach((resource, resourceIndex) => validateResource(issues, resource, `${path}.resources[${resourceIndex}]`, ['link', 'direct']));
      }
    });
  }

  const ids: Array<[string, unknown]> = [];
  if (isRecord(value.explanation) && isRecord(value.explanation.audio)) ids.push(['explanation.audio.id', value.explanation.audio.id]);
  if (isRecord(value.summary) && Array.isArray(value.summary.resources)) value.summary.resources.forEach((item, index) => ids.push([`summary.resources[${index}].id`, isRecord(item) ? item.id : undefined]));
  for (const field of ['videos', 'activities', 'assessments', 'files']) {
    if (Array.isArray(value[field])) value[field].forEach((item, index) => ids.push([`${field}[${index}].id`, isRecord(item) ? item.id : undefined]));
  }
  if (Array.isArray(value.homework)) value.homework.forEach((item, index) => {
    ids.push([`homework[${index}].id`, isRecord(item) ? item.id : undefined]);
    if (isRecord(item) && Array.isArray(item.resources)) item.resources.forEach((resource, resourceIndex) => ids.push([`homework[${index}].resources[${resourceIndex}].id`, isRecord(resource) ? resource.id : undefined]));
  });
  const seen = new Set<string>();
  for (const [path, id] of ids) {
    if (typeof id === 'string' && seen.has(id)) error(issues, path, 'unique-resource-id', `المعرّف الفرعي ${id} مكرر داخل الدرس.`);
    if (typeof id === 'string') seen.add(id);
  }

  return { data: issues.some(({ severity }) => severity === 'error') ? null : value as unknown as LessonContent, issues };
}
