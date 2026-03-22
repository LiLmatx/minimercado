const express = require('express')
const router = express.Router()
const db = require('../db')
const { autenticar, apenasMaster } = require('../middleware/auth')

router.get('/', autenticar, apenasMaster, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, nome, email, perfil, primeiro_acesso, ativo, criado_em FROM usuarios ORDER BY nome'
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

router.post('/', autenticar, apenasMaster, async (req, res) => {
  const { nome, email, perfil } = req.body
  if (!nome || !email) return res.status(400).json({ erro: 'Nome e email são obrigatórios.' })

  try {
    const { rows } = await db.query(
      `INSERT INTO usuarios (nome, email, perfil, primeiro_acesso)
       VALUES ($1, $2, $3, TRUE) RETURNING id, nome, email, perfil`,
      [nome, email, perfil || 'operador']
    )
    res.status(201).json(rows[0])
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ erro: 'Email já cadastrado.' })
    res.status(500).json({ erro: err.message })
  }
})

router.delete('/:id', autenticar, apenasMaster, async (req, res) => {
  try {
    await db.query('UPDATE usuarios SET ativo = FALSE WHERE id = $1', [req.params.id])
    res.json({ mensagem: 'Usuário desativado.' })
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

module.exports = router