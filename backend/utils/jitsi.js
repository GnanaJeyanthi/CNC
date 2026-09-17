import crypto from 'crypto';

export function generateJitsiRoomName(workshopId) {
  const random = crypto.randomBytes(4).toString('hex');
  return `castncart-${workshopId}-${random}`;
}

export function getJitsiRoomUrl(roomName) {
  const cleanName = roomName || 'castncart-live-room';
  return `https://meet.element.io/${cleanName}`;
}
