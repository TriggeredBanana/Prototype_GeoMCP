import { Routes, Route, Navigate } from 'react-router-dom'
import IntroPage from './pages/IntroPage'
import HomePage from './pages/HomePage'
import FullMapPage from './pages/FullMapPage'

function RequireAccepted({ children }) {
  const accepted = localStorage.getItem('termsAccepted') === 'true'
  return accepted ? children : <Navigate to="/" replace />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<IntroPage />} />
      <Route
        path="/home"
        element={
          <RequireAccepted>
            <HomePage />
          </RequireAccepted>
        }
      />
      <Route
        path="/map"
        element={
          <RequireAccepted>
            <FullMapPage />
          </RequireAccepted>
        }
      />
    </Routes>
  )
}

export default App
