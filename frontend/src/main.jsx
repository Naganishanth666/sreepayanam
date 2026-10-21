import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import App from './App.jsx'
import { installAwsApiTransport } from './utils/awsApiTransport.js'

if (import.meta.env.VITE_AWS_PRIVATE_ORIGIN === 'true') installAwsApiTransport()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
