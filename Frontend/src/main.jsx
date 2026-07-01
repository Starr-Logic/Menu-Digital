import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './i18n.js';

import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext.jsx';

document.documentElement.setAttribute('data-theme', 'light');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </StrictMode>,
);
