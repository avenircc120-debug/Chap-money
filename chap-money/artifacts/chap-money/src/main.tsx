import { createRoot } from 'react-dom/client';

import App from './App';

import './index.css';

// Register PWA service worker
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .catch(() => { /* SW registration failed silently */ });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
