import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Campus Study Hub caught an error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF4E5] flex items-center justify-center p-4 font-sans text-charcoal">
          <div className="max-w-md w-full bg-warm-white border border-[#E8D9B8] rounded-2xl p-6 shadow-xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-bloodstone/10 text-bloodstone flex items-center justify-center mx-auto mb-4 font-serif text-2xl font-bold">
              UGI
            </div>
            <h1 className="text-xl font-serif font-bold text-bloodstone mb-2">
              Campus Study Hub
            </h1>
            <p className="text-xs text-charcoal/80 mb-4">
              We encountered a display issue while initializing the page view.
            </p>
            {this.state.error && (
              <div className="bg-[#FAF4E5] border border-[#E8D9B8] rounded-xl p-3 text-left font-mono text-[11px] text-bloodstone overflow-x-auto max-h-32 mb-4">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full py-2.5 bg-bloodstone text-warm-white text-xs font-semibold rounded-xl hover:bg-bloodstone-hover transition-colors cursor-pointer"
              >
                Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full py-2.5 bg-[#FAF4E5] border border-[#E8D9B8] text-xs font-semibold text-charcoal hover:bg-vanilla/40 rounded-xl transition-colors cursor-pointer"
              >
                Reset Local Storage & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
