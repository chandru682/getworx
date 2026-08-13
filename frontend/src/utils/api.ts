const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
  const cleanUrl = envUrl.replace(/\/+$/, '');
  return cleanUrl.endsWith('/api/v1') ? cleanUrl : `${cleanUrl}/api/v1`;
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Core wrapper around fetch() that automatically injects the Auth Bearer token
 * and handles common response formatting (ResponseEnvelope structure).
 */
export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('getworxs_access_token') || localStorage.getItem('token');

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const response = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok || (data.success !== undefined && !data.success)) {
    const message = data.message || data.detail || 'An API error occurred';
    throw new Error(message);
  }

  // Handle ResponseEnvelope wrapped endpoints
  if (data.success && data.data !== undefined) {
    return data.data as T;
  }
  
  return data as T;
}

// --------------------------------------------------------
// API Namespaces
// --------------------------------------------------------

export const NotificationAPI = {
  list: (page = 1, limit = 20, unreadOnly = false) => 
    apiFetch<any>(`/notifications?page=${page}&limit=${limit}&unread_only=${unreadOnly}`),
    
  unreadCount: () => 
    apiFetch<{ count: number }>('/notifications/unread-count'),
    
  markRead: (id: number) => 
    apiFetch<void>(`/notifications/${id}/read`, { method: 'PUT' }),
    
  markAllRead: () => 
    apiFetch<void>('/notifications/read-all', { method: 'PUT' }),
};

export const ApplicationAPI = {
  submit: (data: any) => 
    apiFetch<any>('/applications', { method: 'POST', body: JSON.stringify(data) }),
    
  listCandidate: (page = 1, limit = 20) => 
    apiFetch<any>(`/applications?page=${page}&limit=${limit}`),
    
  listCompany: (page = 1, limit = 20) => 
    apiFetch<any>(`/applications/company?page=${page}&limit=${limit}`),
    
  listRecruiter: (page = 1, limit = 20) => 
    apiFetch<any>(`/applications/recruiter?page=${page}&limit=${limit}`),
    
  updateStatus: (id: number, status: string, note?: string) => 
    apiFetch<any>(`/applications/${id}/status`, { 
      method: 'PUT', 
      body: JSON.stringify({ status, note }) 
    }),
    
  assignRecruiter: (id: number, recruiterId: number) => 
    apiFetch<any>(`/applications/${id}/assign-recruiter`, { 
      method: 'PUT', 
      body: JSON.stringify({ recruiter_id: recruiterId }) 
    }),
};

export const AdminAPI = {
  getStats: () => 
    apiFetch<any>('/admin/stats'),
    
  listApplications: (page = 1, limit = 20) => 
    apiFetch<any>(`/admin/applications?page=${page}&limit=${limit}`),
    
  getRecentActivity: (limit = 20) => 
    apiFetch<any[]>(`/admin/recent-activity?limit=${limit}`),
};

export const JobAPI = {
  listAll: (limit = 100) => 
    apiFetch<any>(`/jobs?limit=${limit}`)
};

export const InterviewAPI = {
  schedule: (data: any) => 
    apiFetch<any>('/interviews', { method: 'POST', body: JSON.stringify(data) }),

  listCandidate: (page = 1, limit = 20) => 
    apiFetch<any>(`/interviews/candidate?page=${page}&limit=${limit}`),

  listCompany: (page = 1, limit = 20) => 
    apiFetch<any>(`/interviews/company?page=${page}&limit=${limit}`),

  listRecruiter: (page = 1, limit = 20) => 
    apiFetch<any>(`/interviews/recruiter?page=${page}&limit=${limit}`),

  respond: (id: number, action: string, reason?: string, proposedDate?: string) => 
    apiFetch<any>(`/interviews/${id}/respond`, { 
      method: 'PUT', 
      body: JSON.stringify({ action, reason, proposed_date: proposedDate }) 
    }),

  submitFeedback: (id: number, feedback: any) => 
    apiFetch<any>(`/interviews/${id}/feedback`, { 
      method: 'PUT', 
      body: JSON.stringify(feedback) 
    }),

  makeDecision: (id: number, decision: string, notes?: string, nextRoundType?: string) => 
    apiFetch<any>(`/interviews/${id}/decision`, { 
      method: 'PUT', 
      body: JSON.stringify({ decision, decision_notes: notes, next_round_type: nextRoundType }) 
    }),
};
