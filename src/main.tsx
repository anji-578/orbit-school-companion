import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/plus-jakarta-sans/wght.css'
import '@fontsource-variable/inter/wght.css'
import '@fontsource/noto-sans-telugu/400.css'
import '@fontsource/noto-sans-telugu/600.css'
import '@fontsource/noto-sans-telugu/700.css'
import './index.css'
import App from './App.tsx'
import { registerOrbitServiceWorker } from './lib/alerts'
import { initSentry } from './services/logger/sentry'

initSentry()
void registerOrbitServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
