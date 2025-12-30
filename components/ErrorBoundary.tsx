import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full border border-red-100">
                        <h1 className="text-2xl font-black text-red-600 mb-4">Something went wrong.</h1>
                        <p className="text-slate-600 mb-6">We're sorry, an unexpected error occurred while rendering this page.</p>

                        <div className="bg-slate-900 text-slate-50 p-4 rounded-xl overflow-auto text-xs font-mono mb-6">
                            <p className="font-bold text-red-400 mb-2">{this.state.error?.toString()}</p>
                            <pre>{this.state.errorInfo?.componentStack}</pre>
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                        >
                            Reload Page
                        </button>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="ml-4 text-slate-500 font-bold hover:text-slate-900"
                        >
                            Go Home
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
