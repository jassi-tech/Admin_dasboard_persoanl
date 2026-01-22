import { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';

export const useIsAuthenticated = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check cookie on client side after mount
    const token = getCookie('auth_token');
    setAuthToken(token as string | undefined);
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  return { isAuthenticated, authToken, isLoading };
};
