import { useEffect } from 'react';
import { useRouter } from '@/navigation';
import { useLocale } from 'next-intl';
import { App } from 'antd';

/**
 * Hook to handle auto logout when browser tab is closed
 * Uses unload/beforeunload events to detect browser close
 */
export const useAutoLogout = () => {
  const router = useRouter();
  const locale = useLocale();
  const { message } = App.useApp();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Attempt to notify backend of logout (may not complete due to browser close)
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, { 
          method: 'POST',
          keepalive: true // Keep connection alive even if page closes
        });
      } catch (error) {
        console.error('Logout notification failed:', error);
      }

      // Clear authentication token from cookies
      document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      document.cookie = "remember_me=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      
      // Clear local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('__secure_auth_v1__');
      }
    };

    // Handle tab/window closure
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      handleLogout();
      // Return value for older browsers
      return undefined;
    };

    // Handle page unload (browser close, tab close, navigation away)
    const handleUnload = () => {
      handleLogout();
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);

    // Cleanup listeners on component unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, [router, locale, message]);
};
