import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';

export function NotFoundPage() {
  return (
    <section className="not-found-page">
      <div className="container not-found-card">
        <span className="not-found-code">404</span>
        <Icon name="map" />
        <h1 id="page-title" tabIndex={-1}>هذا المسار غير موجود</h1>
        <p>ربما تغيّر الرابط أو لم يعد المحتوى متاحًا بهذا المعرّف.</p>
        <Link className="primary-button" to="/curriculum">
          انتقل إلى المناهج <Icon name="arrow-left" />
        </Link>
      </div>
    </section>
  );
}
