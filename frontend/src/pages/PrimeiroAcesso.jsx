import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../Services/api'

export default function PrimeiroAcesso() {
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const { state } = useLocation()

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    if (senha !== confirmar) return setErro('As senhas não coincidem.')
    if (senha.length < 6) return setErro('A senha deve ter no mínimo 6 caracteres.')

    setLoading(true)
    try {
      const { data } = await api.post('/auth/definir-senha', {
        usuario_id: state?.usuario_id,
        senha
      })
      login(data.token, data.usuario)
      navigate('/vendas')
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao definir senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-2xl mb-4">
            <span style={{fontSize: '28px'}}>🔑</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Primeiro acesso</h1>
          <p className="text-gray-500 text-sm mt-1">Crie sua senha para continuar</p>
        </div>

        {erro && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Nova senha</label>
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)}
              required placeholder="Mínimo 6 caracteres"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Confirmar senha</label>
            <input type="password" value={confirmar} onChange={e => setConfirmar(e.target.value)}
              required placeholder="Repita a senha"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-semibold rounded-xl transition-all shadow-md disabled:opacity-60">
            {loading ? 'Salvando...' : 'Definir senha e entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}