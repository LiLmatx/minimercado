import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../Services/api'

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [form, setForm] = useState({ nome: '', email: '' })
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' })
  const { usuario } = useAuth()

  useEffect(() => { carregarUsuarios() }, [])

  async function carregarUsuarios() {
    try {
      const { data } = await api.get('/usuarios')
      setUsuarios(data)
    } catch (err) {
      console.log('Erro ao carregar usuários:', err.message)
    }
  }

  async function salvar(e) {
    e.preventDefault()
    try {
      await api.post('/usuarios', form)
      setMensagem({ texto: 'Usuário cadastrado! No primeiro login ele criará a senha.', tipo: 'sucesso' })
      setForm({ nome: '', email: '' })
      carregarUsuarios()
    } catch (err) {
      setMensagem({ texto: err.response?.data?.erro || 'Erro ao cadastrar.', tipo: 'erro' })
    }
    setTimeout(() => setMensagem({ texto: '', tipo: '' }), 4000)
  }

  async function desativar(id) {
    if (!confirm('Desativar este usuário?')) return
    await api.delete(`/usuarios/${id}`)
    carregarUsuarios()
  }

  if (usuario?.perfil !== 'master') {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <p className="text-red-600 font-semibold">Acesso restrito ao master.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Usuários</h2>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Novo usuário</h3>

        {mensagem.texto && (
          <div className={`mb-4 px-4 py-2 rounded-lg text-sm ${mensagem.tipo === 'erro' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            {mensagem.texto}
          </div>
        )}

        <form onSubmit={salvar} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Nome *</label>
            <input
              value={form.nome}
              onChange={e => setForm({ ...form, nome: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
          </div>
          <div className="md:col-span-2">
            <button type="submit"
              className="px-6 py-2 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white font-semibold rounded-xl shadow transition-all">
              Cadastrar usuário
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nome</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ação</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(u => (
              <tr key={u.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-800">
                  {u.nome}
                  {u.perfil === 'master' && (
                    <span className="ml-2 px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full text-xs">master</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.primeiro_acesso ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                    {u.primeiro_acesso ? 'Aguardando senha' : 'Ativo'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {u.perfil !== 'master' && (
                    <button onClick={() => desativar(u.id)}
                      className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-medium transition-colors">
                      Desativar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}