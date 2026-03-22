import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { usuario, logout } = useAuth()

  const ativo = (path) => location.pathname === path

  function sair() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-xl p-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M7 9h10l-1.5 8H8.5L7 9z" fill="white"/>
              <path d="M9 9V7a3 3 0 016 0v2" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <span className="text-white font-bold text-lg tracking-wide">G&amp;M</span>
            <span className="text-white/70 text-xs ml-1 tracking-widest uppercase">Mercado</span>
          </div>
        </div>

        <div className="flex gap-2 flex-1">
          <Link to="/vendas" className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
            ${ativo('/vendas') ? 'bg-white text-violet-700 shadow' : 'text-white hover:bg-white/20'}`}>
            PDV
          </Link>
          <Link to="/produtos" className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
            ${ativo('/produtos') ? 'bg-white text-violet-700 shadow' : 'text-white hover:bg-white/20'}`}>
            Produtos
          </Link>
          <Link to="/estoque" className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
            ${ativo('/estoque') ? 'bg-white text-violet-700 shadow' : 'text-white hover:bg-white/20'}`}>
            Estoque
          </Link>
          {usuario?.perfil === 'master' && (
            <Link to="/usuarios" className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
              ${ativo('/usuarios') ? 'bg-white text-violet-700 shadow' : 'text-white hover:bg-white/20'}`}>
              Usuários
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-white/80 text-sm">Olá, {usuario?.nome}</span>
          <button onClick={sair}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-full transition-all">
            Sair
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar