export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const DEFAULT_WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919000000000';

export function formatINR(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === '') return '₹0';
  const num = typeof amount === 'string' ? Number(amount) : amount;
  if (Number.isNaN(num)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}

export function buildWhatsAppUrl(message: string, phone = DEFAULT_WHATSAPP_NUMBER): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '') || DEFAULT_WHATSAPP_NUMBER;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('kiran_access_token');
}

export function setStoredToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    window.localStorage.setItem('kiran_access_token', token);
  } else {
    window.localStorage.removeItem('kiran_access_token');
  }
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
    cache: options.cache ?? 'no-store',
  });

  if (!res.ok) {
    let errMessage = `Request failed (${res.status})`;
    try {
      const errBody = await res.json();
      if (Array.isArray(errBody?.details) && errBody.details.length > 0) {
        errMessage = errBody.details.join(', ');
      } else if (errBody?.message) {
        errMessage = Array.isArray(errBody.message)
          ? errBody.message.join(', ')
          : errBody.message;
      }
    } catch {
      // ignore json parse failure
    }
    throw new Error(errMessage);
  }

  return res.json();
}
