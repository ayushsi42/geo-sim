const BASE = '/api/v1';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json();
}

export const api = {
  getHealth:        ()       => fetch('/health').then(r => r.json()),
  getRecentEvents:  (limit=50) => request(`/events/recent?limit=${limit}`),
  getEventStats:    ()       => request('/events/stats'),
  getCurrentState:  ()       => request('/state/current'),
  simulate:         (body)   => request('/simulate/', { method: 'POST', body: JSON.stringify(body) }),
};
