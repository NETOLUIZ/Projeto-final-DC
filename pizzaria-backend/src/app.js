// Importa a lib para capturar erros em rotas assíncronas de forma automática
require('express-async-errors'); // Must be first
const express = require('express');
const cors = require('cors');

// Importação do middleware global de erros e classe de erro customizada
const errorHandler = require('./middlewares/errorHandler');
const AppError = require('./utils/AppError');

// Importa todas as rotas da aplicação
const routes = require('./routes');

const app = express();

// --- Middlewares Globais ---
// Habilita requisições de outras origens (Front-ends)
app.use(cors());
// Permite que o servidor entenda requisições com corpo no formato JSON
app.use(express.json());
// Permite que o servidor entenda dados de formulários URL-encoded
app.use(express.urlencoded({ extended: true }));

// --- Setup de Rotas ---
// Todas as rotas da API começarão com /api
app.use('/api', routes);

// --- Tratamento para Rotas não encontradas (404) ---
// Qualquer rota (*) que passar pelos middlewares acima e cair aqui, não existe.
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// --- Global Error Handler ---
// Middleware centralizado: Todos os erros da aplicação vêm parar aqui
app.use(errorHandler);

module.exports = app;
