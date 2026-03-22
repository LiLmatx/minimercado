import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import PrimeiroAcesso from './pages/PrimeiroAcesso'
import Produtos from './pages/Produtos'
import Vendas from './pages/Vendas'
import Estoque from './pages/Estoque'
import Usuarios from './pages/Usuarios'

function RotaProtegida({ children }) {
  const { usuario } = useAuth()
  if (!usuario) return <Navigate to="/login" />
  return (
    <>
      <Navbar />
      <div className="p-6">{children}</div>
    </>
  )
}

function AppRoutes() {
  const { usuario } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={usuario ? <Navigate to="/vendas" /> : <Login />} />
      <Route path="/primeiro-acesso" element={<PrimeiroAcesso />} />
      <Route path="/vendas"   element={<RotaProtegida><Vendas /></RotaProtegida>} />
      <Route path="/produtos" element={<RotaProtegida><Produtos /></RotaProtegida>} />
      <Route path="/estoque"  element={<RotaProtegida><Estoque /></RotaProtegida>} />
      <Route path="/usuarios" element={<RotaProtegida><Usuarios /></RotaProtegida>} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}