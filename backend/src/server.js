const express = require('express');
const cors = require('cors');
require('dotenv').config();

const produtosRoutes   = require('./routes/produtos');
const estoqueRoutes    = require('./routes/estoque');
const vendasRoutes     = require('./routes/vendas');
const categoriasRoutes = require('./routes/categorias');
const authRoutes       = require('./routes/auth');
const usuariosRoutes   = require('./routes/usuarios');

const app = express();

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(req.method, req.path, req.headers.authorization ? 'com token' : 'sem token')
  next()
});

// Rotas
app.use('/api/produtos',    produtosRoutes);
app.use('/api/estoque',     estoqueRoutes);
app.use('/api/vendas',      vendasRoutes);
app.use('/api/categorias',  categoriasRoutes);
app.use('/api/auth',        authRoutes);
app.use('/api/usuarios',    usuariosRoutes);

// Rota de health check
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', mensagem: 'API do Minimercado funcionando!' });
});

// Tratamento de erros genérico
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ erro: 'Erro interno no servidor.' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});