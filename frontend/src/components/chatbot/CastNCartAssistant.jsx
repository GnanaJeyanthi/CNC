import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { sendChatMessage, getChatQuickActions } from '../../utils/chatbotService';
import {
  MessageSquare,
  X,
  Minus,
  Send,
  Sparkles,
  ShoppingBag,
  Calendar,
  Clock,
  User as UserIcon,
  ExternalLink,
  ChevronRight,
  RotateCcw,
  Check,
  AlertCircle,
  Package,
  Layers,
  Flame,
  CheckCircle2,
  HelpCircle,
  Compass
} from 'lucide-react';

export default function CastNCartAssistant() {
  const { user } = useContext(AuthContext);
  const { cartItems, addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickActions, setQuickActions] = useState([]);
  const [addedItems, setAddedItems] = useState({});

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Role resolution: CUSTOMER, CREATOR, or GUEST
  const role = !user ? 'GUEST' : user.role === 'Creator' ? 'CREATOR' : 'CUSTOMER';

  // Initial welcome message
  const getInitialMessage = () => {
    if (role === 'CREATOR') {
      return {
        id: 'init-1',
        sender: 'assistant',
        text: `Hello ${user?.name || 'Creator'}! I'm CastNCart Assistant. I can help you manage your scheduled workshops, check live stream attendance, monitor sales, or explain category fields.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    } else if (role === 'CUSTOMER') {
      return {
        id: 'init-1',
        sender: 'assistant',
        text: `Hello ${user?.name || 'there'}! I'm CastNCart Assistant. Looking for handcrafted items, live workshops, your order history, or today's logic puzzle? Let me know what you need!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }
    return {
      id: 'init-1',
      sender: 'assistant',
      text: "Hello! I'm CastNCart Assistant. I can help you find handmade crafts, discover live workshops, and play daily logic puzzles. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  useEffect(() => {
    // Reset conversation greeting when user changes
    setMessages([getInitialMessage()]);
    // Fetch quick actions for current role
    getChatQuickActions().then((actions) => setQuickActions(actions));
  }, [user]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [messages, isOpen, isMinimized]);

  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendChatMessage(text, cartItems);

      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: response.text,
        type: response.type || 'text',
        cards: response.cards || [],
        attendanceRows: response.attendanceRows || [],
        navigation: response.navigation || null,
        streak: response.streak || null,
        cartItems: response.cartItems || null,
        cartTotal: response.cartTotal || null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: "Sorry, I couldn't retrieve that information right now. Please try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    const prodId = product.id || product._id;
    setAddedItems((prev) => ({ ...prev, [prodId]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [prodId]: false }));
    }, 2000);
  };

  const handleResetChat = () => {
    setMessages([getInitialMessage()]);
  };

  return (
    <>
      {/* ── Floating Launcher Button ────────────────────────────────────────── */}
      {!isOpen && (
        <button
          id="btn-chatbot-open"
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-3.5 rounded-full shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-105 active:scale-95 group focus:outline-none focus:ring-4 focus:ring-blue-300 border border-white/20"
          aria-label="Open CastNCart Assistant"
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full shadow-sm" />
          </div>
          <div className="text-left hidden sm:block pr-1">
            <p className="text-xs font-bold leading-none tracking-wide text-white">CastNCart Assistant</p>
            <p className="text-[10px] text-blue-100/90 font-medium mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Online
            </p>
          </div>
        </button>
      )}

      {/* ── Chat Window Dialog ─────────────────────────────────────────────── */}
      {isOpen && (
        <div
          id="castncart-chat-window"
          className={`fixed z-50 transition-all duration-300 ease-out flex flex-col shadow-2xl border border-slate-200/80 bg-white ${
            isMinimized
              ? 'bottom-6 right-6 w-80 sm:w-96 rounded-2xl h-14 overflow-hidden'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[94vw] sm:w-[420px] h-[86vh] sm:h-[620px] rounded-2xl sm:rounded-3xl overflow-hidden'
          }`}
        >
          {/* ── Header ──────────────────────────────────────────────────────── */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white px-4 py-3.5 flex items-center justify-between shadow-sm select-none">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-xl bg-blue-600/60 border border-blue-400/30 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm tracking-tight text-white">CastNCart Assistant</h3>
                  {role !== 'GUEST' && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-200 border border-blue-400/20">
                      {role}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-emerald-300 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Available & Ready
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                id="btn-chatbot-reset"
                onClick={handleResetChat}
                title="Reset Conversation"
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                id="btn-chatbot-minimize"
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Expand' : 'Minimize'}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                id="btn-chatbot-close"
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── Body Area (hidden if minimized) ─────────────────────────────── */}
          {!isMinimized && (
            <>
              {/* Messages scroll area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/70 text-slate-800 text-sm">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl p-3.5 shadow-sm text-sm ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none'
                          : 'bg-white text-slate-800 border border-slate-200/70 rounded-bl-none'
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words leading-relaxed">
                        {msg.text}
                      </div>

                      {/* ── Structured Product Cards ──────────────────────── */}
                      {msg.type === 'products' && msg.cards && msg.cards.length > 0 && (
                        <div className="mt-3 space-y-2.5">
                          {msg.cards.map((prod) => {
                            const prodId = prod.id || prod._id;
                            const isAdded = addedItems[prodId];

                            return (
                              <div
                                key={prodId}
                                className="bg-slate-50 border border-slate-200/90 rounded-xl p-2.5 flex items-center gap-3 hover:border-blue-300 transition"
                              >
                                <img
                                  src={prod.imageUrl}
                                  alt={prod.title}
                                  className="w-14 h-14 object-cover rounded-lg bg-slate-200 flex-shrink-0"
                                  onError={(e) => {
                                    e.target.src =
                                      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=300&auto=format&fit=crop&q=60';
                                  }}
                                />
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-slate-900 text-xs truncate">
                                    {prod.title}
                                  </h4>
                                  <p className="text-[11px] text-slate-500 truncate">
                                    by {prod.creatorName || 'Artisan'}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="font-bold text-blue-600 text-xs">
                                      ₹{prod.price}
                                    </span>
                                    <span
                                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                        prod.stock > 0
                                          ? 'bg-emerald-50 text-emerald-700'
                                          : 'bg-rose-50 text-rose-700'
                                      }`}
                                    >
                                      {prod.stock > 0 ? `Stock: ${prod.stock}` : 'Out of Stock'}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1 flex-shrink-0">
                                  <button
                                    onClick={() => navigate(prod.viewUrl || `/marketplace/${prodId}`)}
                                    className="text-[11px] font-medium text-slate-600 hover:text-blue-600 border border-slate-200 bg-white hover:bg-slate-50 px-2 py-1 rounded-md transition text-center"
                                  >
                                    View
                                  </button>
                                  {role !== 'CREATOR' && (
                                    <button
                                      disabled={prod.stock <= 0}
                                      onClick={() => handleAddToCart(prod)}
                                      className={`text-[11px] font-bold px-2 py-1 rounded-md transition flex items-center gap-1 justify-center ${
                                        isAdded
                                          ? 'bg-emerald-500 text-white'
                                          : 'bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50'
                                      }`}
                                    >
                                      {isAdded ? (
                                        <>
                                          <Check className="w-3 h-3" /> Added
                                        </>
                                      ) : (
                                        <>
                                          <ShoppingBag className="w-3 h-3" /> Cart
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* ── Structured Workshop Cards ─────────────────────── */}
                      {msg.type === 'workshops' && msg.cards && msg.cards.length > 0 && (
                        <div className="mt-3 space-y-2.5">
                          {msg.cards.map((w) => {
                            const wId = w.id || w._id;
                            const isLive = w.status === 'live';

                            return (
                              <div
                                key={wId}
                                className="bg-slate-50 border border-slate-200/90 rounded-xl p-2.5 flex items-center gap-3 hover:border-blue-300 transition"
                              >
                                <img
                                  src={w.thumbnailUrl}
                                  alt={w.title}
                                  className="w-14 h-14 object-cover rounded-lg bg-slate-200 flex-shrink-0"
                                  onError={(e) => {
                                    e.target.src =
                                      'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=60';
                                  }}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <h4 className="font-semibold text-slate-900 text-xs truncate">
                                      {w.title}
                                    </h4>
                                    {isLive && (
                                      <span className="text-[9px] uppercase font-extrabold bg-rose-600 text-white px-1.5 py-0.5 rounded animate-pulse">
                                        LIVE
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-500 truncate">
                                    Host: {w.creatorName || 'Instructor'} • {w.category}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1 text-[11px]">
                                    <span className="font-bold text-indigo-600">{w.price}</span>
                                    <span className="text-slate-400">•</span>
                                    <span className="text-slate-600">
                                      {w.scheduledDate} {w.scheduledTime}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1 flex-shrink-0">
                                  <button
                                    onClick={() => navigate(w.viewUrl || `/workshops/${wId}`)}
                                    className="text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 px-2.5 py-1.5 rounded-md transition text-center"
                                  >
                                    {w.isEnrolled ? 'Open' : 'Enroll'}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* ── Creator Workshops Cards ───────────────────────── */}
                      {msg.type === 'creator_workshops' && msg.cards && msg.cards.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {msg.cards.map((w) => (
                            <div
                              key={w.id}
                              className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                            >
                              <div className="flex justify-between items-start">
                                <h4 className="font-bold text-slate-900">{w.title}</h4>
                                <span
                                  className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${
                                    w.status === 'live'
                                      ? 'bg-rose-100 text-rose-700'
                                      : 'bg-blue-100 text-blue-700'
                                  }`}
                                >
                                  {w.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 mt-1.5 text-slate-600 text-[11px]">
                                <span>Date: {w.scheduledDate}</span>
                                <span>•</span>
                                <span>Enrolled: <b>{w.participants}</b></span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* ── Attendance Report Table ───────────────────────── */}
                      {msg.type === 'attendance' && msg.attendanceRows && msg.attendanceRows.length > 0 && (
                        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white">
                          <table className="w-full text-left text-[11px]">
                            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                              <tr>
                                <th className="p-2">Workshop</th>
                                <th className="p-2">Total</th>
                                <th className="p-2">Present</th>
                                <th className="p-2">Rate</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {msg.attendanceRows.map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-50">
                                  <td className="p-2 font-medium text-slate-900 truncate max-w-[120px]">
                                    {row.title}
                                  </td>
                                  <td className="p-2 text-slate-600">{row.total}</td>
                                  <td className="p-2 text-emerald-600 font-semibold">{row.attended}</td>
                                  <td className="p-2 font-bold text-blue-600">{row.rate}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* ── Structured Order Cards ────────────────────────── */}
                      {msg.type === 'orders' && msg.cards && msg.cards.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {msg.cards.map((ord) => (
                            <div
                              key={ord.id}
                              className="bg-slate-50 border border-slate-200/90 rounded-xl p-2.5 text-xs"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-mono text-[11px] font-bold text-slate-700">
                                  Order #{ord.shortId}
                                </span>
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 uppercase">
                                  {ord.paymentStatus}
                                </span>
                              </div>
                              <p className="text-slate-800 font-medium truncate">{ord.items}</p>
                              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
                                <span>{ord.orderDate}</span>
                                <span className="font-bold text-slate-900">{ord.totalAmount}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* ── Navigation Actions ────────────────────────────── */}
                      {msg.navigation && (
                        <div className="mt-3">
                          <button
                            onClick={() => navigate(msg.navigation.path)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg shadow-sm transition"
                          >
                            <Compass className="w-3.5 h-3.5" />
                            {msg.navigation.label}
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                ))}

                {/* ── Typing Indicator ────────────────────────────────────── */}
                {loading && (
                  <div className="flex items-start gap-2">
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-3 shadow-sm flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                      <span
                        className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      />
                      <span
                        className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"
                        style={{ animationDelay: '0.4s' }}
                      />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* ── Quick Action Buttons ────────────────────────────────────── */}
              <div className="bg-white border-t border-slate-100 p-2 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(action.query)}
                    className="text-xs bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-medium px-2.5 py-1 rounded-full border border-slate-200/80 transition flex-shrink-0"
                  >
                    {action.label}
                  </button>
                ))}
              </div>

              {/* ── Input Area ──────────────────────────────────────────────── */}
              <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask CastNCart Assistant..."
                  disabled={loading}
                  className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
                <button
                  id="btn-chatbot-send"
                  disabled={!input.trim() || loading}
                  onClick={() => handleSendMessage()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white p-2.5 rounded-xl shadow-sm transition flex-shrink-0 focus:outline-none"
                  title="Send"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
