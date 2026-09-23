import { describe, expect, it } from 'vitest';
import curriculumData from '../src/data/curriculum.json';
import teacherData from '../src/data/teacher.json';
import { validateCurriculumData, validateLessonData, validateTeacherData, type LessonContent } from '../src/content/schema';
import { findLessonContext, getLessonNeighbors } from '../src/lib/content';

const lessonModules = import.meta.glob<{ default: LessonContent }>('../src/data/lessons/*.json', { eager: true });

describe('تكامل محتوى المشروع', () => {
  it('يفحص المجموعة كاملة والتطابق بين الفهرس والملفات', () => {
    const teacher = validateTeacherData(teacherData);
    const curriculum = validateCurriculumData(curriculumData);
    expect(teacher.data).not.toBeNull();
    expect(curriculum.data).not.toBeNull();

    const referenceIds = curriculum.data?.levels.flatMap((level) =>
      level.subjects.flatMap((subject) => subject.units.flatMap((unit) => unit.lessons.map(({ id }) => id))),
    ) ?? [];
    const fileIds = Object.keys(lessonModules).map((file) => file.match(/([^/]+)\.json$/)?.[1]).filter(Boolean);
    expect(new Set(fileIds)).toEqual(new Set(referenceIds));

    for (const [file, module] of Object.entries(lessonModules)) {
      const id = file.match(/([^/]+)\.json$/)?.[1];
      expect(id).toBeTruthy();
      expect(validateLessonData(module.default, id).data).not.toBeNull();
    }
  });

  it('يعمل التنقل داخل الوحدة عند وجود درس واحد', () => {
    const first = findLessonContext('lesson-01');
    expect(first).not.toBeNull();
    expect(first && getLessonNeighbors(first)).toMatchObject({ previous: null, next: null });
  });
});
