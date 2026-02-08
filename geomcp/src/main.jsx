import 'leaflet/dist/leaflet.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'
import '@geoman-io/leaflet-geoman-free'
import { GeoJsonProvider } from './state/GeoJsonContext'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <GeoJsonProvider>
        <App />
      </GeoJsonProvider>
    </BrowserRouter>
  </StrictMode>,
)

