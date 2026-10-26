import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './hooks/useAuth';
import { SiteSettingsProvider } from './hooks/useSiteSettings';
import { ToastProvider } from './hooks/useToast';
import './styles/globals.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

// Vite's BASE_URL is "/" on Vercel and "/KILSTA-WEBSITE/" on GitHub Pages.
const basename =
  import.meta.env.BASE_URL === '/' ? '/' : import.meta.env.BASE_URL.replace(/\/+$/, '');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter basename={basename}>
        <AuthProvider>
          <SiteSettingsProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </SiteSettingsProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
