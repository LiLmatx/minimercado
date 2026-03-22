const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/vendas — lista vendas recentes
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT v.*,
        COUNT(iv.id) AS total_itens
      FROM vendas v
      LEFT JOIN itens_venda iv ON iv.venda_id = v.id
      GROUP BY v.id
      ORDER BY v.criado_em DESC
      LIMIT 100
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /api/vendas/:id — detalhes de uma venda com seus itens
router.get('/:id', async (req, res) => {
  try {
    const { rows: venda } = await db.query(
      'SELECT * FROM vendas WHERE id = $1',
      [req.params.id]
    );
    if (venda.length === 0) return res.status(404).json({ erro: 'Venda não encontrada.' });

    const { rows: itens } = await db.query(
      `SELECT iv.*, p.nome AS produto_nome
       FROM itens_venda iv
       JOIN produtos p ON p.id = iv.produto_id
       WHERE iv.venda_id = $1`,
      [req.params.id]
    );

    res.json({ ...venda[0], itens });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST /api/vendas — finaliza uma venda e baixa o estoque automaticamente
router.post('/', async (req, res) => {
  const { itens, forma_pagamento, desconto } = req.body;
  // itens: [{ produto_id, quantidade, preco_unitario }]

  if (!itens || itens.length === 0) {
    return res.status(400).json({ erro: 'A venda precisa ter pelo menos um item.' });
  }
  if (!forma_pagamento) {
    return res.status(400).json({ erro: 'Forma de pagamento é obrigatória.' });
  }

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // Verifica estoque de todos os itens antes de iniciar
    for (const item of itens) {
      const { rows } = await client.query(
        'SELECT nome, estoque_atual FROM produtos WHERE id = $1 AND ativo = TRUE',
        [item.produto_id]
      );
      if (rows.length === 0) throw new Error(`Produto ID ${item.produto_id} não encontrado.`);
      if (rows[0].estoque_atual < item.quantidade) {
        throw new Error(`Estoque insuficiente para "${rows[0].nome}". Disponível: ${rows[0].estoque_atual}`);
      }
    }

    // Calcula o total
    const total = itens.reduce((acc, item) => acc + item.quantidade * item.preco_unitario, 0);
    const totalComDesconto = total - (desconto || 0);

    // Cria o cabeçalho da venda
    const { rows: vendaRows } = await client.query(
      `INSERT INTO vendas (total, desconto, forma_pagamento)
       VALUES ($1, $2, $3) RETURNING *`,
      [totalComDesconto, desconto || 0, forma_pagamento]
    );
    const vendaId = vendaRows[0].id;

    // Insere os itens e baixa o estoque
    for (const item of itens) {
      await client.query(
        `INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario)
         VALUES ($1, $2, $3, $4)`,
        [vendaId, item.produto_id, item.quantidade, item.preco_unitario]
      );

      await client.query(
        `UPDATE produtos SET estoque_atual = estoque_atual - $1, atualizado_em = NOW()
         WHERE id = $2`,
        [item.quantidade, item.produto_id]
      );

      await client.query(
        `INSERT INTO movimentacoes_estoque (produto_id, tipo, quantidade, motivo)
         VALUES ($1, 'saida', $2, 'venda')`,
        [item.produto_id, item.quantidade]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({
      mensagem: 'Venda registrada com sucesso.',
      venda_id: vendaId,
      total: totalComDesconto
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ erro: err.message });
  } finally {
    client.release();
  }
});

// GET /api/vendas/relatorio/dia — total de vendas do dia
router.get('/relatorio/dia', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT
        COUNT(*) AS total_vendas,
        SUM(total) AS faturamento,
        forma_pagamento
      FROM vendas
      WHERE DATE(criado_em) = CURRENT_DATE
      GROUP BY forma_pagamento
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
