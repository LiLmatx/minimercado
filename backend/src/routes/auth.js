const express = require('express')
const router = express.Router()
const db = require('../db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const SECRET = process.env.JWT_SECRET || 'gm_mercado_secret'

router.post('/login', async (req, res) => {
  const { email, senha } = req.body
  console.log('Tentativa de login:', email)

  if (!email || !senha) return res.status(400).json({ erro: 'Email e senha obrigatórios.' })

  try {
    const { rows } = await db.query(
      'SELECT * FROM usuarios WHERE email = $1 AND ativo = TRUE', [email]
    )
    console.log('Usuário encontrado:', rows.length > 0 ? rows[0].email : 'nenhum')

    if (rows.length === 0) return res.status(401).json({ erro: 'Usuário ou senha inválidos.' })

    const usuario = rows[0]

    if (usuario.primeiro_acesso) {
      return res.json({ primeiro_acesso: true, usuario_id: usuario.id })
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash)
    console.log('Senha correta:', senhaCorreta)

    if (!senhaCorreta) return res.status(401).json({ erro: 'Usuário ou senha inválidos.' })

    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, perfil: usuario.perfil },
      SECRET,
      { expiresIn: '8h' }
    )

    res.json({ token, usuario: { id: usuario.id, nome: usuario.nome, perfil: usuario.perfil } })
  } catch (err) {
    console.log('Erro:', err.message)
    res.status(500).json({ erro: err.message })
  }
})

router.post('/definir-senha', async (req, res) => {
  const { usuario_id, senha } = req.body
  if (!usuario_id || !senha) return res.status(400).json({ erro: 'Dados incompletos.' })
  if (senha.length < 6) return res.status(400).json({ erro: 'Senha deve ter no mínimo 6 caracteres.' })

  try {
    const hash = await bcrypt.hash(senha, 10)
    const { rows } = await db.query(
      `UPDATE usuarios SET senha_hash = $1, primeiro_acesso = FALSE
       WHERE id = $2 AND primeiro_acesso = TRUE RETURNING id, nome, perfil`,
      [hash, usuario_id]
    )
    if (rows.length === 0) return res.status(400).json({ erro: 'Operação inválida.' })

    const token = jwt.sign(
      { id: rows[0].id, nome: rows[0].nome, perfil: rows[0].perfil },
      SECRET,
      { expiresIn: '8h' }
    )
    res.json({ token, usuario: rows[0] })
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

module.exports = router