'use client';

import { ReactNode } from 'react';
import { useAutoLogout } from '@/hooks/useAutoLogout';

/**
 * Client-side wrapper component for auth session management
 * Handles auto logout on browser/tab close
 * 
 * Note: Wrapped around App component to ensure hooks run after hydration
 */
export const AuthSessionProvider = ({ children }: { children: ReactNode }) => {
  // useAutoLogout hook runs client-side only and doesn't affect DOM
  useAutoLogout();
  
  return <>{children}</>;
};
