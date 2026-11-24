// Import Sentry before anything else, so it can capture errors during startup
import '../instrument';
import * as Sentry from '@sentry/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n'; // Import the i18n configuration to initialize translations
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<p>Something went wrong.</p>}>
      <main className="p-6 mb-2">
        <App />
      </main>
    </Sentry.ErrorBoundary>
  </StrictMode>,
);
