import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/auth/Login.css';

export const Login: React.FC = () => {
  const { login, error } = useAuth();

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>歡迎使用 CRM 系統</h1>
        <p>請使用您的 Google 帳戶登入</p>
        
        <div className="login-methods">
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              login(credentialResponse);
            }}
            onError={() => {
              console.log('Login Failed');
            }}
            useOneTap
          />
        </div>

        {error && <div className="login-error">{error}</div>}
        
        <div className="login-footer">
          <p>登入即表示您同意我們的</p>
          <div className="login-links">
            <a href="/terms">服務條款</a>
            <span>&</span>
            <a href="/privacy">隱私政策</a>
          </div>
        </div>
      </div>
    </div>
  );
}; 