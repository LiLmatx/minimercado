import { useState, useEffect } from 'react'
import api from '../Services/api'

function Vendas() {
  const [produtos, setProdutos] = useState([])
  const [carrinho, setCarrinho] = useState([])
  const [busca, setBusca] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('dinheiro')
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' })
  const [vendas, setVendas] = useState([])

  useEffect(() => {
    carregarProdutos()
    carregarVendas()
  }, [])

  async function carregarProdutos() {
    const { data } = await api.get('/produtos')
    setProdutos(data)
  }

  async function carregarVendas() {
    const { data } = await api.get('/vendas')
    setVendas(data)
  }

  function adicionarAoCarrinho(produto) {
    const existe = carrinho.find(i => i.produto_id === produto.id)
    if (existe) {
      setCarrinho(carrinho.map(i => i.produto_id === produto.id
        ? { ...i, quantidade: i.quantidade + 1 } : i))
    } else {
      setCarrinho([...carrinho, {
        produto_id: produto.id,
        nome: produto.nome,
        preco_unitario: parseFloat(produto.preco_venda),
        quantidade: 1
      }])
    }
    setBusca('')
  }

  function removerDoCarrinho(produto_id) {
    setCarrinho(carrinho.filter(i => i.produto_id !== produto_id))
  }

  function alterarQuantidade(produto_id, quantidade) {
    if (quantidade < 1) return
    setCarrinho(carrinho.map(i => i.produto_id === produto_id ? { ...i, quantidade } : i))
  }

  const total = carrinho.reduce((acc, i) => acc + i.quantidade * i.preco_unitario, 0)

  const produtosFiltrados = busca.length > 1
    ? produtos.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase()) || p.codigo_barras?.includes(busca))
    : []

  async function finalizarVenda() {
    if (carrinho.length === 0) return
    try {
      await api.post('/vendas', { itens: carrinho, forma_pagamento: formaPagamento })
      setMensagem({ texto: 'Venda finalizada com sucesso!', tipo: 'sucesso' })
      setCarrinho([])
      carregarVendas()
    } catch (err) {
      setMensagem({ texto: err.response?.data?.erro || 'Erro ao finalizar venda.', tipo: 'erro' })
    }
    setTimeout(() => setMensagem({ texto: '', tipo: '' }), 4000)
  }

  const badgePagamento = {
    dinheiro: 'bg-green-100 text-green-700',
    pix: 'bg-blue-100 text-blue-700',
    debito: 'bg-yellow-100 text-yellow-700',
    credito: 'bg-purple-100 text-purple-700',
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Coluna principal */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">PDV — Ponto de Venda</h2>
            <input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar produto por nome ou código de barras..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
            />
            {produtosFiltrados.length > 0 && (
              <div className="mt-2 border border-gray-200 rounded-xl shadow-md overflow-hidden">
                {produtosFiltrados.map(p => (
                  <div key={p.id} onClick={() => adicionarAoCarrinho(p)}
                    className="flex justify-between items-center px-4 py-3 hover:bg-violet-50 cursor-pointer border-b last:border-0 transition-colors">
                    <span className="text-sm font-medium text-gray-700">{p.nome}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-400">estoque: {p.estoque_atual}</span>
                      <span className="text-sm font-bold text-violet-600">R$ {parseFloat(p.preco_venda).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Últimas vendas */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Últimas vendas</h3>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Pagamento</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {vendas.slice(0, 10).map(v => (
                    <tr key={v.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-500">#{v.id}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-800">R$ {parseFloat(v.total).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgePagamento[v.forma_pagamento] || 'bg-gray-100 text-gray-600'}`}>
                          {v.forma_pagamento}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{new Date(v.criado_em).toLocaleString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Carrinho */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 h-fit sticky top-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Carrinho</h3>

          {mensagem.texto && (
            <div className={`mb-3 px-3 py-2 rounded-lg text-sm ${mensagem.tipo === 'erro' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {mensagem.texto}
            </div>
          )}

          {carrinho.length === 0
            ? <p className="text-gray-400 text-sm text-center py-6">Nenhum produto adicionado.</p>
            : <div className="space-y-3 mb-4">
                {carrinho.map(item => (
                  <div key={item.produto_id} className="flex flex-col gap-1 border-b pb-3">
                    <span className="text-sm font-medium text-gray-700">{item.nome}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => alterarQuantidade(item.produto_id, item.quantidade - 1)}
                        className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold transition-colors">−</button>
                      <span className="text-sm w-6 text-center">{item.quantidade}</span>
                      <button onClick={() => alterarQuantidade(item.produto_id, item.quantidade + 1)}
                        className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold transition-colors">+</button>
                      <span className="ml-auto text-sm font-semibold text-violet-600">
                        R$ {(item.quantidade * item.preco_unitario).toFixed(2)}
                      </span>
                      <button onClick={() => removerDoCarrinho(item.produto_id)}
                        className="w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 text-red-500 text-xs font-bold transition-colors">✕</button>
                    </div>
                  </div>
                ))}
              </div>
          }

          <div className="text-xl font-bold text-gray-800 mb-4">
            Total: <span className="text-violet-600">R$ {total.toFixed(2)}</span>
          </div>

          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Forma de pagamento</label>
            <select value={formaPagamento} onChange={e => setFormaPagamento(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">
              <option value="dinheiro">Dinheiro</option>
              <option value="debito">Débito</option>
              <option value="credito">Crédito</option>
              <option value="pix">Pix</option>
            </select>
          </div>

          <button onClick={finalizarVenda} disabled={carrinho.length === 0}
            className={`w-full py-3 rounded-xl font-semibold text-white transition-all
              ${carrinho.length === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 shadow-md hover:shadow-lg'}`}>
            Finalizar venda
          </button>
        </div>

      </div>
    </div>
  )
}

export default Vendas