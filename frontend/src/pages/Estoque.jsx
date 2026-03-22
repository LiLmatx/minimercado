import { useState, useEffect } from 'react'
import api from '../Services/api'

function Estoque() {
  const [produtos, setProdutos] = useState([])
  const [form, setForm] = useState({ produto_id: '', quantidade: '', tipo: 'entrada', motivo: '', observacao: '' })
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' })

  useEffect(() => { carregarProdutos() }, [])

  async function carregarProdutos() {
    const { data } = await api.get('/produtos')
    setProdutos(data)
  }

  async function salvar(e) {
    e.preventDefault()
    try {
      await api.post(`/estoque/${form.tipo}`, form)
      setMensagem({ texto: `${form.tipo === 'entrada' ? 'Entrada' : 'Saída'} registrada com sucesso!`, tipo: 'sucesso' })
      setForm({ produto_id: '', quantidade: '', tipo: 'entrada', motivo: '', observacao: '' })
      carregarProdutos()
    } catch (err) {
      setMensagem({ texto: err.response?.data?.erro || 'Erro ao registrar movimentação.', tipo: 'erro' })
    }
    setTimeout(() => setMensagem({ texto: '', tipo: '' }), 3000)
  }

  const baixoEstoque = produtos.filter(p => p.estoque_atual <= p.estoque_minimo)

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Estoque</h2>

      {/* Alerta estoque baixo */}
      {baixoEstoque.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-red-700 font-semibold mb-2">Produtos com estoque baixo:</p>
          <div className="flex flex-wrap gap-2">
            {baixoEstoque.map(p => (
              <span key={p.id} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                {p.nome} — {p.estoque_atual} un
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Formulário */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Registrar movimentação</h3>

        {mensagem.texto && (
          <div className={`mb-4 px-4 py-2 rounded-lg text-sm ${mensagem.tipo === 'erro' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            {mensagem.texto}
          </div>
        )}

        <form onSubmit={salvar} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Produto *</label>
            <select value={form.produto_id} onChange={e => setForm({ ...form, produto_id: e.target.value })}
              required className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">
              <option value="">Selecione...</option>
              {produtos.map(p => (
                <option key={p.id} value={p.id}>{p.nome} (estoque: {p.estoque_atual})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Tipo *</label>
            <div className="flex gap-3 mt-1">
              <button type="button" onClick={() => setForm({ ...form, tipo: 'entrada' })}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all
                  ${form.tipo === 'entrada'
                    ? 'bg-green-500 text-white border-green-500'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-green-300'}`}>
                Entrada
              </button>
              <button type="button" onClick={() => setForm({ ...form, tipo: 'saida' })}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all
                  ${form.tipo === 'saida'
                    ? 'bg-red-500 text-white border-red-500'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-red-300'}`}>
                Saída
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Quantidade *</label>
            <input type="number" min="1" value={form.quantidade}
              onChange={e => setForm({ ...form, quantidade: e.target.value })}
              required className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Motivo</label>
            <input value={form.motivo} onChange={e => setForm({ ...form, motivo: e.target.value })}
              placeholder="ex: compra, perda, ajuste"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
          </div>

          <div className="md:col-span-2">
            <button type="submit"
              className={`px-6 py-2 text-white font-semibold rounded-xl shadow transition-all
                ${form.tipo === 'entrada'
                  ? 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600'
                  : 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600'}`}>
              Registrar {form.tipo === 'entrada' ? 'entrada' : 'saída'}
            </button>
          </div>
        </form>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Produto</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estoque atual</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estoque mínimo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Situação</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map(p => (
              <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-800">{p.nome}</td>
                <td className="px-4 py-3 text-sm font-bold text-gray-700">{p.estoque_atual}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{p.estoque_minimo}</td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold
                    ${p.estoque_atual <= p.estoque_minimo
                      ? 'bg-red-100 text-red-600'
                      : 'bg-green-100 text-green-700'}`}>
                    {p.estoque_atual <= p.estoque_minimo ? 'Estoque baixo' : 'Normal'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Estoque