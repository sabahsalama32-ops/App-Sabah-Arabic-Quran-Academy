import { Link, useParams } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Icon } from '../components/Icon';
import { findUnit } from '../lib/content';
import { NotFoundPage } from './NotFoundPage';

export function UnitPage() {
  const { levelId = '', subjectId = '', unitId = '' } = useParams();
  const context = findUnit(levelId, subjectId, unitId);

  if (!context) return <NotFoundPage />;

  const { level, subject, unit } = context;

  return (
    <section className="page-section unit-page">
      <div className="container narrow-container">
        <Breadcrumbs items={[
          { label: 'الرئيسية', to: '/' },
          { label: 'المناهج', to: '/curriculum' },
          { label: level.title, to: '/curriculum' },
          { label: subject.title, to: '/curriculum' },
          { label: unit.title },
        ]} />
        <header className="page-heading unit-heading">
          <p className="section-kicker">{level.title} · {subject.title}</p>
          <h1 id="page-title" tabIndex={-1}>{unit.title}</h1>
          {unit.description && <p>{unit.description}</p>}
        </header>

        {unit.lessons.length ? (
          <div className="lesson-list">
            {unit.lessons.map((lesson, index) => (
              <Link className="lesson-card" key={lesson.id} to={`/lessons/${lesson.id}`}>
                <span className="lesson-card__number">{index + 1}</span>
                <span className="lesson-card__content">
                  <small>الدرس {index + 1}</small>
                  <strong>{lesson.title}</strong>
                </span>
                <span className="lesson-card__action">افتح الدرس <Icon name="arrow-left" /></span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="large-empty-state">
            <Icon name="book" />
            <h2>لم تُضف دروس لهذه الوحدة بعد</h2>
            <Link className="text-link" to="/curriculum">العودة إلى المناهج</Link>
          </div>
        )}
      </div>
    </section>
  );
}
