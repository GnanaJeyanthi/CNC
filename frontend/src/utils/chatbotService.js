import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Send message to CastNCart Assistant backend endpoint
 */
export async function sendChatMessage(message, cart = []) {
  try {
    const userInfoStr = localStorage.getItem('userInfo');
    const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
    const token = userInfo?.token;

    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const { data } = await axios.post(
      `${API_BASE}/chatbot/message`,
      { message, cart },
      { headers, timeout: 15000 }
    );

    return data;
  } catch (error) {
    console.error('Chatbot API error:', error);
    return {
      success: false,
      text: "Sorry, I couldn't retrieve that information right now. Please try again.",
      type: 'error',
      cards: []
    };
  }
}

/**
 * Fetch role-based quick actions from backend
 */
export async function getChatQuickActions() {
  try {
    const userInfoStr = localStorage.getItem('userInfo');
    const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
    const token = userInfo?.token;

    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const { data } = await axios.get(`${API_BASE}/chatbot/quick-actions`, {
      headers,
      timeout: 10000
    });

    return data.actions || [];
  } catch (error) {
    console.error('Failed to load quick actions:', error);
    return [
      { label: 'Find Products', query: 'Show available products' },
      { label: 'Find Workshops', query: 'What workshops are available?' },
      { label: 'Daily Puzzle', query: "What is today's puzzle?" }
    ];
  }
}
