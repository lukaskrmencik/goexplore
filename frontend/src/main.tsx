import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App.tsx'
import { registerSW } from 'virtual:pwa-register';

if (import.meta.env.PROD) {
  try {
    registerSW({
      immediate: true,
      onRegisterError(err) {
        console.warn('PWA: registrace service workeru selhala', err);
      },
    });
  } catch (e) {
    console.warn('PWA: registerSW vyhodil výjimku', e);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

