import React from 'react'

const LoadingSpinner = ({ size = 'medium', message, inline = false }) => {
  const sizeMap = {
    small: '16px',
    medium: '32px',
    large: '48px'
  }

  const spinnerSize = sizeMap[size] || sizeMap.medium

  const spinnerStyle = {
    width: spinnerSize,
    height: spinnerSize,
    border: '2px solid transparent',
    borderTop: '2px solid var(--accent, #00ff99)',
    borderRight: '2px solid var(--accent, #00ff99)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  }

  const containerStyle = {
    display: inline ? 'inline-flex' : 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: inline ? '4px' : '16px'
  }

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={containerStyle}>
        <div style={spinnerStyle} />
        {message && (
          <span style={{
            fontSize: inline ? '12px' : '14px',
            color: 'var(--text, #fff)',
            fontFamily: 'inherit'
          }}>
            {message}
          </span>
        )}
      </div>
    </>
  )
}

export default LoadingSpinner

// Pre-built loading states for common scenarios
export const ChatLoadingIndicator = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    fontSize: '12px',
    color: 'var(--accent, #00ff99)',
    fontStyle: 'italic'
  }}>
    <LoadingSpinner size="small" inline />
    Pet is thinking...
  </div>
)

export const ApiLoadingOverlay = ({ message = 'Loading...' }) => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  }}>
    <div style={{
      backgroundColor: 'var(--bg, #121212)',
      border: '2px solid var(--accent, #00ff99)',
      borderRadius: '8px',
      padding: '24px',
      textAlign: 'center'
    }}>
      <LoadingSpinner size="large" message={message} />
    </div>
  </div>
)

export const InlineLoadingText = ({ text = 'Loading...' }) => (
  <span style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: 'var(--accent, #00ff99)'
  }}>
    <LoadingSpinner size="small" inline />
    {text}
  </span>
)