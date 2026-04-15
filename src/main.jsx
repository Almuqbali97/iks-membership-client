import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import faviconUrl from './assets/logo.avif'

const favicon = document.createElement('link')
favicon.rel = 'icon'
favicon.type = 'image/avif'
favicon.href = faviconUrl
document.head.appendChild(favicon)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
