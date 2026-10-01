import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';

const API = 'http://localhost:5000/api';

const typeIcon = {
  NEW_ORDER:                '🛍️',
  ORDER_CONFIRMED:          '✅',
  ORDER_PREPARING:          '📦',
  ORDER_SHIPPED:            '🚀',
  ORDER_OUT_FOR_DELIVERY:   '🚚',
  ORDER_DELIVERED:          '🏠',
  ORDER_RECEIVED_CONFIRMED: '🎉',
  workshop_reminder:        '📅',
  workshop_live:            '🔴',
  replay_published:         '🎬',
  certificate_ready:        '🎓',
  order_confirmed:          '✅',
  waitlist_promoted:        '🎉',
  gift_received:            '🎁',
  review_reminder:          '⭐',
};

export default function NotificationBell() {
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const navigate  = useNavigate();
  const [open, setOpen]              = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread]          = useState(0);
  const panelRef = useRef(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { data } = await axios.get(`${API}/notifications`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setNotifications(data.notifications || []);
      setUnread(data.unreadCount || 0);
    } catch {/* silent */}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [user]);

  // Real-time socket listener for instant notification refresh
  useEffect(() => {
    if (!socket) return;
    const handleNotifEvent = () => {
      fetchNotifications();
    };

    socket.on('new_order', handleNotifEvent);
    socket.on('order_status_updated', handleNotifEvent);
    socket.on('customer_confirmed_received', handleNotifEvent);
    socket.on('payment_success', handleNotifEvent);

    return () => {
      socket.off('new_order', handleNotifEvent);
      socket.off('order_status_updated', handleNotifEvent);
      socket.off('customer_confirmed_received', handleNotifEvent);
      socket.off('payment_success', handleNotifEvent);
    };
  }, [socket]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = async () => {
    try {
      await axios.patch(`${API}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setUnread(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {/* silent */}
  };

  const handleClick = async (notif) => {
    if (!notif.read) {
      try {
        await axios.patch(`${API}/notifications/${notif._id}/read`, {}, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setUnread(prev => Math.max(0, prev - 1));
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
      } catch {/* silent */}
    }
    setOpen(false);
    if (notif.link) navigate(notif.link);
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (!user) return null;

  return (
    <div ref={panelRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Bell button */}
      <button
        id="notification-bell-btn"
        onClick={() => { setOpen(o => !o); if (!open) fetchNotifications(); }}
        style={{
          position: 'relative', background: 'transparent', border: 'none',
          cursor: 'pointer', padding: '6px 8px', borderRadius: 8,
          transition: 'background 0.2s',
        }}
        title="Notifications"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke={unread > 0 ? '#f59e0b' : '#94a3b8'} strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: 2, right: 2,
            background: '#ef4444', color: '#fff',
            fontSize: 10, fontWeight: 700, borderRadius: 99,
            minWidth: 16, height: 16, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            padding: '0 3px', lineHeight: 1,
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div id="notification-panel" style={{
          position: 'absolute', right: 0, top: 'calc(100% + 8px)',
          width: 340, maxHeight: 420, overflowY: 'auto',
          background: '#1e293b', border: '1px solid #334155',
          borderRadius: 14, boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
          zIndex: 9999,
          animation: 'fadeInDown 0.18s ease',
        }}>
          <style>{`
            @keyframes fadeInDown {
              from { opacity:0; transform:translateY(-6px); }
              to   { opacity:1; transform:translateY(0); }
            }
          `}</style>

          {/* Header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 16px 10px', borderBottom: '1px solid #334155',
          }}>
            <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: 14 }}>
              🔔 Notifications {unread > 0 && <span style={{ color: '#f59e0b' }}>({unread})</span>}
            </span>
            {unread > 0 && (
              <button onClick={markAllRead} style={{
                background: 'none', border: 'none', color: '#60a5fa',
                fontSize: 12, cursor: 'pointer', padding: 0,
              }}>
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          {notifications.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b', fontSize: 13 }}>
              You're all caught up! 🎉
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n._id}
                onClick={() => handleClick(n)}
                style={{
                  padding: '12px 16px', cursor: 'pointer', display: 'flex', gap: 10,
                  borderBottom: '1px solid #1e293b',
                  background: n.read ? 'transparent' : 'rgba(99,102,241,0.08)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#273549'}
                onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(99,102,241,0.08)'}
              >
                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>
                  {typeIcon[n.type] || '🔔'}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    color: '#f1f5f9', fontSize: 13, fontWeight: n.read ? 400 : 600,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {n.title}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 2, lineHeight: 1.4 }}>
                    {n.message}
                  </div>
                  <div style={{ color: '#475569', fontSize: 10, marginTop: 4 }}>
                    {timeAgo(n.createdAt)}
                  </div>
                </div>
                {!n.read && (
                  <div style={{
                    width: 7, height: 7, borderRadius: 99,
                    background: '#6366f1', flexShrink: 0, marginTop: 5,
                  }} />
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
