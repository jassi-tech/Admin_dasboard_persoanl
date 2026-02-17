// Utility to manage user profile data
import { getCredentials } from './credentials';

const PROFILE_KEY = 'user_profile_v1';

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  role?: string;
}

export const getUserProfile = (): UserProfile => {
  if (typeof window === 'undefined') {
    return { name: 'Admin User', email: 'admin@example.com', role: 'Administrator' };
  }

  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Fallback to credentials if no profile exists
    const creds = getCredentials();
    if (creds) {
      const derivedName = creds.email.split('@')[0];
      const name = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);
      return {
        name: name,
        email: creds.email,
        role: 'Administrator',
        bio: 'System Administrator'
      };
    }
  } catch (error) {
    console.warn('Failed to load profile', error);
  }

  return { name: 'Admin User', email: 'admin@example.com', role: 'Administrator' };
};

export const saveUserProfile = (profile: Partial<UserProfile>) => {
  try {
    const current = getUserProfile();
    const updated = { ...current, ...profile };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    // Dispatch a custom event to notify components of the update
    window.dispatchEvent(new Event('profileUpdated'));
    return updated;
  } catch (error) {
    console.warn('Failed to save profile', error);
  }
};

export const clearUserProfile = () => {
  try {
    localStorage.removeItem(PROFILE_KEY);
    window.dispatchEvent(new Event('profileUpdated'));
  } catch (error) {
    console.warn('Failed to clear profile', error);
  }
};
