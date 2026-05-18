import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Always log so the next dispute has a stack trace in the browser console.
    // Replace with a remote logger later if needed.
    console.error('[ErrorBoundary] caught', error, info);
    this.setState({ info });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const isDev = import.meta?.env?.MODE === 'development';

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-lg w-full bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 text-center mb-2">Something went wrong</h1>
          <p className="text-sm text-gray-600 text-center mb-6">
            The page hit an unexpected error. Your work up to this point has been saved on the
            server — reload to continue.
          </p>

          {this.state.error?.message && (
            <div className="bg-gray-50 border border-gray-200 rounded p-3 text-xs text-gray-700 font-mono mb-6 break-all">
              {this.state.error.message}
            </div>
          )}

          <div className="flex items-center justify-center gap-2">
            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              <RefreshCw className="w-4 h-4" /> Reload
            </button>
            <a
              href="/dashboard"
              className="inline-flex items-center gap-1 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Home className="w-4 h-4" /> Dashboard
            </a>
          </div>

          {isDev && this.state.error?.stack && (
            <details className="mt-6 text-xs text-gray-500">
              <summary className="cursor-pointer">Developer stack trace</summary>
              <pre className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded overflow-auto whitespace-pre-wrap">
                {this.state.error.stack}
              </pre>
              {this.state.info?.componentStack && (
                <pre className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded overflow-auto whitespace-pre-wrap">
                  {this.state.info.componentStack}
                </pre>
              )}
            </details>
          )}
        </div>
      </div>
    );
  }
}
