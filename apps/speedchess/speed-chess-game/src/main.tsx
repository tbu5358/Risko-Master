import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// If running inside an iframe (embedded in the browser app), apply compact layout tweaks
try {
  if (window.top !== window.self) {
    document.body.classList.add('embedded');
    // Also mark the root element so rem-based sizing can scale
    document.documentElement.classList.add('embedded-root');
  }
} catch {
  // Cross-origin access can throw; ignore and continue
}

createRoot(document.getElementById("root")!).render(<App />);
