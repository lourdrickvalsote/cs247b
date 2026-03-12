import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import Button from './ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-alice dark:bg-jet-950 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-lilac-100 dark:bg-lilac-950 rounded-2xl flex items-center justify-center mb-6">
            <span className="text-2xl">!</span>
          </div>
          <h1 className="text-xl font-bold text-jet mb-2">Something went wrong</h1>
          <p className="text-jet-400 mb-6 max-w-sm">
            An unexpected error occurred. Try refreshing to get back on track.
          </p>
          <div className="flex gap-3">
            <Button variant="primary" onClick={this.handleReset}>
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
          {import.meta.env.DEV && this.state.error && (
            <pre className="mt-6 p-4 bg-jet-50 rounded-xl text-left text-xs text-jet-600 max-w-lg overflow-auto max-h-40">
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
