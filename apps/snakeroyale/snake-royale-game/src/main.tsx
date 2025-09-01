import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ws } from './lib/ws'

// Mark embedded mode when running inside an iframe
try {
  if (window.top !== window.self) {
    document.body.classList.add('embedded');
    document.documentElement.classList.add('embedded-root');
  }
} catch {}

createRoot(document.getElementById('root')!).render(<App />);

// Start WebSocket connection globally
ws.connect();
