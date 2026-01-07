import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Login from './pages/Login'
import Pricing from './pages/Pricing'
import Features from './pages/Features'
import Dashboard from './pages/Dashboard'
import Editor from './pages/Editor'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/features" element={<Features />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/course/:courseId" element={<Editor />} />
        <Route path="/course/:courseId/:challengeId" element={<Editor />} />
        <Route path="/course/:courseId/:challengeId/:sectionId" element={<Editor />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
