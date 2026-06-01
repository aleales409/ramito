import React, {StrictMode, ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  public override render() {
    if (this.state.hasError) {
      return (
        <div style={{
          backgroundColor: '#0c0e0e',
          color: '#ef4444',
          padding: '2rem',
          fontFamily: 'monospace',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'left',
          maxWidth: '600px',
          margin: '0 auto',
          boxSizing: 'border-box'
        }}>
          <h1 style={{ color: '#ffffff', fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>
            ⚠️ Error de Ejecución Detectado
          </h1>
          <p style={{ color: '#bccbb9', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            La aplicación no pudo cargar debido a un error en tiempo de ejecución. Detalle técnico:
          </p>
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '0.75rem',
            padding: '1rem',
            width: '100%',
            overflowX: 'auto',
            marginBottom: '1.5rem',
            fontSize: '0.8rem',
            lineHeight: '1.5',
            boxSizing: 'border-box'
          }}>
            <strong>Mensaje:</strong> {this.state.error?.message || String(this.state.error)}
            <br />
            {this.state.error?.stack && (
              <pre style={{ marginTop: '0.5rem', opacity: 0.7, whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY: 'auto' }}>
                {this.state.error.stack}
              </pre>
            )}
          </div>
          <button 
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#4be277',
              color: '#060807',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Limpiar Memoria y Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
