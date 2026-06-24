/**
 * API Client for Verifier
 */

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8787';

export async function getChallenge(audience: string = 'agenticdid.io') {
  const response = await fetch(`${API_BASE}/challenge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audience }),
  });
  return response.json();
}

export async function presentVP(vp: any, challenge_nonce: string) {
  const response = await fetch(`${API_BASE}/present`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vp, challenge_nonce }),
  });
  return { status: response.status, data: await response.json() };
}
