const AppError = require('../utils/AppError');

// Middleware global de erro. No Express, funções com 4 parâmetros (err, req, res, next) são
// automaticamente reconhecidas como middlewares de captura de erro.
const errorHandler = (err, req, res, next) => {
  let error = { ...err }; // Cria uma cópia do erro para manipular de forma segura
  error.message = err.message;

  // Loga o erro no console (útil para desenvolvimento e debug)
  console.error(err);

  // Prisma errors
  if (err.code === 'P2002') {
    const message = 'Duplicate field value entered';
    error = new AppError(message, 400);
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    const message = err.errors.map((e) => e.message).join(', ');
    error = new AppError(`Validation Error: ${message}`, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token. Please log in again!', 401);
  }
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired. Please log in again!', 401);
  }

  const statusCode = error.statusCode || 500;
  const status = error.status || 'error';

  res.status(statusCode).json({
    status,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
