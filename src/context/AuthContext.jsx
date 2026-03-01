import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for persistent login
    const storedUser = localStorage.getItem('tobeauty_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (pin) => {
    try {
      setLoading(true);
      if (!pin) throw new Error('PIN inválido');

      // Fetch user matching the pin from team_members
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('pin_code', pin)
        .single();
        
      if (error || !data) {
        throw new Error('PIN incorreto ou utilizador não encontrado.');
      }

      // Format the user session object
      const sessionUser = {
        id: data.id,
        name: data.name,
        role: data.role,
        access_level: data.access_level || 'employee',
        color: data.color || '#3B82F6'
      };

      setUser(sessionUser);
      localStorage.setItem('tobeauty_user', JSON.stringify(sessionUser));
      return { success: true, user: sessionUser };
      
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tobeauty_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
