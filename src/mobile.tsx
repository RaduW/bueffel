// Phone page: the shared styles plus phone-specific overrides
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './ui/App.tsx'
import './style.css'
import './mobile.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App variant="mobile" />
  </StrictMode>,
);
