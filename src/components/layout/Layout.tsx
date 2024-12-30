import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/layout/Layout.css';

export const Layout: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { 
      id: 'dashboard',
      text: '儀表板', 
      path: '/app/dashboard',
      icon: '📊'
    },
    { 
      id: 'tables',
      text: '表格管理', 
      path: '/app/tables',
      icon: '📋'
    },
    { 
      id: 'permissions',
      text: '權限管理', 
      path: '/app/admin/permissions',
      icon: '🔒'
    },
  ];

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="workspace-info">
            <span className="workspace-icon">🏢</span>
            <span className="workspace-name">我的工作區</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.text}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <span className="user-avatar">
              {user?.username?.[0]?.toUpperCase() || '?'}
            </span>
            <span className="user-name">{user?.username}</span>
          </div>
          <button className="logout-button" onClick={logout}>
            登出
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
}; 