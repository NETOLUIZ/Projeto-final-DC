const prisma = require('../prisma');
const AppError = require('../utils/AppError');
const { z } = require('zod');

const openCashSchema = z.object({
  body: z.object({
    initialBalance: z.number().min(0, 'Initial balance cannot be negative'),
  }),
});

const cashTransactionSchema = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be positive'),
    description: z.string().optional(),
    paymentMethod: z.enum(['PIX', 'CARTAO', 'DINHEIRO']).optional(),
  }),
});

exports.getCurrentCash = async (req, res, next) => {
  const cashRegister = await prisma.cashRegister.findFirst({
    where: { status: 'ABERTO' },
    include: {
      Transactions: true,
      User: { select: { name: true } },
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      cashRegister,
    },
  });
};

exports.openCash = async (req, res, next) => {
  const { body } = openCashSchema.parse(req);

  const existingOpen = await prisma.cashRegister.findFirst({
    where: { status: 'ABERTO' },
  });

  if (existingOpen) {
    return next(new AppError('There is already an open cash register', 400));
  }

  const cashRegister = await prisma.cashRegister.create({
    data: {
      userId: req.user.id,
      initialBalance: body.initialBalance,
      status: 'ABERTO',
    },
  });

  res.status(201).json({
    status: 'success',
    data: {
      cashRegister,
    },
  });
};

exports.closeCash = async (req, res, next) => {
  const cashRegister = await prisma.cashRegister.findFirst({
    where: { status: 'ABERTO' },
    include: { Transactions: true },
  });

  if (!cashRegister) {
    return next(new AppError('No open cash register found to close', 404));
  }

  // Calculate final balance
  let totalEntries = 0;
  let totalExits = 0;

  cashRegister.Transactions.forEach((tx) => {
    if (tx.type === 'ENTRY') totalEntries += Number(tx.amount);
    if (tx.type === 'EXIT') totalExits += Number(tx.amount);
  });

  const finalBalance = Number(cashRegister.initialBalance) + totalEntries - totalExits;

  const updatedCash = await prisma.cashRegister.update({
    where: { id: cashRegister.id },
    data: {
      status: 'FECHADO',
      closedAt: new Date(),
      finalBalance,
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      cashRegister: updatedCash,
    },
  });
};

exports.addEntry = async (req, res, next) => {
  const { body } = cashTransactionSchema.parse(req);

  const cashRegister = await prisma.cashRegister.findFirst({
    where: { status: 'ABERTO' },
  });

  if (!cashRegister) return next(new AppError('No open cash register found', 400));

  const transaction = await prisma.cashTransaction.create({
    data: {
      cashRegisterId: cashRegister.id,
      type: 'ENTRY',
      amount: body.amount,
      description: body.description,
      paymentMethod: body.paymentMethod,
    },
  });

  res.status(201).json({
    status: 'success',
    data: {
      transaction,
    },
  });
};

exports.addExit = async (req, res, next) => {
  const { body } = cashTransactionSchema.parse(req);

  const cashRegister = await prisma.cashRegister.findFirst({
    where: { status: 'ABERTO' },
  });

  if (!cashRegister) return next(new AppError('No open cash register found', 400));

  const transaction = await prisma.cashTransaction.create({
    data: {
      cashRegisterId: cashRegister.id,
      type: 'EXIT',
      amount: body.amount,
      description: body.description,
      paymentMethod: body.paymentMethod,
    },
  });

  res.status(201).json({
    status: 'success',
    data: {
      transaction,
    },
  });
};

exports.getCashHistory = async (req, res, next) => {
  const history = await prisma.cashRegister.findMany({
    orderBy: { createdAt: 'desc' },
    include: { User: { select: { name: true } } },
    take: 30, // Limit to last 30
  });
  
  // Notice that 'createdAt' does not exist on CashRegister, we have 'openedAt'
  const fixedHistory = await prisma.cashRegister.findMany({
    orderBy: { openedAt: 'desc' },
    include: { User: { select: { name: true } } },
    take: 30, // Limit to last 30
  });

  res.status(200).json({
    status: 'success',
    data: {
      history: fixedHistory,
    },
  });
};
