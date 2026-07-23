import crypto from 'crypto';

export function generateNgrokLiveUrl(workshopId) {
  if (process.env.NGROK_URL) {
    const ngrokBase = process.env.NGROK_URL.replace(/\/$/, '');
    const uniqueToken = crypto.randomBytes(4).toString('hex');
    return `${ngrokBase}/live/${workshopId}-${uniqueToken}`;
  }
  const random = crypto.randomBytes(4).toString('hex');
  return `https://meet.jit.si/castncart-live-${workshopId}-${random}`;
}
