import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  failed: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error('Application render error', error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <main className="error-boundary" dir="rtl">
        <div className="large-empty-state">
          <h1>حدث خطأ غير متوقع</h1>
          <p>تعذر عرض الصفحة الآن. يمكنك العودة إلى البداية والمحاولة مرة أخرى.</p>
          <a className="primary-button" href="#/">العودة إلى الرئيسية</a>
        </div>
      </main>
    );
  }
}
