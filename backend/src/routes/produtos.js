const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/produtos — lista todos os produtos ativos
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT p.*, c.nome AS categoria_nome
      FROM produtos p
      LEFT JOIN categorias c ON c.id = p.categoria_id
      WHERE p.ativo = TRUE
      ORDER BY p.nome
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /api/produtos/estoque-baixo — produtos abaixo do mínimo
router.get('/estoque-baixo', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT * FROM produtos
      WHERE ativo = TRUE AND estoque_atual <= estoque_minimo
      ORDER BY estoque_atual ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /api/produtos/:id — busca produto por ID
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM produtos WHERE id = $1 AND ativo = TRUE',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ erro: 'Produto não encontrado.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /api/produtos/barcode/:codigo — busca por código de barras (útil no PDV)
router.get('/barcode/:codigo', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM produtos WHERE codigo_barras = $1 AND ativo = TRUE',
      [req.params.codigo]
    );
    if (rows.length === 0) return res.status(404).json({ erro: 'Produto não encontrado.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST /api/produtos — cria novo produto
router.post('/', async (req, res) => {
  const { nome, codigo_barras, preco_venda, preco_custo, estoque_atual, estoque_minimo, categoria_id } = req.body;

  if (!nome || !preco_venda) {
    return res.status(400).json({ erro: 'Nome e preço de venda são obrigatórios.' });
  }

  try {
    const { rows } = await db.query(
      `INSERT INTO produtos (nome, codigo_barras, preco_venda, preco_custo, estoque_atual, estoque_minimo, categoria_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [nome, codigo_barras, preco_venda, preco_custo, estoque_atual || 0, estoque_minimo || 5, categoria_id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// PUT /api/produtos/:id — atualiza produto
router.put('/:id', async (req, res) => {
  const { nome, codigo_barras, preco_venda, preco_custo, estoque_minimo, categoria_id } = req.body;
  try {
    const { rows } = await db.query(
      `UPDATE produtos SET
        nome = COALESCE($1, nome),
        codigo_barras = COALESCE($2, codigo_barras),
        preco_venda = COALESCE($3, preco_venda),
        preco_custo = COALESCE($4, preco_custo),
        estoque_minimo = COALESCE($5, estoque_minimo),
        categoria_id = COALESCE($6, categoria_id),
        atualizado_em = NOW()
       WHERE id = $7 AND ativo = TRUE RETURNING *`,
      [nome, codigo_barras, preco_venda, preco_custo, estoque_minimo, categoria_id, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ erro: 'Produto não encontrado.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// DELETE /api/produtos/:id — desativa produto (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    await db.query('UPDATE produtos SET ativo = FALSE WHERE id = $1', [req.params.id]);
    res.json({ mensagem: 'Produto desativado com sucesso.' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
