import React from 'react';

class ImprovedErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error for debugging
    console.error('🚨 Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
          borderRadius: '12px',
          border: '2px solid #ff4444',
          margin: '1rem',
          color: '#fff'
        }}>
          <h2 style={{ color: '#ff6666', marginBottom: '1rem' }}>
            🦄 Oops! Something went wrong
          </h2>
          
          <div style={{
            background: 'rgba(255, 68, 68, 0.1)',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.9rem',
            color: '#ffaaaa'
          }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </div>

          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button 
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
              }}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#00ff99',
                color: '#000',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#00cc77';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#00ff99';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              🔄 Try Again
            </button>
            
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#333',
                color: '#fff',
                border: '1px solid #555',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#444';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#333';
              }}
            >
              🔃 Refresh Page
            </button>
          </div>

          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '8px',
            fontSize: '0.8rem',
            color: '#888'
          }}>
            💡 <strong>Tip:</strong> Try refreshing the page or checking your internet connection.
            <br />
            If the problem persists, the issue might be temporary.
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details style={{
              marginTop: '1rem',
              textAlign: 'left',
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '1rem',
              borderRadius: '6px'
            }}>
              <summary style={{ cursor: 'pointer', color: '#ff9999' }}>
                🔍 Development Details
              </summary>
              <pre style={{
                marginTop: '1rem',
                fontSize: '0.7rem',
                color: '#ccc',
                overflow: 'auto',
                maxHeight: '200px'
              }}>
                {this.state.error && this.state.error.toString()}
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ImprovedErrorBoundary;