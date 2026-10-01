import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/dashboard" element={<App />} />
        <Route path="/missions" element={<App />} />
        <Route path="/missions/new" element={<App />} />
        <Route path="/missions/:missionId" element={<App />} />
        <Route path="/conducteurs" element={<App />} />
        <Route path="/employes" element={<App />} />
        <Route path="/vehicules" element={<App />} />
        <Route path="/structures" element={<App />} />
        <Route path="/notifications" element={<App />} />
        <Route path="/parametres" element={<App />} />
        <Route path="/aide" element={<App />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
