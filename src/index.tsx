import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css';
import { Dashboard } from './components/Dashboard';

if (process.env.REACT_APP_ENV === 'mock') {
  const { worker } = require('./mocks/browser');
  worker.start();
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Dashboard />
  </React.StrictMode>
); 