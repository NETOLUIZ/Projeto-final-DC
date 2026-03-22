const jwt = require('jsonwebtoken'); // Biblioteca para criar e decodificar tokens JWT
const { promisify } = require('util'); // Utilitário nativo do Node para converter callbacks em Promises
const config = require('../config');
const prisma = require('../prisma'); // Conexão com o banco de dados
const AppError = require('../utils/AppError'); // Classe para jogar erros personalizados

// Funciona como um segurança na porta das rotas protegidas (só entra quem tem crachá válido)
const protect = async (req, res, next) => {
  // 1) Busca o token no cabeçalho Authorization da requisição
  // O formato deve ser: "Bearer eyJhbGciOi..."
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Pega tudo após o "Bearer "
    token = req.headers.authorization.split(' ')[1];
  }

  // Se não foi passado nenhum token, barra a requisição
  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // 2) Verifica e decodifica o token
  // jwt.verify confere a integridade criptográfica da assinatura usando o jwtSecret do config
  const decoded = await promisify(jwt.verify)(token, config.jwtSecret);

  // 3) Checa se o usuário que este token representa AINDA existe no banco
  // (Pode ser que o admin deletou a conta do atendente, mas ele ainda tem o token guardado)
  const currentUser = await prisma.user.findUnique({
    where: { id: decoded.id },
  });

  // Se o usuário foi deletado, o token fica inválido automaticamente
  if (!currentUser) {
    return next(new AppError('The user belonging to this token does no longer exist.', 401));
  }

  // Se tudo estiver certo, injeta as informações do usuário atual (currentUser) no objeto 'req'
  // Isso permite que as prórmimas funções/controladores acessem dados como req.user.id e req.user.role
  req.user = currentUser;
  next(); // Continua o fluxo para a próxima função (controller)
};

// Middleware para restringir o acesso apenas a um ou mais perfis (roles)
// Exemplo de uso: restrictTo('ADMIN', 'ATENDENTE')
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // Verifica se a role do req.user (que foi populado no middleware protect) está dentro do array liberado
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403)); // 403 Forbidden
    }
    next();
  };
};

module.exports = {
  protect,
  restrictTo,
};
