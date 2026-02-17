// Professional credentials encryption/decryption using base64 + additional obfuscation
// In production, use proper encryption library like crypto-js or TweetNaCl.js

const STORAGE_KEY = '__secure_auth_v1__';
const OBFUSCATION_PREFIX = 'sa_';

/**
 * JWT-like structure for client-side storage.
 * Format: base64(header).base64(payload).checksum
 */
export const encryptCredentials = (email: string, password: string): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ email, password, iat: Math.floor(Date.now() / 1000) }));
  
  // Simple checksum to mimic a signature for integrity
  const combined = `${header}.${payload}`;
  const checksum = btoa(combined.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0).toString());
  
  return `${combined}.${checksum}`;
};

export const decryptCredentials = (token: string): { email: string; password: string } | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, payload, checksum] = parts;
    
    // Verify checksum (integrity check)
    const combined = `${header}.${payload}`;
    const calculatedChecksum = btoa(combined.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0).toString());
    
    if (checksum !== calculatedChecksum) {
      console.error('Credential integrity check failed');
      return null;
    }

    const decodedPayload = JSON.parse(atob(payload));
    
    // Check if stored data is too old (> 30 days)
    const thirtyDaysInSec = 30 * 24 * 60 * 60;
    if (decodedPayload.iat && (Math.floor(Date.now() / 1000) - decodedPayload.iat) > thirtyDaysInSec) {
      console.warn('Stored credentials expired');
      return null;
    }
    
    return { email: decodedPayload.email, password: decodedPayload.password };
  } catch (error) {
    return null;
  }
};

export const saveCredentials = (email: string, password: string) => {
  try {
    const encrypted = encryptCredentials(email, password);
    localStorage.setItem(STORAGE_KEY, encrypted);
  } catch (error) {

  }
};

export const getCredentials = (): { email: string; password: string } | null => {
  try {
    const encrypted = localStorage.getItem(STORAGE_KEY);
    if (!encrypted) return null;
    return decryptCredentials(encrypted);
  } catch (error) {

    return null;
  }
};

export const clearAllSessionData = (preserveRememberMe: boolean = false) => {
  try {
    // 1. Clear Cookies
    const cookiesToClear = ['auth_token'];
    if (!preserveRememberMe) {
      cookiesToClear.push('remember_me');
    }
    
    cookiesToClear.forEach(name => {
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    });

    // 2. Clear Local Storage
    const keysToClear = ['user_profile_v1', 'admin_token', 'authToken', 'user', 'user_profile'];
    if (!preserveRememberMe) {
      keysToClear.push(STORAGE_KEY);
    }

    keysToClear.forEach(key => {
      localStorage.removeItem(key);
    });

    // 3. Notify components (like profile listeners)
    window.dispatchEvent(new Event('profileUpdated'));
    
  } catch (error) {
    console.warn('Failed to clear session data', error);
  }
};
