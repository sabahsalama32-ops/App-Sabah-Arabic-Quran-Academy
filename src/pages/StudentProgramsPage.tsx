import { Link } from 'react-router-dom';
import programs from '../data/student-programs.json';

export function StudentProgramsPage() {
  const program = programs.program;
  return (
    <section className="page-section">
      <div className="container narrow-container">
        <header className="page-heading">
          <p className="section-kicker">{program.badge}</p>
          <h1 id="page-title" tabIndex={-1}>{programs.pageTitle}</h1>
          <p>{programs.pageDescription}</p>
        </header>
        <article className="feature-entry-card">
          <div>
            <h2>{program.title}</h2>
            {program.description.map((text) => <p key={text}>{text}</p>)}
            <ul>{program.benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}</ul>
          </div>
        </article>
        <div style={{marginTop:'1.5rem'}}>
          <Link className="primary-button" to="/curriculum">استكشف المناهج</Link>
        </div>
      </div>
    </section>
  );
}
