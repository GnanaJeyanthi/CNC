import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!user || !user.token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Connect socket with authenticated JWT token
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const newSocket = io(API_URL, {
      auth: { token: user.token },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    newSocket.on('connect', () => {
      console.log('⚡ Socket connected to CastNCart server:', newSocket.id);
    });

    // Universal real-time event listeners for toast notifications
    newSocket.on('new_order', (data) => {
      const msg = data.notification?.message || `New order received for ${data.order?.items?.[0]?.itemId?.title || 'product'}`;
      showToast('📦 New Order Received!', msg, 'success');
    });

    newSocket.on('order_status_updated', (data) => {
      const msg = data.notification?.message || `Order status updated to: ${data.order?.orderStatus}`;
      showToast('🚚 Order Status Updated', msg, 'info');
    });

    newSocket.on('customer_confirmed_received', (data) => {
      const msg = data.notification?.message || 'Customer confirmed order receipt!';
      showToast('🎉 Order Delivered & Confirmed!', msg, 'success');
    });

    newSocket.on('payment_success', (data) => {
      const msg = data.notification?.message || 'Payment confirmed!';
      showToast('✅ Payment Successful', msg, 'success');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const showToast = (title, message, type = 'info') => {
    setToast({ title, message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  return (
    <SocketContext.Provider value={{ socket, showToast }}>
      {children}
      {/* Real-Time Toast Popup Banner */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 99999,
          maxWidth: 380,
          background: toast.type === 'success' ? '#064e3b' : '#1e1b4b',
          border: `1px solid ${toast.type === 'success' ? '#10b981' : '#6366f1'}`,
          borderRadius: 14,
          padding: '14px 18px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
          animation: 'slideInRight 0.3s ease-out',
        }}>
          <style>{`
            @keyframes slideInRight {
              from { opacity: 0; transform: translateX(50px); }
              to { opacity: 1; transform: translateX(0); }
            }
          `}</style>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: toast.type === 'success' ? '#34d399' : '#818cf8' }}>
              {toast.title}
            </span>
            <button
              onClick={() => setToast(null)}
              style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 16, padding: '0 4px' }}
            >
              ✕
            </button>
          </div>
          <div style={{ fontSize: 13, color: '#e5e7eb', lineHeight: 1.4 }}>
            {toast.message}
          </div>
        </div>
      )}
    </SocketContext.Provider>
  );
};
