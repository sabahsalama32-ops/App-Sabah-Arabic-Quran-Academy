import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';
import './styles/pdf-drawer.css';
import './styles/guided-assistant.css';
import './styles/learning-profile.css';
import './styles/board.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
