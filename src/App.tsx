import { lazy, Suspense } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CurriculumPage } from './pages/CurriculumPage';
import { HomePage } from './pages/HomePage';
import { LearningProfilePage } from './pages/LearningProfilePage';
import { LessonPage } from './pages/LessonPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { UnitPage } from './pages/UnitPage';

const BoardPage = lazy(() =>
  import('./pages/BoardPage').then((module) => ({ default: module.BoardPage })),
);

export default function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <AppShell>
          <Routes>
            <Route element={<HomePage />} path="/" />
            <Route element={<LearningProfilePage />} path="/learning-profile" />
            <Route element={<CurriculumPage />} path="/curriculum" />
            <Route element={<UnitPage />} path="/curriculum/:levelId/:subjectId/:unitId" />
            <Route element={<LessonPage />} path="/lessons/:lessonId" />
            <Route
              element={(
                <Suspense fallback={<div className="board-loading" role="status">جارٍ تجهيز السبورة التعليمية…</div>}>
                  <BoardPage />
                </Suspense>
              )}
              path="/board"
            />
            <Route element={<NotFoundPage />} path="*" />
          </Routes>
        </AppShell>
      </HashRouter>
    </ErrorBoundary>
  );
}
