import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    message: "",
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message,
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Montanha de Aco UI crash", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-[#08090d] px-6 text-brass-50">
          <div className="w-full max-w-2xl rounded-[2rem] border border-red-400/20 bg-black/40 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
            <p className="text-[11px] uppercase tracking-[0.4em] text-red-200/60">Falha de Runtime</p>
            <h1 className="mt-3 font-display text-4xl">A interface quebrou durante a renderizacao.</h1>
            <p className="mt-4 text-sm leading-relaxed text-brass-100/72">Abra o Console do navegador para ver o erro completo.</p>
            <pre className="mt-6 overflow-x-auto rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-4 text-sm text-red-200/85">
              {this.state.message}
            </pre>
            <button type="button" onClick={() => window.location.reload()} className="mt-6 rounded-[1.2rem] border border-brass-100/20 bg-white/5 px-5 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-brass-50">
              Recarregar
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}