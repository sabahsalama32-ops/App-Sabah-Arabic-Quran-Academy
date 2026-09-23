import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateCurriculumData, validateLessonData, validateTeacherData, type ValidationIssue } from '../src/content/schema';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'src', 'data');
const lessonsDir = path.join(dataDir, 'lessons');
const errors: string[] = [];
const warnings: string[] = [];

function report(file: string, issue: ValidationIssue) {
  const line = `${path.relative(root, file)} :: ${issue.path} :: ${issue.rule} — ${issue.message}`;
  (issue.severity === 'error' ? errors : warnings).push(line);
}

function readJson(file: string): unknown {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : String(caught);
    errors.push(`${path.relative(root, file)} :: $ :: valid-json — JSON غير صالح: ${message}`);
    return null;
  }
}

const teacherFile = path.join(dataDir, 'teacher.json');
const curriculumFile = path.join(dataDir, 'curriculum.json');
validateTeacherData(readJson(teacherFile)).issues.forEach((issue) => report(teacherFile, issue));

const curriculumResult = validateCurriculumData(readJson(curriculumFile));
curriculumResult.issues.forEach((issue) => report(curriculumFile, issue));

const lessonRefs = new Map<string, string>();
curriculumResult.data?.levels.forEach((level, levelIndex) => {
  level.subjects.forEach((subject, subjectIndex) => {
    subject.units.forEach((unit, unitIndex) => {
      unit.lessons.forEach((lesson, lessonIndex) => {
        lessonRefs.set(lesson.id, `levels[${levelIndex}].subjects[${subjectIndex}].units[${unitIndex}].lessons[${lessonIndex}]`);
      });
    });
  });
});

const lessonFiles = fs.existsSync(lessonsDir)
  ? fs.readdirSync(lessonsDir).filter((name) => name.endsWith('.json')).sort()
  : [];
const fileIds = new Set(lessonFiles.map((name) => path.basename(name, '.json')));

for (const [id, field] of lessonRefs) {
  if (!fileIds.has(id)) errors.push(`${path.relative(root, curriculumFile)} :: ${field}.id :: lesson-file-reference — لا يوجد ملف lessons/${id}.json`);
}

for (const fileName of lessonFiles) {
  const id = path.basename(fileName, '.json');
  const file = path.join(lessonsDir, fileName);
  if (!lessonRefs.has(id)) errors.push(`${path.relative(root, file)} :: id :: orphan-lesson-file — ملف الدرس غير مرتبط في curriculum.json`);
  validateLessonData(readJson(file), id).issues.forEach((issue) => report(file, issue));
}

if (warnings.length) {
  console.warn(`تحذيرات المحتوى (${warnings.length}):`);
  warnings.forEach((item) => console.warn(`- ${item}`));
}

if (errors.length) {
  console.error(`فشل فحص المحتوى (${errors.length}):`);
  errors.forEach((item) => console.error(`- ${item}`));
  process.exit(1);
}

console.log(`نجح فحص المحتوى: ${lessonRefs.size} درس، ${lessonFiles.length} ملف درس، دون أخطاء.`);
