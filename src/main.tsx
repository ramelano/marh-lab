import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

type ErrorBoundaryState = {
  error: Error | null;
  componentStack: string;
};

function toError(value: unknown, fallback: string): Error {
  if (value instanceof Error) return value;
  if (typeof value === "string") return new Error(value);
  if (value && typeof value === "object") {
    try { const detail = value as any; const message = detail.message || detail.error_description || detail.error || JSON.stringify(detail); return new Error(message === "[object Object]" ? fallback : String(message)); } catch { return new Error(fallback); }
  }
  return new Error(fallback);
}

class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null, componentStack: "" };

  static getDerivedStateFromError(error: unknown): Partial<ErrorBoundaryState> {
    return { error: toError(error, "Bilinmeyen React render hatası") };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Uygulama render hatası:", error, info.componentStack);
    this.setState({ componentStack: info.componentStack || "" });
  }

  private handleWindowError = (event: ErrorEvent) => {
    this.setState((current) => current.error ? null : {
      error: toError(event.error || event.message, "Beklenmeyen JavaScript hatası"),
    });
  };

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    this.setState((current) => current.error ? null : {
      error: toError(event.reason, "İşlem tamamlanamadı (unhandled promise rejection)"),
    });
  };

  componentDidMount() {
    window.addEventListener("error", this.handleWindowError);
    window.addEventListener("unhandledrejection", this.handleUnhandledRejection);
  }

  componentWillUnmount() {
    window.removeEventListener("error", this.handleWindowError);
    window.removeEventListener("unhandledrejection", this.handleUnhandledRejection);
  }

  render() {
    if (this.state.error) {
      const error = this.state.error;
      return (
        <main role="alert" aria-live="assertive" style={{ minHeight: "100vh", background: "#070b14", color: "#f8fafc", padding: "24px", fontFamily: "system-ui, sans-serif" }}>
          <section style={{ maxWidth: 900, margin: "8vh auto", border: "1px solid #f59e0b", borderRadius: 16, background: "#111827", padding: 24, boxShadow: "0 20px 60px #0008" }}>
            <h1 style={{ margin: "0 0 12px", color: "#fbbf24", fontSize: 22 }}>MARH-LAB görüntülenirken bir hata oluştu</h1>
            <p style={{ margin: "0 0 16px", color: "#cbd5e1" }}>Hata gizlenmedi. Sayfayı yeniden yükleyebilir veya hata ayrıntılarını destek ekibinizle paylaşabilirsiniz.</p>
            <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", maxHeight: "35vh", overflow: "auto", borderRadius: 10, background: "#020617", padding: 16, color: "#fecaca", fontSize: 13 }}>
              {error.name}: {error.message}{error.stack ? `\n\n${error.stack}` : ""}
            </pre>
            {this.state.componentStack && (
              <details style={{ marginTop: 12, color: "#cbd5e1" }}>
                <summary style={{ cursor: "pointer" }}>React bileşen izini göster</summary>
                <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", maxHeight: "20vh", overflow: "auto", fontSize: 12 }}>{this.state.componentStack}</pre>
              </details>
            )}
            <button type="button" onClick={() => window.location.reload()} style={{ marginTop: 18, border: 0, borderRadius: 10, padding: "11px 16px", background: "#f59e0b", color: "#111827", fontWeight: 700, cursor: "pointer" }}>
              Sayfayı yeniden yükle
            </button>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
  );
} else {
  const errorBox = document.createElement("section");
  errorBox.setAttribute("role", "alert");
  errorBox.setAttribute("aria-live", "assertive");
  errorBox.style.cssText = "margin:24px;padding:24px;border:1px solid #f59e0b;border-radius:16px;background:#111827;color:#f8fafc;font:16px system-ui,sans-serif";
  errorBox.innerHTML = "<h1 style='color:#fbbf24'>MARH-LAB başlatılamadı</h1><p>HTML içinde uygulamanın <code>#root</code> kök elemanı bulunamadı. Sayfayı yenileyin; sorun sürerse destek ekibinize bildirin.</p>";
  document.body.appendChild(errorBox);
}
