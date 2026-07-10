import { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';

/**
 * App-wide error boundary for the officer portal. Catches render/runtime errors and shows a
 * recoverable fallback instead of a blank screen.
 */
class ErrorBoundaryBase extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Uncaught UI error', error, info);
  }

  render() {
    const { t, children } = this.props;
    if (!this.state.hasError) return children;
    return (
      <div
        role="alert"
        className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center"
      >
        <AlertTriangle className="h-12 w-12 text-destructive" aria-hidden="true" />
        <h1 className="text-xl font-bold text-foreground">{t('error.boundaryTitle')}</h1>
        <p className="max-w-sm text-sm text-muted-foreground">{t('error.boundaryBody')}</p>
        <button
          type="button"
          onClick={() => window.location.assign('/')}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t('error.reload')}
        </button>
      </div>
    );
  }
}

export const ErrorBoundary = withTranslation()(ErrorBoundaryBase);
