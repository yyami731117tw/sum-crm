import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/layout/Layout';
import { Login } from './components/auth/Login';
import { Dashboard } from './components/Dashboard';
import { TableView } from './components/TableView';
import { PermissionManager } from './components/admin/PermissionManager';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { Home } from './components/Home';

const App: React.FC = () => {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ''}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/app" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="tables" element={<TableView />} />
              <Route path="admin/permissions" element={<PermissionManager />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App; 