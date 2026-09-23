import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Icon } from '../components/Icon';
import { curriculum, unitPath } from '../lib/content';

export function CurriculumPage() {
  return (
    <section className="page-section curriculum-page">
      <div className="container">
        <Breadcrumbs items={[{ label: 'الرئيسية', to: '/' }, { label: 'المناهج' }]} />
        <header className="page-heading">
          <p className="section-kicker">مسارك التعليمي</p>
          <h1 id="page-title" tabIndex={-1}>المناهج والدروس</h1>
          <p>اختر الوحدة التي تريد البدء بها، وستجد الدروس مرتبة في مكان واحد.</p>
        </header>

        {curriculum.levels.length === 0 ? (
          <div className="large-empty-state">
            <Icon name="book" />
            <h2>لم تُضف مناهج بعد</h2>
            <p>ستظهر المستويات والوحدات هنا عند إضافتها.</p>
          </div>
        ) : (
          <div className="curriculum-levels">
            {curriculum.levels.map((level) => (
              <section className="level-block" key={level.id}>
                <div className="level-heading">
                  <span className="level-icon"><Icon name="layers" /></span>
                  <div>
                    {level.stage && <p>{level.stage}</p>}
                    <h2>{level.title}</h2>
                  </div>
                </div>
                <div className="subject-list">
                  {level.subjects.map((subject) => (
                    <section className="subject-block" key={subject.id}>
                      <h3>{subject.title}</h3>
                      {subject.units.length ? (
                        <div className="unit-grid">
                          {subject.units.map((unit, unitIndex) => (
                            <Link className="unit-card" key={unit.id} to={unitPath(level.id, subject.id, unit.id)}>
                              <span className="unit-number">{String(unitIndex + 1).padStart(2, '0')}</span>
                              <div>
                                <h4>{unit.title}</h4>
                                {unit.description && <p>{unit.description}</p>}
                                <span className="lesson-count"><Icon name="book" /> {unit.lessons.length} {unit.lessons.length === 1 ? 'درس' : 'دروس'}</span>
                              </div>
                              <span className="card-arrow"><Icon name="arrow-left" /></span>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p className="inline-empty">لم تُضف وحدات لهذه المادة بعد.</p>
                      )}
                    </section>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
