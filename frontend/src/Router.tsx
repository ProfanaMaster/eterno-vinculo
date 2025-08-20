import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import CreateProfile from './pages/wizard/CreateProfile'
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/create" element={<CreateProfile />} />
        <Route path="/create-memorial" element={<CreateProfile />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/test" element={<div className="min-h-screen flex items-center justify-center"><div className="text-center"><h1 className="text-4xl font-bold text-gray-900 mb-4">Sistema Funcionando</h1><p className="text-lg text-gray-600">Backend y Frontend conectados correctamente</p></div></div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default Router