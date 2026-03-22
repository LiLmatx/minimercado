import { useState, useEffect } from 'react'
import api from '../Services/api'

function Produtos() {
  const [produtos, setProdutos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [form, setForm] = useState({ nome: '', codigo_barras: '', preco_venda: '', preco_custo: '', estoque_minimo: '5', categoria_id: '' })
  const [editando, setEditando] = useState(null)
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' })
  const [novaCategoria, setNovaCategoria] = useState('')
  const [mostrarCategoria, setMostrarCategoria] = useState(false)

  useEffect(() => {
    carregarProdutos()
    carregarCategorias()
  }, [])

  async function carregarProdutos() {
    const { data } = await api.get('/produtos')
    setProdutos(data)
  }

  async function carregarCategorias() {
    const { data } = await api.get('/categorias')
    setCategorias(data)
  }

  async function salvar(e) {
    e.preventDefault()
    try {
      if (editando) {
        await api.put(`/produtos/${editando}`, form)
        setMensagem({ texto: 'Produto atualizado com sucesso!', tipo: 'sucesso' })
        setEditando(null)
      } else {
        await api.post('/produtos', form)
        setMensagem({ texto: 'Produto cadastrado com sucesso!', tipo: 'sucesso' })
      }
      setForm({ nome: '', codigo_barras: '', preco_venda: '', preco_custo: '', estoque_minimo: '5', categoria_id: '' })
      carregarProdutos()
    } catch (err) {
      setMensagem({ texto: err.response?.data?.erro || 'Erro ao salvar produto.', tipo: 'erro' })
    }
    setTimeout(() => setMensagem({ texto: '', tipo: '' }), 3000)
  }

  function iniciarEdicao(produto) {
    setEditando(produto.id)
    setForm({
      nome: produto.nome,
      codigo_barras: produto.codigo_barras || '',
      preco_venda: produto.preco_venda,
      preco_custo: produto.preco_custo || '',
      estoque_minimo: produto.estoque_minimo,
      categoria_id: produto.categoria_id || ''
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelarEdicao() {
    setEditando(null)
    setForm({ nome: '', codigo_barras: '', preco_venda: '', preco_custo: '', estoque_minimo: '5', categoria_id: '' })
  }

  async function excluir(produto) {
    if (!confirm(`Tem certeza que deseja excluir "${produto.nome}"? Esta ação não pode ser desfeita.`)) return
    try {
      await api.delete(`/produtos/${produto.id}`)
      setMensagem({ texto: 'Produto excluído com sucesso!', tipo: 'sucesso' })
      carregarProdutos()
    } catch (err) {
      setMensagem({ texto: 'Erro ao excluir produto.', tipo: 'erro' })
    }
    setTimeout(() => setMensagem({ texto: '', tipo: '' }), 3000)
  }

  async function salvarCategoria(e) {
    e.preventDefault()
    try {
      await api.post('/categorias', { nome: novaCategoria })
      setMensagem({ texto: 'Categoria criada com sucesso!', tipo: 'sucesso' })
      setNovaCategoria('')
      setMostrarCategoria(false)
      carregarCategorias()
    } catch (err) {
      setMensagem({ texto: err.response?.data?.erro || 'Erro ao criar categoria.', tipo: 'erro' })
    }
    setTimeout(() => setMensagem({ texto: '', tipo: '' }), 3000)
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Produtos</h2>
        <button onClick={() => setMostrarCategoria(!mostrarCategoria)}
          className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold rounded-xl text-sm transition-all">
          + Nova categoria
        </button>
      </div>

      {/* Form nova categoria */}
      {mostrarCategoria && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4">
          <form onSubmit={salvarCategoria} className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs font-semibold text-indigo-600 uppercase mb-1 block">Nome da categoria</label>
              <input value={novaCategoria} onChange={e => setNovaCategoria(e.target.value)}
                required placeholder="ex: Frios, Cereais..."
                className="w-full px-3 py-2 rounded-lg border border-indigo-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <button type="submit"
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl text-sm transition-all">
              Criar
            </button>
            <button type="button" onClick={() => setMostrarCategoria(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-xl text-sm transition-all">
              Cancelar
            </button>
          </form>
        </div>
      )}

      {/* Formulário produto */}
      <div className={`rounded-2xl shadow-sm border p-6 ${editando ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'}`}>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          {editando ? 'Editando produto' : 'Novo produto'}
        </h3>

        {mensagem.texto && (
          <div className={`mb-4 px-4 py-2 rounded-lg text-sm ${mensagem.tipo === 'erro' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            {mensagem.texto}
          </div>
        )}

        <form onSubmit={salvar} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Nome *</label>
            <input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })}
              required className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Código de barras</label>
            <input value={form.codigo_barras} onChange={e => setForm({ ...form, codigo_barras: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Preço de venda *</label>
            <input type="number" step="0.01" value={form.preco_venda}
              onChange={e => setForm({ ...form, preco_venda: e.target.value })}
              required className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Preço de custo</label>
            <input type="number" step="0.01" value={form.preco_custo}
              onChange={e => setForm({ ...form, preco_custo: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Estoque mínimo</label>
            <input type="number" value={form.estoque_minimo}
              onChange={e => setForm({ ...form, estoque_minimo: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Categoria</label>
            <select value={form.categoria_id} onChange={e => setForm({ ...form, categoria_id: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">
              <option value="">Selecione...</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div className="md:col-span-2 flex gap-3">
            <button type="submit"
              className={`px-6 py-2 text-white font-semibold rounded-xl shadow transition-all
                ${editando
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                  : 'bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600'}`}>
              {editando ? 'Salvar alterações' : 'Cadastrar produto'}
            </button>
            {editando && (
              <button type="button" onClick={cancelarEdicao}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-xl transition-all">
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nome</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Código</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Preço venda</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estoque</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Categoria</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map(p => (
              <tr key={p.id} className={`border-t border-gray-50 transition-colors ${editando === p.id ? 'bg-amber-50' : 'hover:bg-gray-50'}`}>
                <td className="px-4 py-3 text-sm font-medium text-gray-800">{p.nome}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{p.codigo_barras || '—'}</td>
                <td className="px-4 py-3 text-sm font-semibold text-violet-600">R$ {parseFloat(p.preco_venda).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold
                    ${p.estoque_atual <= p.estoque_minimo ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                    {p.estoque_atual} un
                  </span>
                </td>
                <td className="px-4 py-3">
                  {p.categoria_nome
                    ? <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">{p.categoria_nome}</span>
                    : <span className="text-gray-400 text-sm">—</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => iniciarEdicao(p)}
                      className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg text-xs font-medium transition-colors">
                      Editar
                    </button>
                    <button onClick={() => excluir(p)}
                      className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-medium transition-colors">
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Produtos