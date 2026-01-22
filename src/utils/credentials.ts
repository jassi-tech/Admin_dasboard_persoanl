// Professional credentials encryption/decryption using base64 + additional obfuscation
// In production, use proper encryption library like crypto-js or TweetNaCl.js

const STORAGE_KEY = '__secure_auth_v1__';
const OBFUSCATION_PREFIX = 'sa_';

export const encryptCredentials = (email: string, password: string): string => {
  const credentials = JSON.stringify({ email, password, ts: Date.now() });
  const encoded = btoa(credentials); // Base64 encoding
  return OBFUSCATION_PREFIX + encoded;
};

export const decryptCredentials = (encrypted: string): { email: string; password: string } | null => {
  try {
    // Remove obfuscation prefix
    if (!encrypted.startsWith(OBFUSCATION_PREFIX)) {
      throw new Error('Invalid encrypted data format');
    }
    
    const encoded = encrypted.slice(OBFUSCATION_PREFIX.length);
    const credentials = JSON.parse(atob(encoded)); // Base64 decoding
    
    // Optional: Validate timestamp (check if stored data is too old, e.g., > 30 days)
    if (credentials.ts && Date.now() - credentials.ts > 30 * 24 * 60 * 60 * 1000) {
      console.warn('Stored credentials expired');
      return null;
    }
    
    return { email: credentials.email, password: credentials.password };
  } catch (error) {
    console.error('Failed to decrypt credentials:', error);
    return null;
  }
};

export const saveCredentials = (email: string, password: string) => {
  try {
    const encrypted = encryptCredentials(email, password);
    localStorage.setItem(STORAGE_KEY, encrypted);
  } catch (error) {
    console.error('Failed to save credentials:', error);
  }
};

export const getCredentials = (): { email: string; password: string } | null => {
  try {
    const encrypted = localStorage.getItem(STORAGE_KEY);
    if (!encrypted) return null;
    return decryptCredentials(encrypted);
  } catch (error) {
    console.error('Failed to retrieve credentials:', error);
    return null;
  }
};

export const clearCredentials = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear credentials:', error);
  }
};
