import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ModalProvider } from './ModalContext.jsx';
import { AppContextProvider } from './Providers.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppContextProvider>
      <ModalProvider>
        <App />
      </ModalProvider>
    </AppContextProvider>
  </StrictMode>
);
