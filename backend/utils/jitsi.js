import crypto from 'crypto';

export function generateJitsiRoomName(workshopId) {
  const random = crypto.randomBytes(4).toString('hex');
  return `castncart-${workshopId}-${random}`;
}

export function getJitsiRoomUrl(roomName) {
  return `https://meet.jit.si/${roomName}`;
}
