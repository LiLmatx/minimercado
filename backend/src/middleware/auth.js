const jwt = require('jsonwebtoken')
const SECRET = process.env.JWT_SECRET || 'gm_mercado_secret'

function autenticar(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ erro: 'Token não fornecido.' })

  try {
    const dados = jwt.verify(token, SECRET)
    req.usuario = dados
    next()
  } catch {
    res.status(401).json({ erro: 'Token inválido ou expirado.' })
  }
}

function apenasMaster(req, res, next) {
  if (req.usuario.perfil !== 'master') {
    return res.status(403).json({ erro: 'Acesso restrito ao master.' })
  }
  next()
}

module.exports = { autenticar, apenasMaster }