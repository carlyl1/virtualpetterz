import React, { useEffect, useState } from 'react'

export default function TokenNotification({ amount, type = 'gain', onComplete }) {
  const [visible, setVisible] = useState(true)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onComplete, 300) // Allow fade out animation
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [onComplete])
  
  const isGain = amount > 0 || type === 'gain'
  const displayAmount = Math.abs(amount)
  
  return (
    <div 
      className={`token-notification ${visible ? 'visible' : 'hidden'} ${isGain ? 'gain' : 'loss'}`}
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 2000,
        pointerEvents: 'none',
        fontSize: '24px',
        fontWeight: 'bold',
        color: isGain ? '#00FF99' : '#FF6B6B',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        animation: visible ? 'tokenFloat 2s ease-out' : 'fadeOut 0.3s ease-out',
        fontFamily: '"Press Start 2P", monospace'
      }}
    >
      {isGain ? '+' : '-'}{displayAmount} 🪙
      
      <style jsx>{`
        @keyframes tokenFloat {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0;
          }
          20% {
            transform: translate(-50%, -80px) scale(1.2);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -120px) scale(1);
            opacity: 0;
          }
        }
        
        @keyframes fadeOut {
          to {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
        }
        
        .token-notification.gain {
          color: #00FF99;
          text-shadow: 0 0 10px rgba(0, 255, 153, 0.5);
        }
        
        .token-notification.loss {
          color: #FF6B6B;
          text-shadow: 0 0 10px rgba(255, 107, 107, 0.5);
        }
      `}</style>
    </div>
  )
}

// Hook to manage token notifications
export function useTokenNotification() {
  const [notifications, setNotifications] = useState([])
  
  const showTokenChange = (amount, type = 'auto') => {
    const id = Date.now()
    const notificationType = type === 'auto' ? (amount > 0 ? 'gain' : 'loss') : type
    
    setNotifications(prev => [...prev, { id, amount, type: notificationType }])
  }
  
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }
  
  return { notifications, showTokenChange, removeNotification }
}