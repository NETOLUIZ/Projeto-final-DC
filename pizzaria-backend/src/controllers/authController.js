const prisma = require('../prisma');
const AppError = require('../utils/AppError');
const { comparePassword } = require('../utils/password');
const { createSendToken } = require('../utils/jwt');
const { z } = require('zod');

// Schema de validação usando Zod: Garante que os dados (email e password) 
// enviados no corpo (body) da requisição estejam no formato correto antes de continuar.
const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Please provide a valid email'),
    password: z.string().min(1, 'Please provide a password'),
  }),
});

exports.login = async (req, res, next) => {
  // 1) Valida se o email e a senha foram enviados e estão corretos
  const { body } = loginSchema.parse(req);
  const { email, password } = body;

  // 2) Busca o usuário no banco pelo e-mail informado
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Se o usuário não existir ou se a senha (em hash) não bater com a digitada, recusa o login
  if (!user || !(await comparePassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) Se tudo der certo, gera o token JWT e envia junto com os dados do usuário (omitindo a senha)
  createSendToken(user, 200, res);
};
