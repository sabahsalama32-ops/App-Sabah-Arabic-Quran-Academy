import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Icon } from '../components/Icon';
import { LessonAccordion } from '../components/LessonAccordion';
import { findLessonContext, getLessonNeighbors, loadLesson, unitPath, type LessonLoadResult } from '../lib/content';
import { NotFoundPage } from './NotFoundPage';

export function LessonPage() {
  const { lessonId = '' } = useParams();
  const context = findLessonContext(lessonId);
  const [loadResult, setLoadResult] = useState<LessonLoadResult | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoadResult(null);
    loadLesson(lessonId)
      .then((loaded) => {
        if (active) setLoadResult(loaded);
      });
    return () => { active = false; };
  }, [lessonId, attempt]);

  if (!context) return <NotFoundPage />;

  const { level, subject, unit, lesson: lessonReference, lessonIndex } = context;
  const backToUnit = unitPath(level.id, subject.id, unit.id);
  const { previous, next } = getLessonNeighbors(context);

  return (
    <section className="page-section lesson-page">
      <div className="container narrow-container">
        <Breadcrumbs items={[
          { label: 'الرئيسية', to: '/' },
          { label: 'المناهج', to: '/curriculum' },
          { label: level.title, to: '/curriculum' },
          { label: subject.title, to: '/curriculum' },
          { label: unit.title, to: backToUnit },
          { label: lessonReference.title },
        ]} />

        <header className="lesson-header">
          <div>
            <p className="section-kicker">الدرس {lessonIndex + 1} من {unit.lessons.length}</p>
            <h1 id="page-title" tabIndex={-1}>{lessonReference.title}</h1>
            <p>{level.title} · {subject.title} · {unit.title}</p>
          </div>
          <Link className="back-link" to={backToUnit}>
            <Icon name="layers" /> العودة إلى الوحدة
          </Link>
        </header>

        {!loadResult ? (
          <div aria-live="polite" className="lesson-loading">
            <span />
            <p>جارٍ فتح الدرس…</p>
          </div>
        ) : loadResult.status === 'ready' ? (
          <LessonAccordion key={loadResult.data.id} lesson={loadResult.data} />
        ) : loadResult.status === 'invalid' ? (
          <div aria-live="polite" className="large-empty-state lesson-error">
            <Icon name="file" />
            <h2>محتوى الدرس غير صالح حاليًا</h2>
            <p>راجع بيانات هذا الدرس أو عُد إلى الوحدة لاختيار درس آخر.</p>
            <Link className="text-link" to={backToUnit}>العودة إلى الوحدة</Link>
          </div>
        ) : loadResult.status === 'error' ? (
          <div aria-live="polite" className="large-empty-state lesson-error">
            <Icon name="file" />
            <h2>تعذر تحميل محتوى الدرس</h2>
            <p>حدث عطل مؤقت أثناء فتح الملف.</p>
            <button className="secondary-button" onClick={() => setAttempt((value) => value + 1)} type="button">أعد المحاولة</button>
          </div>
        ) : (
          <div className="large-empty-state">
            <Icon name="file" />
            <h2>تعذر العثور على محتوى هذا الدرس</h2>
            <Link className="text-link" to={backToUnit}>العودة إلى الوحدة</Link>
          </div>
        )}

        <nav aria-label="التنقل بين الدروس" className="lesson-pagination">
          {previous ? (
            <Link className="pagination-link pagination-link--previous" to={`/lessons/${previous.id}`}>
              <Icon name="arrow-right" />
              <span><small>الدرس السابق</small><strong>{previous.title}</strong></span>
            </Link>
          ) : <span />}
          {next && (
            <Link className="pagination-link pagination-link--next" to={`/lessons/${next.id}`}>
              <span><small>الدرس التالي</small><strong>{next.title}</strong></span>
              <Icon name="arrow-left" />
            </Link>
          )}
        </nav>
      </div>
    </section>
  );
}
