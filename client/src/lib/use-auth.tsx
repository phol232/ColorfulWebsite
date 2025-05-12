// src/lib/use-auth.ts
import { useState, useEffect } from 'react';

/**
 * useAuth hook: gestiona estado de autenticación basado en token en localStorage
 */
export function useAuth() {
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setUser(token);
    setIsLoading(false);
  }, []);

  return { user, isLoading };
}