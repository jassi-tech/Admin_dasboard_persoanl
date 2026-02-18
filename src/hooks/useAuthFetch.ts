import { App } from 'antd';
import { setCookie } from 'cookies-next';

interface AuthResponse {
  ok: boolean;
  message?: string;
  token?: string;
  [key: string]: any;
}

export const useAuthFetch = () => {
  const { message } = App.useApp();

    const authFetch = async (endpoint: string, data: any, rememberMe: boolean = false): Promise<AuthResponse | null> => {
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
      const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
      
      // Auto-append /api if missing (standard for our production deployments)
      if (!isDev && baseUrl && !baseUrl.endsWith('/api')) {
        baseUrl += '/api';
      }

      const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      
      const response = await fetch(`${baseUrl}${cleanEndpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        message.error(result.message || 'Request failed');
        return null;
      }

      // Save auth token if remember me is checked
      if (rememberMe && result.token) {
        setCookie('auth_token', result.token, { maxAge: 60 * 60 * 24 * 30 }); // 30 days
        setCookie('remember_me', 'true', { maxAge: 60 * 60 * 24 * 30 });
      }

      return result;
    } catch (error) {

      message.error('Connection error');
      return null;
    }
  };

  return { authFetch };
};
