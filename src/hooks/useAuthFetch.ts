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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      console.error(`Auth error at ${endpoint}:`, error);
      message.error('Connection error');
      return null;
    }
  };

  return { authFetch };
};
