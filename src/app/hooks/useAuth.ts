'use client';

import { useState, useEffect } from 'react';

export interface UserRoles {
  is_buyer: boolean;
  is_provider: boolean;
}

export function useAuth() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<UserRoles>({ is_buyer: false, is_provider: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Fast path: check localStorage
      const id = localStorage.getItem('nyxa_user_id');
      const name = localStorage.getItem('nyxa_user_name');
      const email = localStorage.getItem('nyxa_user_email');
      const rolesStr = localStorage.getItem('nyxa_user_roles');

      if (id) {
        setUserId(id);
        setUserName(name);
        setUserEmail(email);
        
        if (rolesStr) {
          try {
            const parsed = JSON.parse(rolesStr);
            if (Array.isArray(parsed)) {
              setUserRoles({
                is_buyer: parsed.includes('buyer'),
                is_provider: parsed.includes('provider')
              });
            } else {
              setUserRoles({
                is_buyer: !!parsed.is_buyer,
                is_provider: !!parsed.is_provider || !!parsed.is_developer || !!parsed.is_seller
              });
            }
          } catch (_e) {
            setUserRoles({ is_buyer: false, is_provider: false });
          }
        }
        setLoading(false);
        return; // Fast path successful
      }

      // Slow path: check server
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUserId(data.user.id);
            setUserName(data.user.name || data.user.email);
            setUserEmail(data.user.email);
            
            const rolesArr = data.user.roles || [];
            setUserRoles({
              is_buyer: rolesArr.includes('buyer'),
              is_provider: rolesArr.includes('provider')
            });

            localStorage.setItem('nyxa_user_id', data.user.id);
            localStorage.setItem('nyxa_user_name', data.user.name || data.user.email);
            localStorage.setItem('nyxa_user_email', data.user.email);
            localStorage.setItem('nyxa_user_roles', JSON.stringify(rolesArr));
          }
        }
      } catch (err) {
        console.error('Session fetch failed', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = async () => {
    localStorage.removeItem('nyxa_user_id');
    localStorage.removeItem('nyxa_user_name');
    localStorage.removeItem('nyxa_user_email');
    localStorage.removeItem('nyxa_user_roles');
    setUserId(null);
    setUserName(null);
    setUserEmail(null);
    setUserRoles({ is_buyer: false, is_provider: false });
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (_e) {
      console.error(_e);
    }
  };

  return { userId, userName, userEmail, userRoles, loading, logout };
}
