import { useCallback, useContext } from 'react';
import { CredentialResponse } from '@react-oauth/google';
import jwtDecode from 'jwt-decode';
import { AuthContext } from '../contexts/AuthContext';
import { GoogleUser, User } from '../types/auth';

export const useAuth = () => {
  const { state, dispatch } = useContext(AuthContext);

  const login = useCallback(async (response: CredentialResponse) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      if (!response.credential) {
        throw new Error('No credentials received');
      }

      // 解碼 Google 令牌
      const decoded: GoogleUser = jwtDecode(response.credential);

      // 調用後端 API 進行認證
      const authResponse = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: response.credential }),
      });

      if (!authResponse.ok) {
        throw new Error('Authentication failed');
      }

      const data = await authResponse.json();

      // 保存用戶信息和令牌
      localStorage.setItem('token', data.token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: data.user });

    } catch (error) {
      dispatch({ 
        type: 'LOGIN_ERROR', 
        payload: error instanceof Error ? error.message : 'Login failed' 
      });
    }
  }, [dispatch]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  }, [dispatch]);

  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    login,
    logout,
  };
}; 