import React, { useEffect, useState } from 'react';

export default function LevelUpNotification({ levelUpData, onClose }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (levelUpData) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 300); // Wait for animation
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [levelUpData, onClose]);

  if (!levelUpData || !show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      animation: show ? 'fadeIn 0.3s ease-out' : 'fadeOut 0.3s ease-out'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #00ff99, #00cc77)',
        borderRadius: 16,
        padding: '2rem',
        textAlign: 'center',
        color: '#000',
        fontWeight: 'bold',
        maxWidth: '400px',
        width: '90%',
        animation: 'bounce 0.6s ease-out'
      }}>
        <h1 style={{ margin: 0, fontSize: '3rem' }}>🎉</h1>
        <h2 style={{ margin: '1rem 0 0.5rem 0', fontSize: '1.8rem' }}>
          LEVEL UP!
        </h2>
        <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
          Level {levelUpData.newLevel}
        </div>
        
        <div style={{ 
          background: 'rgba(0, 0, 0, 0.1)', 
          borderRadius: 8, 
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            <strong>Stat Gains:</strong>
          </div>
          {Object.entries(levelUpData.statGains).map(([stat, gain]) => (
            <div key={stat} style={{ fontSize: '0.8rem' }}>
              {stat.toUpperCase()}: +{gain}
            </div>
          ))}
        </div>
        
        <div style={{ fontSize: '1rem', color: '#004d1a' }}>
          🪙 Bonus: +{levelUpData.tokenReward} tokens!
        </div>
        
        <button
          onClick={() => {
            setShow(false);
            setTimeout(onClose, 300);
          }}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            background: 'rgba(0, 0, 0, 0.8)',
            color: '#00ff99',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          Awesome! 🚀
        </button>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
            transform: translate3d(0, 0, 0);
          }
          40%, 43% {
            animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
            transform: translate3d(0, -15px, 0);
          }
          70% {
            animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
            transform: translate3d(0, -7px, 0);
          }
          90% {
            transform: translate3d(0, -2px, 0);
          }
        }
      `}</style>
    </div>
  );
}