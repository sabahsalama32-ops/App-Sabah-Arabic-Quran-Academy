import { useMemo, useState, type ReactNode } from 'react';
import { getLessonAssistantGuide, getLessonHomeworkAssessment } from '../data/lesson-support';
import { isSafeContentUrl } from '../lib/urls';
import { uiCopy } from '../lib/ui-copy';
import type { LessonContent, Resource } from '../types/content';
import { BookletViewer } from './BookletViewer';
import { GuidedLessonAssistant } from './GuidedLessonAssistant';
import { Icon, type IconName } from './Icon';
import { HomeworkList, ResourceList, SummaryResources, VideoResources } from './ResourceList';

type SectionId = keyof typeof uiCopy.lessonSections;

interface SectionDefinition {
  id: SectionId;
  icon: IconName;
  count: number;
  content: ReactNode;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon"><Icon name="sparkle" /></span>
      <p>{message}</p>
    </div>
  );
}

function normalizedFormat(resource: Resource): string {
  return (resource.format ?? '').trim().toLowerCase();
}

function isBooklet(resource: Resource): boolean {
  const format = normalizedFormat(resource);
  return format.includes('booklet') || format.includes('بوكليت');
}

function isPresentation(resource: Resource): boolean {
  const format = normalizedFormat(resource);
  return [
    'presentation',
    'powerpoint',
    'ppt',
    'pptx',
    'بوربوينت',
    'بوربينت',
    'عرض تقديمي',
  ].some((keyword) => format.includes(keyword));
}

export function LessonAccordion({ lesson }: { lesson: LessonContent }) {
  const sections = useMemo<SectionDefinition[]>(() => {
    const explanationCount = Number(Boolean(lesson.explanation.text.trim())) + Number(Boolean(lesson.explanation.audio));
    const summaryCount = Number(Boolean(lesson.summary.text.trim())) + lesson.summary.resources.length;
    const bookletFiles = lesson.files.filter(isBooklet);
    const presentationFiles = lesson.files.filter(isPresentation);
    const assistantGuide = getLessonAssistantGuide(lesson.id);
    const generatedHomework = getLessonHomeworkAssessment(lesson.id);
    const homeworkItems = generatedHomework && !lesson.homework.some(({ id }) => id === generatedHomework.id)
      ? [...lesson.homework, generatedHomework]
      : lesson.homework;

    return [
      {
        id: 'explanation',
        icon: 'book',
        count: explanationCount,
        content: explanationCount ? (
          <div className="section-stack">
            {lesson.explanation.text.trim() && <p className="preserve-lines lesson-text">{lesson.explanation.text}</p>}
            {lesson.explanation.audio && isSafeContentUrl(lesson.explanation.audio.url) && (
              <div className="audio-card">
                <strong>{lesson.explanation.audio.title}</strong>
                <audio controls preload="metadata" src={lesson.explanation.audio.url}>
                  متصفحك لا يدعم تشغيل الصوت.
                </audio>
                {lesson.explanation.audio.transcript && (
                  <div className="media-transcript">
                    <h3>النص المكتوب للصوت</h3>
                    <p className="preserve-lines">{lesson.explanation.audio.transcript}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : <EmptyState message={uiCopy.empty.explanation} />,
      },
      {
        id: 'summary',
        icon: 'map',
        count: summaryCount,
        content: summaryCount ? (
          <div className="section-stack">
            {lesson.summary.text.trim() && <p className="preserve-lines lesson-text">{lesson.summary.text}</p>}
            <SummaryResources resources={lesson.summary.resources} />
          </div>
        ) : <EmptyState message={uiCopy.empty.summary} />,
      },
      {
        id: 'videos',
        icon: 'video',
        count: lesson.videos.length,
        content: lesson.videos.length ? <VideoResources resources={lesson.videos} /> : <EmptyState message={uiCopy.empty.videos} />,
      },
      {
        id: 'activities',
        icon: 'game',
        count: lesson.activities.length,
        content: lesson.activities.length ? <ResourceList action="افتح النشاط" resources={lesson.activities} /> : <EmptyState message={uiCopy.empty.activities} />,
      },
      {
        id: 'assessments',
        icon: 'brain',
        count: lesson.assessments.length,
        content: lesson.assessments.length ? <ResourceList action="ابدأ التقويم" resources={lesson.assessments} /> : <EmptyState message={uiCopy.empty.assessments} />,
      },
      {
        id: 'booklet',
        icon: 'book',
        count: bookletFiles.length,
        content: bookletFiles.length ? <BookletViewer resources={bookletFiles} /> : <EmptyState message={uiCopy.empty.booklet} />,
      },
      {
        id: 'presentation',
        icon: 'file',
        count: presentationFiles.length,
        content: presentationFiles.length ? <ResourceList action="افتح العرض التقديمي" resources={presentationFiles} /> : <EmptyState message={uiCopy.empty.presentation} />,
      },
      {
        id: 'assistant',
        icon: 'message',
        count: assistantGuide ? 4 : 0,
        content: assistantGuide ? <GuidedLessonAssistant guide={assistantGuide} /> : <EmptyState message={uiCopy.empty.assistant} />,
      },
      {
        id: 'homework',
        icon: 'clipboard',
        count: homeworkItems.length,
        content: homeworkItems.length ? <HomeworkList items={homeworkItems} /> : <EmptyState message={uiCopy.empty.homework} />,
      },
    ];
  }, [lesson]);

  const firstWithContent = sections.find(({ count }) => count > 0)?.id ?? 'explanation';
  const [openSection, setOpenSection] = useState<SectionId>(firstWithContent);

  return (
    <div className="lesson-accordion">
      {sections.map((section) => {
        const open = openSection === section.id;
        const headingId = `section-heading-${section.id}`;
        const panelId = `section-panel-${section.id}`;

        return (
          <section className={`accordion-item${open ? ' is-open' : ''}`} key={section.id}>
            <h2 id={headingId}>
              <button
                aria-controls={panelId}
                aria-expanded={open}
                className="accordion-trigger"
                onClick={() => setOpenSection(section.id)}
                type="button"
              >
                <span className="accordion-title">
                  <span className="accordion-icon"><Icon name={section.icon} /></span>
                  <span>{uiCopy.lessonSections[section.id]}</span>
                </span>
                <span className="accordion-meta">
                  {section.count > 0 && <span className="resource-count">{section.count}</span>}
                  <Icon className="accordion-chevron" name="chevron" />
                </span>
              </button>
            </h2>
            {open && (
              <div aria-labelledby={headingId} className="accordion-panel" id={panelId} role="region">
                {section.content}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
