const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/estoque/:produto_id/historico — histórico de movimentações
router.get('/:produto_id/historico', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM movimentacoes_estoque
       WHERE produto_id = $1
       ORDER BY criado_em DESC`,
      [req.params.produto_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST /api/estoque/entrada — registra entrada de produtos
router.post('/entrada', async (req, res) => {
  const { produto_id, quantidade, motivo, observacao } = req.body;

  if (!produto_id || !quantidade) {
    return res.status(400).json({ erro: 'produto_id e quantidade são obrigatórios.' });
  }

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // Registra a movimentação
    await client.query(
      `INSERT INTO movimentacoes_estoque (produto_id, tipo, quantidade, motivo, observacao)
       VALUES ($1, 'entrada', $2, $3, $4)`,
      [produto_id, quantidade, motivo || 'compra', observacao]
    );

    // Atualiza o estoque
    const { rows } = await client.query(
      `UPDATE produtos SET estoque_atual = estoque_atual + $1, atualizado_em = NOW()
       WHERE id = $2 RETURNING id, nome, estoque_atual`,
      [quantidade, produto_id]
    );

    await client.query('COMMIT');
    res.status(201).json({
      mensagem: 'Entrada registrada com sucesso.',
      produto: rows[0]
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ erro: err.message });
  } finally {
    client.release();
  }
});

// POST /api/estoque/saida — registra saída manual (perda, ajuste etc.)
router.post('/saida', async (req, res) => {
  const { produto_id, quantidade, motivo, observacao } = req.body;

  if (!produto_id || !quantidade) {
    return res.status(400).json({ erro: 'produto_id e quantidade são obrigatórios.' });
  }

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // Verifica se há estoque suficiente
    const { rows: produto } = await client.query(
      'SELECT estoque_atual FROM produtos WHERE id = $1',
      [produto_id]
    );
    if (produto[0].estoque_atual < quantidade) {
      await client.query('ROLLBACK');
      return res.status(400).json({ erro: 'Estoque insuficiente.' });
    }

    await client.query(
      `INSERT INTO movimentacoes_estoque (produto_id, tipo, quantidade, motivo, observacao)
       VALUES ($1, 'saida', $2, $3, $4)`,
      [produto_id, quantidade, motivo || 'ajuste', observacao]
    );

    const { rows } = await client.query(
      `UPDATE produtos SET estoque_atual = estoque_atual - $1, atualizado_em = NOW()
       WHERE id = $2 RETURNING id, nome, estoque_atual`,
      [quantidade, produto_id]
    );

    await client.query('COMMIT');
    res.status(201).json({
      mensagem: 'Saída registrada com sucesso.',
      produto: rows[0]
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ erro: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
