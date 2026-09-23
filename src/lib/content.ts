import curriculumData from '../data/curriculum.json';
import teacherData from '../data/teacher.json';
import { validateCurriculumData, validateLessonData, validateTeacherData } from '../content/schema';
import type {
  Curriculum,
  CurriculumUnit,
  LessonContent,
  LessonContext,
  LessonReference,
  TeacherProfile,
} from '../types/content';

const fallbackTeacher: TeacherProfile = {
  schemaVersion: 1,
  appName: 'مساحتي التعليمية',
  name: '',
  language: 'ar',
  direction: 'rtl',
  contacts: [],
  theme: {
    primary: '#9A4D0A',
    primaryContrast: '#FFFFFF',
    accent: '#315F24',
    background: '#F8F6F1',
    surface: '#FFFFFF',
    text: '#111111',
    mutedText: '#5F625E',
    border: '#DED9CF',
    focus: '#0B2D5C',
    fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif",
  },
};

export const teacher = validateTeacherData(teacherData).data ?? fallbackTeacher;
export const curriculum = validateCurriculumData(curriculumData).data ?? { schemaVersion: 1, levels: [] } satisfies Curriculum;

const lessonModules = import.meta.glob<{ default: LessonContent }>(
  '../data/lessons/*.json',
);

export type LessonLoadResult =
  | { status: 'ready'; data: LessonContent }
  | { status: 'missing' }
  | { status: 'invalid' }
  | { status: 'error' };

export async function loadLesson(id: string): Promise<LessonLoadResult> {
  const loader = lessonModules[`../data/lessons/${id}.json`];
  if (!loader) return { status: 'missing' };

  try {
    const module = await loader();
    const result = validateLessonData(module.default, id);
    return result.data ? { status: 'ready', data: result.data } : { status: 'invalid' };
  } catch {
    return { status: 'error' };
  }
}

export function findLessonContext(lessonId: string): LessonContext | null {
  for (const level of curriculum.levels) {
    for (const subject of level.subjects) {
      for (const unit of subject.units) {
        const lessonIndex = unit.lessons.findIndex(({ id }) => id === lessonId);
        if (lessonIndex >= 0) {
          return {
            level,
            subject,
            unit,
            lesson: unit.lessons[lessonIndex],
            lessonIndex,
          };
        }
      }
    }
  }

  return null;
}

export function findUnit(
  levelId: string,
  subjectId: string,
  unitId: string,
): { level: Curriculum['levels'][number]; subject: Curriculum['levels'][number]['subjects'][number]; unit: CurriculumUnit } | null {
  const level = curriculum.levels.find(({ id }) => id === levelId);
  const subject = level?.subjects.find(({ id }) => id === subjectId);
  const unit = subject?.units.find(({ id }) => id === unitId);

  return level && subject && unit ? { level, subject, unit } : null;
}

export function unitPath(
  levelId: string,
  subjectId: string,
  unitId: string,
): string {
  return `/curriculum/${levelId}/${subjectId}/${unitId}`;
}

export function getLessonNeighbors(context: LessonContext): {
  previous: LessonReference | null;
  next: LessonReference | null;
} {
  return {
    previous: context.unit.lessons[context.lessonIndex - 1] ?? null,
    next: context.unit.lessons[context.lessonIndex + 1] ?? null,
  };
}
