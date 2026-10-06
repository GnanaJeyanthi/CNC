import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StarRating from '../components/StarRating';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API = `${API_URL}/api`;

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(d) {
  if (!d) return 'TBA';
  return new Date(d).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
function formatTime(d) {
  if (!d) return 'TBA';
  return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}
function CountdownTimer({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState({});
  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate) - Date.now();
      if (diff <= 0) { setTimeLeft(null); return; }
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [targetDate]);

  if (!timeLeft) return null;
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
      {[['d', 'Days'], ['h', 'Hrs'], ['m', 'Min'], ['s', 'Sec']].map(([k, label]) => (
        <div key={k} style={{
          background: '#1e293b', borderRadius: 8, padding: '6px 10px', textAlign: 'center', minWidth: 48
        }}>
          <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: 18 }}>{String(timeLeft[k]).padStart(2,'0')}</div>
          <div style={{ color: '#64748b', fontSize: 10 }}>{label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function WorkshopDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [workshop, setWorkshop]       = useState(null);
  const [enrolled, setEnrolled]       = useState(false);
  const [waitlistInfo, setWaitlist]   = useState({ onWaitlist: false, position: null, total: 0 });
  const [reviews, setReviews]         = useState([]);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [myRating, setMyRating]       = useState(0);
  const [myComment, setMyComment]     = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [replayUrl, setReplayUrl]     = useState(null);
  const [replayAccess, setReplayAccess] = useState(null);
  const [replayLoading, setReplayLoading] = useState(false);
  const [priceInfo, setPriceInfo]     = useState(null);
  const [giftModal, setGiftModal]     = useState(false);
  const [giftEmail, setGiftEmail]     = useState('');
  const [giftLoading, setGiftLoading] = useState(false);
  const [loading, setLoading]         = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg]                 = useState('');
  const [showEmbeddedRoom, setShowEmbeddedRoom] = useState(false);

  const authHeader = user ? { Authorization: `Bearer ${user.token}` } : {};

  const fetchAll = useCallback(async () => {
    try {
      const [wRes, rRes] = await Promise.all([
        axios.get(`${API}/workshops/${id}`, { headers: authHeader }),
        axios.get(`${API}/reviews/${id}`),
      ]);
      setWorkshop(wRes.data);
      setReviews(rRes.data.reviews || []);
      setReviewTotal(rRes.data.total || 0);

      if (user) {
        const [eRes, wlRes, pRes] = await Promise.all([
          axios.get(`${API}/workshops/${id}/participants`, { headers: authHeader })
            .then(r => r.data.participants?.some(p => p.userId?._id === user._id || p.userId === user._id))
            .catch(() => false),
          axios.get(`${API}/workshops/${id}/waitlist`, { headers: authHeader }).catch(() => ({ data: {} })),
          axios.get(`${API}/workshops/${id}/price`, { headers: authHeader }).catch(() => ({ data: null })),
        ]);
        setEnrolled(eRes);
        setWaitlist(wlRes.data || {});
        setPriceInfo(pRes.data);
      } else {
        const pRes = await axios.get(`${API}/workshops/${id}/price`).catch(() => ({ data: null }));
        setPriceInfo(pRes.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleEnroll = async () => {
    if (!user) return navigate('/signin');
    setActionLoading(true); setMsg('');
    try {
      const price = priceInfo?.effectivePrice ?? workshop.price;
      const endpoint = price > 0
        ? `${API}/orders`
        : `${API}/workshops/${id}/join`;
      const payload = price > 0
        ? { items: [{ itemModel: 'Workshop', itemId: id, quantity: 1 }] }
        : {};
      const { data } = await axios.post(endpoint, payload, { headers: authHeader });
      if (data.waitlisted) {
        setMsg("⏳ Workshop is full — you've been added to the waitlist!");
        setWaitlist({ onWaitlist: true, position: null, total: (waitlistInfo.total || 0) + 1 });
      } else {
        setMsg('🎉 Enrolled successfully!');
        setEnrolled(true);
      }
    } catch (e) {
      setMsg(e.response?.data?.message || 'Error joining');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveWaitlist = async () => {
    setActionLoading(true);
    try {
      await axios.delete(`${API}/workshops/${id}/waitlist`, { headers: authHeader });
      setWaitlist({ onWaitlist: false, position: null, total: Math.max(0, (waitlistInfo.total || 1) - 1) });
      setMsg('Removed from waitlist.');
    } catch (e) {
      setMsg(e.response?.data?.message || 'Error');
    } finally { setActionLoading(false); }
  };

  const handleGift = async () => {
    if (!user) return navigate('/signin');
    if (!giftEmail.trim()) return;
    setGiftLoading(true);
    try {
      const price = priceInfo?.effectivePrice ?? workshop.price;
      if (price > 0) {
        await axios.post(`${API}/orders`, {
          items: [{ itemModel: 'Workshop', itemId: id, quantity: 1 }],
          giftEmail: giftEmail.trim(),
        }, { headers: authHeader });
      } else {
        setMsg('Free workshops cannot be gifted (they can join directly).');
        setGiftModal(false);
        setGiftLoading(false);
        return;
      }
      setMsg(`🎁 Gift sent to ${giftEmail}!`);
      setGiftModal(false);
      setGiftEmail('');
    } catch (e) {
      setMsg(e.response?.data?.message || 'Gift failed');
    } finally { setGiftLoading(false); }
  };

  const handleWatchReplay = async () => {
    setReplayLoading(true);
    try {
      const { data } = await axios.get(`${API}/workshops/${id}/replay`, { headers: authHeader });
      setReplayUrl(data.url);
      setReplayAccess(data.access);
    } catch (e) {
      if (e.response?.status === 403) {
        // Need to purchase
        try {
          await axios.post(`${API}/orders`, {
            items: [{ itemModel: 'Replay', itemId: id, quantity: 1 }],
          }, { headers: authHeader });
          const { data } = await axios.get(`${API}/workshops/${id}/replay`, { headers: authHeader });
          setReplayUrl(data.url);
          setReplayAccess('purchased');
        } catch (e2) {
          setMsg(e2.response?.data?.message || 'Could not purchase replay');
        }
      } else {
        setMsg(e.response?.data?.message || 'Replay not available');
      }
    } finally { setReplayLoading(false); }
  };

  const handleSubmitReview = async () => {
    if (!user) return navigate('/signin');
    if (!myRating) return setMsg('Please select a star rating');
    setSubmittingReview(true);
    try {
      const fd = new FormData();
      fd.append('rating', myRating);
      fd.append('comment', myComment);
      await axios.post(`${API}/reviews/${id}`, fd, { headers: { ...authHeader, 'Content-Type': 'multipart/form-data' } });
      setMsg('✅ Review submitted!');
      setMyRating(0); setMyComment('');
      // Refresh reviews
      const { data } = await axios.get(`${API}/reviews/${id}`);
      setReviews(data.reviews || []);
      setReviewTotal(data.total || 0);
    } catch (e) {
      setMsg(e.response?.data?.message || 'Could not submit review');
    } finally { setSubmittingReview(false); }
  };

  const [participantsList, setParticipantsList] = useState([]);
  const [recordingInput, setRecordingInput] = useState('');
  const [publishingRecording, setPublishingRecording] = useState(false);

  const handleEndWorkshop = async () => {
    if (!user) return;
    if (!window.confirm('Are you sure you want to mark this class session as OVER/ENDED?')) return;
    setActionLoading(true);
    try {
      const { data } = await axios.patch(`${API}/workshops/${id}/end`, {}, { headers: authHeader });
      setWorkshop(data);
      setShowEmbeddedRoom(false);
      setMsg('⏹️ Class session is now marked as OVER / ENDED! You can now publish recorded sessions & view participant attendance.');
    } catch (e) {
      setMsg(e.response?.data?.message || 'Failed to end workshop');
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    setShowEmbeddedRoom(true);
    if (user && enrolled) {
      try {
        await axios.post(`${API}/attendance/workshops/${id}/join-session`, {}, { headers: authHeader });
      } catch (err) {
        console.error('Attendance join record:', err);
      }
    }
  };

  const fetchParticipants = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/attendance/workshops/${id}/participants`, { headers: authHeader });
      setParticipantsList(data.participants || []);
    } catch (e) {
      console.error('Fetch participants error:', e);
    }
  }, [id, user]);

  const handleMarkStatus = async (targetUserId, newStatus) => {
    try {
      await axios.patch(`${API}/attendance/workshops/${id}/mark-status`, { userId: targetUserId, status: newStatus }, { headers: authHeader });
      fetchParticipants();
      setMsg('✅ Attendance status updated!');
    } catch (e) {
      setMsg('Error updating attendance status');
    }
  };

  const [fileUploading, setFileUploading] = useState(false);

  const handleVideoFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileUploading(true);
    setMsg('⏳ Uploading video file... Please wait');
    try {
      const formData = new FormData();
      formData.append('recording', file);
      const { data } = await axios.post(`${API}/workshops/${id}/recording`, formData, {
        headers: { ...authHeader, 'Content-Type': 'multipart/form-data' }
      });
      const videoUrl = data.recordingUrl || data.url;
      await axios.patch(`${API}/workshops/${id}/replay`, {
        replayPublished: true,
        replayPrice: 0,
        recordingUrl: videoUrl
      }, { headers: authHeader });
      setMsg('🎬 Video uploaded and published successfully!');
      fetchAll();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Video upload failed');
    } finally {
      setFileUploading(false);
    }
  };

  const handlePublishRecording = async () => {
    if (!recordingInput.trim()) return setMsg('Please enter a valid video recording URL');
    setPublishingRecording(true);
    try {
      await axios.patch(`${API}/workshops/${id}/replay`, {
        replayPublished: true,
        replayPrice: 0,
        recordingUrl: recordingInput.trim()
      }, { headers: authHeader });
      setMsg('🎬 Recorded session published under the Recorded Session header!');
      setRecordingInput('');
      fetchAll();
    } catch (e) {
      setMsg(e.response?.data?.message || 'Failed to publish recording');
    } finally {
      setPublishingRecording(false);
    }
  };

  const handleStartLive = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      const { data } = await axios.post(`${API}/workshops/${id}/start`, {}, { headers: authHeader });
      if (data.workshop) {
        setWorkshop(data.workshop);
      }
      setMsg('🔴 Workshop is now LIVE!');
      setShowEmbeddedRoom(true);
    } catch (e) {
      setMsg(e.response?.data?.message || 'Failed to start live workshop');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#fff', fontSize: 18 }}>
      Loading...
    </div>
  );
  if (!workshop) return null;

  const effectivePrice = priceInfo?.effectivePrice ?? workshop.price;
  const isEarlyBird    = priceInfo?.isEarlyBird ?? false;
  const isFull         = workshop.status !== 'live' && workshop.status !== 'ended'; // rough check
  const isEnded        = workshop.status === 'ended';
  const hasReplay      = isEnded && workshop.replayPublished && workshop.recordingUrl;

  const isCreator = Boolean(
    user && (
      (typeof workshop.creatorId === 'object' && String(workshop.creatorId?._id) === String(user._id)) ||
      String(workshop.creatorId) === String(user._id)
    )
  );

  const getCleanRoomUrl = (w) => {
    if (w.ngrokUrl) return w.ngrokUrl;
    const roomName = w.jitsiRoomName || `castncart-live-${w._id}`;
    return `https://meet.element.io/${roomName}`;
  };

  // Check if current user has already reviewed
  const alreadyReviewed = reviews.some(r => r.userId?._id === user?._id || r.userId === user?._id);

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0f172a', color: '#f8fafc' }}>
      <Navbar />

      <div style={{ flex: 1, maxWidth: 1100, margin: '0 auto', padding: '40px 20px', width: '100%' }}>
        {msg && (
          <div style={{
            background: msg.startsWith('🎉') || msg.startsWith('✅') || msg.startsWith('🎁') ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)',
            border: '1px solid ' + (msg.startsWith('🎉') || msg.startsWith('✅') || msg.startsWith('🎁') ? '#10b981' : '#ef4444'),
            borderRadius: 10, padding: '12px 18px', marginBottom: 24, color: '#f1f5f9', fontSize: 14,
          }}>
            {msg}
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 36 }}>
          {/* ── Left Column ──────────────────────────────────────────────── */}
          <div style={{ flex: '1 1 580px' }}>
            {/* Thumbnail */}
            <div style={{ borderRadius: 16, overflow: 'hidden', height: 340, background: '#1e293b', marginBottom: 28 }}>
              {workshop.thumbnailUrl
                ? <img src={workshop.thumbnailUrl} alt={workshop.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: 48 }}>🎨</div>
              }
            </div>

            {/* Embedded Live Video Call Room */}
            {showEmbeddedRoom && (
              <div style={{ background: '#020617', borderRadius: 16, border: '2px solid #6366f1', overflow: 'hidden', marginBottom: 28, padding: 14, boxShadow: '0 10px 30px rgba(99,102,241,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ color: '#10b981', fontWeight: 800, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                    🔴 LIVE Class Video Room
                  </span>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <a
                      href={getCleanRoomUrl(workshop)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ background: '#312e81', color: '#a5b4fc', border: '1px solid #4f46e5', borderRadius: 8, padding: '5px 12px', fontSize: 12, textDecoration: 'none', fontWeight: 700 }}
                    >
                      ↗ Open External Window
                    </a>
                    <button
                      onClick={() => setShowEmbeddedRoom(false)}
                      style={{ background: '#334155', color: '#f8fafc', border: 'none', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
                    >
                      ✕ Close Room
                    </button>
                  </div>
                </div>
                <iframe
                  src={getCleanRoomUrl(workshop)}
                  allow="camera; microphone; display-capture; autoplay; clipboard-write; encrypted-media; fullscreen"
                  style={{ width: '100%', height: 540, border: 'none', borderRadius: 10, background: '#000' }}
                  title="Live Workshop Class"
                />
              </div>
            )}

            {/* Category badge + title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ background: '#312e81', color: '#a5b4fc', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
                {workshop.category}
              </span>
              <span style={{ color: workshop.status === 'live' ? '#10b981' : '#64748b', fontSize: 12, fontWeight: 600 }}>
                {workshop.status === 'live' ? '🔴 LIVE NOW' : workshop.status.toUpperCase()}
              </span>
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: '#f8fafc', marginBottom: 8, lineHeight: 1.25 }}>
              {workshop.title}
            </h1>

            {/* Rating summary */}
            {workshop.reviewCount > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <StarRating value={Math.round(workshop.avgRating)} readonly size="sm" />
                <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: 14 }}>{workshop.avgRating.toFixed(1)}</span>
                <span style={{ color: '#64748b', fontSize: 13 }}>({workshop.reviewCount} review{workshop.reviewCount !== 1 ? 's' : ''})</span>
              </div>
            )}

            <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: 28 }}>{workshop.description}</p>

            {/* Learning objectives */}
            {workshop.learningObjectives?.length > 0 && (
              <div style={{ background: '#1e293b', borderRadius: 12, padding: '20px 24px', marginBottom: 28 }}>
                <h2 style={{ fontWeight: 700, fontSize: 16, color: '#f1f5f9', marginBottom: 14 }}>✨ What you'll learn</h2>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {workshop.learningObjectives.map((obj, i) => (
                    <li key={i} style={{ display: 'flex', gap: 10, color: '#cbd5e1', fontSize: 14 }}>
                      <span style={{ color: '#10b981', fontWeight: 700, flexShrink: 0 }}>✓</span> {obj}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── 📹 RECORDED WORKSHOP SESSION & REPLAYS ─────────────────────────────────────────── */}
            <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #0f172a)', borderRadius: 16, padding: '24px', border: '1px solid #6366f1', marginBottom: 28, boxShadow: '0 8px 24px rgba(99,102,241,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h2 style={{ fontWeight: 800, fontSize: 18, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>📹 Recorded Workshop Session & Replays</span>
                </h2>
                {hasReplay && <span style={{ background: '#10b981', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>PUBLISHED</span>}
              </div>

              {/* Display Video Player if published or url exists */}
              {workshop.recordingUrl || replayUrl ? (
                <div>
                  <div style={{ borderRadius: 12, overflow: 'hidden', background: '#000', marginBottom: 12 }}>
                    <video
                      src={workshop.recordingUrl || replayUrl}
                      controls
                      style={{ width: '100%', maxHeight: 400, objectFit: 'contain' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#a5b4fc' }}>
                    <span>Available for all enrolled attendees</span>
                    <a href={workshop.recordingUrl || replayUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', textDecoration: 'underline', fontWeight: 600 }}>
                      ↗ Open Video in New Tab
                    </a>
                  </div>
                </div>
              ) : (
                <div>
                  <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 14 }}>
                    {isEnded ? 'The recorded video session will appear here once published by the instructor.' : 'The recorded video session will be published here after the live class ends.'}
                  </p>

                  {/* Creator Form to Publish Recording */}
                  {isCreator && (
                    <div style={{ background: '#0f172a', border: '1px solid #312e81', borderRadius: 12, padding: 16, marginTop: 10 }}>
                      <p style={{ color: '#c7d2fe', fontWeight: 800, fontSize: 14, marginBottom: 12 }}>📤 Upload or Publish Workshop Recording Video</p>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {/* Option A: Direct Video File Upload */}
                        <div style={{ background: '#1e293b', border: '1px border-dashed #4f46e5', borderRadius: 10, padding: 12 }}>
                          <label style={{ display: 'block', color: '#a5b4fc', fontWeight: 700, fontSize: 12, marginBottom: 6 }}>
                            📁 Option A: Upload Video File (MP4, WEBM, MOV)
                          </label>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={handleVideoFileUpload}
                            disabled={fileUploading}
                            style={{ color: '#f8fafc', fontSize: 12, width: '100%' }}
                          />
                          {fileUploading && (
                            <p style={{ color: '#f59e0b', fontSize: 11, marginTop: 6, fontWeight: 600 }}>
                              ⏳ Uploading video file to server... Please do not refresh.
                            </p>
                          )}
                        </div>

                        <div style={{ textAlign: 'center', color: '#64748b', fontSize: 11, fontWeight: 700 }}>OR</div>

                        {/* Option B: Paste Recording Link */}
                        <div>
                          <label style={{ display: 'block', color: '#a5b4fc', fontWeight: 700, fontSize: 12, marginBottom: 6 }}>
                            🔗 Option B: Paste Video Recording URL
                          </label>
                          <div style={{ display: 'flex', gap: 10 }}>
                            <input
                              type="text"
                              placeholder="Paste recording URL (e.g. Cloudinary, MP4 URL, YouTube, Drive link)"
                              value={recordingInput}
                              onChange={e => setRecordingInput(e.target.value)}
                              style={{ flex: 1, background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 13 }}
                            />
                            <button
                              onClick={handlePublishRecording}
                              disabled={publishingRecording || !recordingInput.trim()}
                              style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                            >
                              {publishingRecording ? 'Publishing...' : 'Publish Link'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── 👥 PARTICIPANTS & ATTENDANCE TRACKER (CREATOR ONLY) ─────────────────────────── */}
            {isCreator && (
              <div style={{ background: '#1e293b', borderRadius: 16, padding: '24px', border: '1px solid #334155', marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h2 style={{ fontWeight: 800, fontSize: 18, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>👥 Participants & Attendance Tracker</span>
                  </h2>
                  <button
                    onClick={fetchParticipants}
                    style={{ background: '#334155', color: '#a5b4fc', border: 'none', borderRadius: 8, padding: '4px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                  >
                    🔄 Refresh List
                  </button>
                </div>

                {participantsList.length === 0 ? (
                  <p style={{ color: '#94a3b8', fontSize: 13 }}>No enrolled participants found yet.</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', textAlign: 'left' }}>
                          <th style={{ padding: '8px 12px' }}>Student</th>
                          <th style={{ padding: '8px 12px', textAlign: 'center' }}>Attendance Status</th>
                          <th style={{ padding: '8px 12px', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {participantsList.map(p => {
                          const isPresent = p.status === 'attended' || p.attended;
                          return (
                            <tr key={p._id} style={{ borderBottom: '1px solid #1e293b' }}>
                              <td style={{ padding: '10px 12px', color: '#f8fafc', fontWeight: 600 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>
                                    {p.userId?.name?.[0]?.toUpperCase() || 'S'}
                                  </div>
                                  <div>
                                    <div>{p.userId?.name || 'Enrolled Student'}</div>
                                    <div style={{ fontSize: 11, color: '#64748b' }}>{p.userId?.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                <span style={{
                                  background: isPresent ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                                  color: isPresent ? '#10b981' : '#f87171',
                                  border: '1px solid ' + (isPresent ? '#10b981' : '#ef4444'),
                                  borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 700
                                }}>
                                  {isPresent ? '✅ Present (Attended)' : '⏳ Registered'}
                                </span>
                              </td>
                              <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                                <button
                                  onClick={() => handleMarkStatus(p.userId?._id || p.userId, isPresent ? 'absent' : 'attended')}
                                  style={{
                                    background: isPresent ? '#334155' : '#10b981',
                                    color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer'
                                  }}
                                >
                                  {isPresent ? 'Mark Absent' : 'Mark Present'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ── Reviews ────────────────────────────────────────────────── */}
            <div style={{ marginBottom: 40 }}>
              <h2 style={{ fontWeight: 700, fontSize: 18, color: '#f1f5f9', marginBottom: 18 }}>
                ⭐ Reviews {reviewTotal > 0 && <span style={{ color: '#64748b', fontWeight: 400, fontSize: 14 }}>({reviewTotal})</span>}
              </h2>

              {/* Submit review form — only for attended users who haven't reviewed yet */}
              {user && enrolled && isEnded && !alreadyReviewed && (
                <div style={{ background: '#1e293b', borderRadius: 12, padding: 20, marginBottom: 20 }}>
                  <p style={{ color: '#a5b4fc', fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Share your experience</p>
                  <StarRating value={myRating} onChange={setMyRating} size="lg" />
                  <textarea
                    value={myComment}
                    onChange={e => setMyComment(e.target.value)}
                    placeholder="What did you enjoy most? (optional)"
                    rows={3}
                    style={{
                      width: '100%', marginTop: 12, background: '#0f172a', border: '1px solid #334155',
                      borderRadius: 8, padding: '10px 14px', color: '#f1f5f9', fontSize: 13,
                      resize: 'vertical', boxSizing: 'border-box',
                    }}
                  />
                  <button
                    onClick={handleSubmitReview}
                    disabled={submittingReview || !myRating}
                    style={{
                      marginTop: 10, background: '#6366f1', color: '#fff', border: 'none',
                      borderRadius: 8, padding: '10px 22px', fontWeight: 700, fontSize: 13,
                      cursor: submittingReview || !myRating ? 'not-allowed' : 'pointer',
                      opacity: submittingReview || !myRating ? 0.6 : 1,
                    }}
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              )}

              {reviews.length === 0 ? (
                <p style={{ color: '#475569', fontSize: 14 }}>No reviews yet. Be the first!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {reviews.map(r => (
                    <div key={r._id} style={{
                      background: '#1e293b', borderRadius: 12, padding: '16px 18px',
                      borderLeft: '3px solid #6366f1',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%', background: '#6366f1',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0,
                        }}>
                          {r.userId?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 13 }}>{r.userId?.name || 'Attendee'}</div>
                          <StarRating value={r.rating} readonly size="sm" />
                        </div>
                        <div style={{ marginLeft: 'auto', color: '#475569', fontSize: 11 }}>
                          {new Date(r.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      {r.comment && <p style={{ color: '#94a3b8', fontSize: 13, margin: 0, lineHeight: 1.6 }}>{r.comment}</p>}
                      {r.photoUrl && <img src={r.photoUrl} alt="Review" style={{ marginTop: 10, borderRadius: 8, maxHeight: 180, objectFit: 'cover' }} />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Right Column (Sticky Card) ────────────────────────────── */}
          <div style={{ flex: '0 0 300px', alignSelf: 'flex-start', position: 'sticky', top: 100 }}>
            <div style={{
              background: '#1e293b', borderRadius: 16, padding: 24,
              border: '1px solid #334155', boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}>
              {/* Price */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <span style={{ fontSize: 32, fontWeight: 800, color: '#f8fafc' }}>
                    {effectivePrice === 0 ? 'Free' : `₹${effectivePrice}`}
                  </span>
                  {isEarlyBird && workshop.price !== effectivePrice && (
                    <span style={{ fontSize: 16, color: '#64748b', textDecoration: 'line-through' }}>
                      ₹{workshop.price}
                    </span>
                  )}
                </div>
                {isEarlyBird && (
                  <div style={{ marginTop: 6 }}>
                    <span style={{
                      background: 'rgba(245,158,11,0.15)', color: '#f59e0b',
                      border: '1px solid #f59e0b', borderRadius: 6,
                      padding: '2px 8px', fontSize: 11, fontWeight: 700,
                    }}>
                      🐦 Early Bird Price!
                    </span>
                    <p style={{ color: '#64748b', fontSize: 11, marginTop: 6 }}>Offer ends in:</p>
                    <CountdownTimer targetDate={workshop.earlyBirdDeadline} />
                  </div>
                )}
              </div>

              {/* Main CTA */}
              {!isEnded && !enrolled && !waitlistInfo.onWaitlist && (
                <button
                  id="enroll-btn"
                  onClick={handleEnroll}
                  disabled={actionLoading}
                  style={{
                    width: '100%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: '#fff', border: 'none', borderRadius: 10, padding: '13px 0',
                    fontWeight: 700, fontSize: 15, cursor: actionLoading ? 'not-allowed' : 'pointer',
                    marginBottom: 10, transition: 'opacity 0.2s',
                    opacity: actionLoading ? 0.7 : 1,
                  }}
                >
                  {actionLoading ? '...' : effectivePrice === 0 ? 'Enroll for Free' : `Enroll — ₹${effectivePrice}`}
                </button>
              )}

              {/* Host Controls for Creator */}
              {isCreator && (
                <div style={{ marginBottom: 16, background: '#1e1b4b', border: '1px solid #6366f1', borderRadius: 12, padding: 14 }}>
                  <div style={{ color: '#c7d2fe', fontWeight: 800, fontSize: 13, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>👑 Instructor Host Controls</span>
                  </div>
                  
                  <button
                    onClick={handleStartLive}
                    disabled={actionLoading}
                    style={{
                      width: '100%', background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      color: '#fff', border: 'none', borderRadius: 10, padding: '12px 0',
                      fontWeight: 800, fontSize: 14, cursor: actionLoading ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 14px rgba(239,68,68,0.4)', marginBottom: 10
                    }}
                  >
                    {actionLoading ? 'Launching...' : workshop.status === 'live' ? '🔴 Enter LIVE Meeting Room (Host)' : '🚀 Start Live Class (Go Live)'}
                  </button>

                  <button
                    onClick={() => setShowEmbeddedRoom(!showEmbeddedRoom)}
                    style={{
                      width: '100%', background: '#312e81', color: '#a5b4fc', border: '1px solid #6366f1',
                      borderRadius: 10, padding: '10px 0', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                      marginBottom: 10
                    }}
                  >
                    {showEmbeddedRoom ? '✕ Hide Live Video Window' : '🖥️ Launch In-Page Video Room'}
                  </button>

                  <div style={{ background: '#0f172a', border: '1px solid #312e81', borderRadius: 8, padding: '8px 10px', fontSize: 11, color: '#94a3b8', wordBreak: 'break-all' }}>
                    <span style={{ color: '#a5b4fc', fontWeight: 700, display: 'block', marginBottom: 4 }}>🔗 Share Link with Students:</span>
                    <a href={getCleanRoomUrl(workshop)} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', textDecoration: 'underline' }}>
                      {getCleanRoomUrl(workshop)}
                    </a>
                  </div>
                </div>
              )}

              {enrolled && !isCreator && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{
                    background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981',
                    borderRadius: 10, padding: '12px 16px', marginBottom: 12, textAlign: 'center',
                    color: '#10b981', fontWeight: 700, fontSize: 14,
                  }}>
                    ✅ You're enrolled!
                  </div>

                  {/* Live Meeting Join Button */}
                  {(() => {
                    const roomUrl = getCleanRoomUrl(workshop);
                    const isLive = workshop.status === 'live';
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <button
                          onClick={() => setShowEmbeddedRoom(true)}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            width: '100%', background: isLive ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #10b981, #059669)',
                            color: '#ffffff', border: 'none', borderRadius: 10, padding: '13px 16px',
                            fontWeight: 800, fontSize: 14, boxShadow: isLive ? '0 4px 14px rgba(239,68,68,0.4)' : '0 4px 14px rgba(16,185,129,0.3)',
                            textAlign: 'center', boxSizing: 'border-box', cursor: 'pointer'
                          }}
                        >
                          {isLive ? '🔴 Join LIVE Workshop (In-Page)' : '🎥 Join Workshop Meeting Room'}
                        </button>

                        <a
                          href={roomUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            width: '100%', background: '#1e293b', color: '#94a3b8', border: '1px solid #334155',
                            borderRadius: 10, padding: '9px 0', textDecoration: 'none', fontWeight: 600, fontSize: 12,
                            boxSizing: 'border-box'
                          }}
                        >
                          ↗ Open External Window
                        </a>
                        
                        <div style={{
                          background: '#0f172a', border: '1px solid #334155', borderRadius: 10, padding: '10px 12px',
                          fontSize: 11, color: '#94a3b8', wordBreak: 'break-all'
                        }}>
                          <span style={{ color: '#cbd5e1', fontWeight: 700, display: 'block', marginBottom: 4 }}>🔗 Direct Class Link:</span>
                          <a href={roomUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', textDecoration: 'underline' }}>
                            {roomUrl}
                          </a>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {waitlistInfo.onWaitlist && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{
                    background: 'rgba(245,158,11,0.1)', border: '1px solid #f59e0b',
                    borderRadius: 10, padding: '12px 16px', textAlign: 'center',
                    color: '#f59e0b', fontWeight: 700, fontSize: 13, marginBottom: 8,
                  }}>
                    ⏳ You're on the waitlist
                    {waitlistInfo.position && ` (#${waitlistInfo.position} of ${waitlistInfo.total})`}
                  </div>
                  <button
                    onClick={handleLeaveWaitlist}
                    disabled={actionLoading}
                    style={{
                      width: '100%', background: 'transparent', color: '#64748b',
                      border: '1px solid #334155', borderRadius: 8, padding: '8px 0',
                      fontSize: 12, cursor: 'pointer',
                    }}
                  >
                    Leave waitlist
                  </button>
                </div>
              )}

              {/* Gift button */}
              {!isEnded && !enrolled && (
                <button
                  id="gift-btn"
                  onClick={() => { if (!user) navigate('/signin'); else setGiftModal(true); }}
                  style={{
                    width: '100%', background: 'transparent', color: '#a5b4fc',
                    border: '1px solid #4f46e5', borderRadius: 10, padding: '11px 0',
                    fontWeight: 600, fontSize: 14, cursor: 'pointer', marginBottom: 10,
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  🎁 Gift this Workshop
                </button>
              )}

              {/* Certificate button */}
              {isEnded && enrolled && (
                <a
                  href={`${API}/certificates/${id}?token=${user?.token}`}
                  onClick={e => {
                    e.preventDefault();
                    fetch(`${API}/certificates/${id}`, { headers: authHeader })
                      .then(r => r.blob())
                      .then(blob => {
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url; a.download = `CNC-Certificate-${id}.pdf`; a.click();
                        URL.revokeObjectURL(url);
                      })
                      .catch(() => setMsg('Could not generate certificate'));
                  }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'center', textDecoration: 'none',
                    background: 'linear-gradient(135deg, #c9a84c, #f59e0b)', color: '#000',
                    borderRadius: 10, padding: '12px 0', fontWeight: 700, fontSize: 14,
                    cursor: 'pointer', marginBottom: 10,
                  }}
                >
                  🎓 Download Certificate
                </a>
              )}

              {/* Info rows */}
              <div style={{ borderTop: '1px solid #334155', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  ['📅', 'Date', formatDate(workshop.scheduledDate)],
                  ['⏰', 'Time', formatTime(workshop.scheduledDate)],
                  ['⏱️', 'Duration', `${workshop.durationMinutes} mins`],
                  ['👤', 'Host', workshop.creatorId?.name],
                  ['👥', 'Seats', `Max ${workshop.maxParticipants}`],
                  ...(waitlistInfo.total > 0 ? [['⏳', 'Waitlist', `${waitlistInfo.total} waiting`]] : []),
                ].map(([icon, label, val]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#64748b' }}>{icon} {label}</span>
                    <span style={{ color: '#f1f5f9', fontWeight: 600, textAlign: 'right', maxWidth: 160 }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Gift Modal ─────────────────────────────────────────────────────── */}
      {giftModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: 20,
        }}>
          <div style={{
            background: '#1e293b', borderRadius: 16, padding: 32, width: '100%', maxWidth: 440,
            border: '1px solid #334155', boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          }}>
            <h3 style={{ color: '#f8fafc', fontWeight: 800, fontSize: 20, marginBottom: 6 }}>🎁 Gift this Workshop</h3>
            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
              Send a workshop ticket to someone special. Enter their email and we'll notify them.
            </p>
            <input
              id="gift-email-input"
              type="email"
              value={giftEmail}
              onChange={e => setGiftEmail(e.target.value)}
              placeholder="Recipient's email address"
              style={{
                width: '100%', background: '#0f172a', border: '1px solid #334155',
                borderRadius: 8, padding: '12px 14px', color: '#f1f5f9', fontSize: 14,
                marginBottom: 16, boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => { setGiftModal(false); setGiftEmail(''); }}
                style={{
                  flex: 1, background: 'transparent', border: '1px solid #334155',
                  color: '#94a3b8', borderRadius: 8, padding: '11px 0', cursor: 'pointer', fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                id="gift-send-btn"
                onClick={handleGift}
                disabled={giftLoading || !giftEmail.trim()}
                style={{
                  flex: 2, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff', border: 'none', borderRadius: 8, padding: '11px 0',
                  fontWeight: 700, fontSize: 14, cursor: giftLoading ? 'not-allowed' : 'pointer',
                  opacity: giftLoading || !giftEmail.trim() ? 0.6 : 1,
                }}
              >
                {giftLoading ? 'Sending...' : `Send Gift — ₹${effectivePrice}`}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
