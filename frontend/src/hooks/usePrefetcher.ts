import { useEffect } from 'react';
import { runPwaPrefetch } from '../services/offlinePrefetcher';
import { AUTH_TOKEN_KEY } from '../utils/auth';

export const usePrefetcher = () => {
  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    
    if (token && navigator.onLine) {
      const timer = setTimeout(() => {
        runPwaPrefetch();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);
};