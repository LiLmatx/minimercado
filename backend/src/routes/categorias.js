const express = require('express')
const router = express.Router()
const db = require('../db')
const { autenticar, apenasMaster } = require('../middleware/auth')

router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM categorias ORDER BY nome')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

router.post('/', async (req, res) => {
  const { nome } = req.body
  if (!nome) return res.status(400).json({ erro: 'Nome é obrigatório.' })
  try {
    const { rows } = await db.query(
      'INSERT INTO categorias (nome) VALUES ($1) RETURNING *', [nome]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ erro: 'Categoria já existe.' })
    res.status(500).json({ erro: err.message })
  }
})

router.put('/:id', autenticar, apenasMaster, async (req, res) => {
  const { nome } = req.body
  if (!nome) return res.status(400).json({ erro: 'Nome é obrigatório.' })
  try {
    const { rows } = await db.query(
      'UPDATE categorias SET nome = $1 WHERE id = $2 RETURNING *',
      [nome, req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ erro: 'Categoria não encontrada.' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

router.delete('/:id', autenticar, apenasMaster, async (req, res) => {
  try {
    await db.query('DELETE FROM categorias WHERE id = $1', [req.params.id])
    res.json({ mensagem: 'Categoria excluída com sucesso.' })
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

module.exports = router