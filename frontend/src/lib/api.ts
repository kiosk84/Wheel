const API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is not set');
}

/**
 * Participant with number
 */
export interface ParticipantWithNumber {
  name: string;
  number: number;
}

/**
 * Get list of participants (names only)
 */
export async function getParticipants(): Promise<string[]> {
  const res = await fetch(`${API_URL}/participants`);
  if (!res.ok) throw new Error('Failed to fetch participants');
  return res.json();
}

/**
 * Get detailed list of participants with numbers
 */
export async function getDetailedParticipants(): Promise<ParticipantWithNumber[]> {
  const res = await fetch(`${API_URL}/participants?detailed=true`);
  if (!res.ok) throw new Error('Failed to fetch detailed participants');
  return res.json();
}

export async function getPending(): Promise<{ name: string; amount: number }[]> {
  const res = await fetch(`${API_URL}/pending`);
  if (!res.ok) throw new Error('Failed to fetch pending');
  return res.json();
}

export async function spinWheel(): Promise<{ success: boolean; winner?: string; message?: string }> {
  const res = await fetch(`${API_URL}/spin`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to spin wheel');
  return res.json();
}

/**
 * Fetch winners history
 */
export interface Winner {
  name: string;
  prize: number;
  date: string;
}
export async function getWinners(): Promise<Winner[]> {
  const res = await fetch(`${API_URL}/winners`);
  if (!res.ok) throw new Error('Failed to fetch winners');
  return res.json();
}

export async function getPrizepool(): Promise<{ total: number }> {
  const res = await fetch(`${API_URL}/prizepool`);
  if (!res.ok) throw new Error('Failed to fetch prize pool');
  return res.json();
}

export async function getTimer(): Promise<{ secondsRemaining: number }> {
  const res = await fetch(`${API_URL}/timer`);
  if (!res.ok) throw new Error('Failed to fetch timer');
  return res.json();
}

/**
 * Add a new participant by name
 */
export async function postParticipant(name: string): Promise<void> {
  const res = await fetch(`${API_URL}/participants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Failed to add participant');
}

/**
 * Submit pending participation request
 */
export async function postPending(name: string, telegramId: string): Promise<{
  success: boolean;
  message?: string;
  adminAdd?: boolean;
}> {
  const res = await fetch(`${API_URL}/pending`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, telegramId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err.error || 'Failed to request participation';
    throw new Error(msg);
  }
  return res.json();
}

/**
 * Set next spin timer (admin only)
 */
export async function postTimer(time: string): Promise<{ success: boolean; time: string }> {
  const res = await fetch(`${API_URL}/timer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ time }),
  });
  if (!res.ok) throw new Error('Failed to set timer');
  return res.json();
}

/**
 * Check if a telegramId can participate or is already pending/participant
 */
export async function checkPending(telegramId: string): Promise<void> {
  const res = await fetch(`${API_URL}/pending/check?telegramId=${encodeURIComponent(telegramId)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err.error || 'Вы уже участвуете или ожидаете подтверждения';
    throw new Error(msg);
  }
}

export async function getResetState(): Promise<{
  participants: string[];
  pending: { name: string }[];
  prizepool: number;
}> {
  const res = await fetch(`${API_URL}/reset`);
  if (!res.ok) throw new Error('Failed to fetch reset state');
  return res.json();
}
