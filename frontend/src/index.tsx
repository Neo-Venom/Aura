import React from 'react';
import ReactDOM from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import './styles/tokens.css';
import './styles/globals.css';
import { Providers } from './app/providers';
import { AppRoutes } from './app/routes';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Providers>
      <AppRoutes />
      <Analytics />
    </Providers>
  </React.StrictMode>,
);
