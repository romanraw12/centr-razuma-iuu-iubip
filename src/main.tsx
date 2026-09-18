import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { initSupabase } from './lib/supabase'
import './fonts.css'
import './index.css'
import './custom.css'

// Initialize Firebase before React renders. Component effects (useAuth,
// useData) run before App's effects, so initializing in an effect would let
// those hooks run against an uninitialized SDK on first paint.
initSupabase()

// Get basename from <base> tag (injected by builder with project ID)
// Falls back to /preview for local development
const baseTag = document.querySelector('base')
const basename = baseTag ? baseTag.getAttribute('href')?.replace(/\/$/, '') || '/preview' : '/preview'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

// Remove the no-transition guard after first paint so theme/color changes
// animate but the initial render does not flash.
requestAnimationFrame(() =>
  requestAnimationFrame(() => document.documentElement.classList.remove('preload'))
)