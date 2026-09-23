import { describe, expect, it } from 'vitest';
import teacherData from '../src/data/teacher.json';
import curriculumData from '../src/data/curriculum.json';
import lessonData from '../src/data/lessons/lesson-01.json';
import { contrastRatio, isValidDate, validateCurriculumData, validateLessonData, validateTeacherData } from '../src/content/schema';

describe('عقود البيانات', () => {
  it('تقبل بيانات الهوية والمنهج والدرس الأساسية', () => {
    expect(validateTeacherData(teacherData).data).not.toBeNull();
    expect(validateCurriculumData(curriculumData).data).not.toBeNull();
    expect(validateLessonData(lessonData, 'lesson-01').data).not.toBeNull();
  });

  it('ترفض HTML التنفيذي والمعرّف غير المطابق', () => {
    const invalid = structuredClone(lessonData) as unknown as Record<string, unknown>;
    invalid.id = 'lesson-02';
    invalid.explanation = { text: '<script>alert(1)</script>', audio: null };
    const result = validateLessonData(invalid, 'lesson-01');
    expect(result.data).toBeNull();
    expect(result.issues.map(({ rule }) => rule)).toEqual(expect.arrayContaining(['file-id-match', 'plain-text-only']));
  });

  it('يتحقق من أن التاريخ موجود فعليًا', () => {
    expect(isValidDate('2026-02-28')).toBe(true);
    expect(isValidDate('2026-02-30')).toBe(false);
  });

  it('تلتزم ألوان الهوية بتباين النص الأساسي', () => {
    expect(contrastRatio(teacherData.theme.primary, teacherData.theme.primaryContrast)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(teacherData.theme.background, teacherData.theme.text)).toBeGreaterThanOrEqual(4.5);
  });
});
