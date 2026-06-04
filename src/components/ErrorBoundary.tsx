import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Trash2, ShieldCheck, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    console.error("Uncaught runtime exception caught by Apex Diagnostics:", error, errorInfo);
  }

  private handleResetAndReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error(e);
    }
    window.location.reload();
  };

  private handleReloadOnly = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col justify-between p-4 md:p-8" id="apex-recovery-dashboard">
          {/* Decorative background grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
          
          {/* Header */}
          <header className="max-w-7xl mx-auto w-full flex items-center justify-between border-b border-zinc-900 pb-4 mb-8 z-10">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gradient-to-tr from-red-500 to-red-700 flex items-center justify-center rounded">
                <span className="font-display font-medium text-black">!</span>
              </div>
              <div>
                <span className="font-display font-medium text-white tracking-widest text-sm">APEX</span>
                <span className="font-display font-light text-zinc-500 tracking-widest text-[9px] block -mt-1 font-bold uppercase">DIAGNOSTICS</span>
              </div>
            </div>
            <span className="font-mono text-[9px] text-zinc-500 tracking-widest uppercase">SYS_CRASH_RECOVERY</span>
          </header>

          {/* Main Error Content */}
          <main className="max-w-2xl mx-auto w-full bg-zinc-900/40 border border-zinc-900 rounded-xl p-6 md:p-8 space-y-6 shadow-2xl my-auto z-10">
            <div className="flex items-center space-x-4 border-b border-zinc-900 pb-4">
              <div className="h-12 w-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-500 animate-pulse" />
              </div>
              <div>
                <span className="font-mono text-[9px] tracking-widest text-amber-500 uppercase font-semibold">Variance Detected</span>
                <h2 className="font-display text-xl md:text-2xl font-light text-white tracking-wide">TELEMETRY SHIELD DISCONNECTED</h2>
              </div>
            </div>

            <p className="text-zinc-400 text-xs md:text-sm font-sans leading-relaxed font-light">
              An unhandled runtime error blocked the main application thread. The Apex Motors automated diagnostic shield successfully contained the exception to secure memory frames.
            </p>

            {/* Diagnostic Logs Container */}
            <div className="bg-zinc-950/80 border border-zinc-900 rounded p-4 font-mono text-[10px] text-red-400 space-y-2 overflow-x-auto max-h-48 selection:bg-red-500 selection:text-white">
              <div className="text-zinc-500 border-b border-zinc-900 pb-1.5 uppercase font-semibold flex justify-between">
                <span>[ RAW DIAGNOSTIC STRING ]</span>
                <span className="text-red-500/80">FAULT_CODE_500</span>
              </div>
              <div className="font-bold">{this.state.error && this.state.error.toString()}</div>
              {this.state.error?.stack && (
                <pre className="text-zinc-600 leading-normal text-[9px] whitespace-pre-wrap mt-2 overflow-y-auto max-h-24">
                  {this.state.error.stack}
                </pre>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={this.handleReloadOnly}
                className="bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-display font-medium tracking-wider py-3 px-4 rounded text-xs uppercase border border-zinc-850 flex items-center justify-center space-x-2 transition duration-200 cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reload Application</span>
              </button>

              <button
                onClick={this.handleResetAndReload}
                className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-display font-semibold tracking-wider py-3 px-4 rounded text-xs uppercase flex items-center justify-center space-x-2 transition duration-200 cursor-pointer"
              >
                <Trash2 className="h-4 w-4 text-zinc-950" />
                <span>Clear Cache & Restart</span>
              </button>
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t border-zinc-900 py-6 text-center text-zinc-500 font-mono text-[9px] uppercase tracking-widest mt-8 w-full z-10">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span>© {new Date().getFullYear()} APEX MOTORSPORTS INTERNATIONAL GROUP. AUTOMATION ESCAPE SAFE.</span>
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>DIAGNOSTIC FRAME STABILIZED</span>
                </span>
              </div>
            </div>
          </footer>
        </div>
      );
    }

    return this.props.children;
  }
}
