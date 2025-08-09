import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0 
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
    
    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Optional: Send error to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // You could integrate with Sentry or similar here
      // Sentry.captureException(error, { extra: errorInfo })
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }))
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback, showDetails = false } = this.props
      
      // Use custom fallback if provided
      if (Fallback) {
        return <Fallback 
          error={this.state.error} 
          retry={this.handleRetry}
          reload={this.handleReload}
        />
      }

      // Default error UI
      return (
        <div style={{
          padding: '20px',
          margin: '20px',
          border: '2px solid var(--accent, #ff6b6b)',
          borderRadius: '8px',
          backgroundColor: 'rgba(255, 107, 107, 0.1)',
          color: 'var(--text, #fff)',
          textAlign: 'center',
          fontFamily: 'monospace'
        }}>
          <h2>🚫 Something went wrong!</h2>
          <p>Your virtual pet encountered an unexpected error.</p>
          
          <div style={{ marginTop: '16px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button 
              onClick={this.handleRetry}
              style={{
                padding: '8px 16px',
                backgroundColor: 'var(--accent, #00ff99)',
                color: 'var(--bg, #000)',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              Try Again
            </button>
            
            <button 
              onClick={this.handleReload}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: 'var(--accent, #00ff99)',
                border: '1px solid var(--accent, #00ff99)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              Reload Page
            </button>
          </div>

          {showDetails && this.state.error && (
            <details style={{ marginTop: '20px', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', color: 'var(--accent, #00ff99)' }}>
                Error Details (for debugging)
              </summary>
              <pre style={{
                fontSize: '12px',
                overflow: 'auto',
                padding: '10px',
                backgroundColor: 'rgba(0,0,0,0.2)',
                marginTop: '8px',
                borderRadius: '4px'
              }}>
                {this.state.error.toString()}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
          
          {this.state.retryCount > 2 && (
            <p style={{ marginTop: '16px', fontSize: '14px', opacity: 0.8 }}>
              Multiple errors detected. Consider refreshing the page.
            </p>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

// Functional error boundary fallback components
export const PetCanvasErrorFallback = ({ error, retry }) => (
  <div style={{
    width: '100%',
    height: '400px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px dashed var(--accent, #00ff99)',
    borderRadius: '8px',
    color: 'var(--text, #fff)',
    textAlign: 'center'
  }}>
    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🐾</div>
    <p>Pet canvas failed to load</p>
    <button 
      onClick={retry}
      style={{
        marginTop: '12px',
        padding: '8px 16px',
        backgroundColor: 'var(--accent, #00ff99)',
        color: 'var(--bg, #000)',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      Retry
    </button>
  </div>
)

export const ChatErrorFallback = ({ error, retry }) => (
  <div style={{
    padding: '16px',
    border: '1px solid var(--accent, #00ff99)',
    borderRadius: '4px',
    color: 'var(--text, #fff)',
    textAlign: 'center'
  }}>
    <p>💬 Chat temporarily unavailable</p>
    <button 
      onClick={retry}
      style={{
        marginTop: '8px',
        padding: '6px 12px',
        backgroundColor: 'transparent',
        color: 'var(--accent, #00ff99)',
        border: '1px solid var(--accent, #00ff99)',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px'
      }}
    >
      Retry Chat
    </button>
  </div>
)

export default ErrorBoundary