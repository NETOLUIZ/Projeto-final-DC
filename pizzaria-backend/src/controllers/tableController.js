const prisma = require('../prisma');
const AppError = require('../utils/AppError');
const { z } = require('zod');

const openTableSchema = z.object({
  body: z.object({
    number: z.number().int().min(1),
  }),
});

exports.getAllTables = async (req, res, next) => {
  const tables = await prisma.table.findMany({
    include: {
      Orders: {
        where: {
          status: { notIn: ['FINALIZADO', 'CANCELADO'] },
        },
      },
    },
  });

  res.status(200).json({
    status: 'success',
    results: tables.length,
    data: {
      tables,
    },
  });
};

exports.openTable = async (req, res, next) => {
  const { body } = openTableSchema.parse(req);

  // 1) Checa se a mesa já existe no banco de dados
  let table = await prisma.table.findUnique({
    where: { number: body.number },
  });

  if (!table) {
    // 2a) Cria a mesa ocupada se for a primeira vez que entra no sistema
    table = await prisma.table.create({
      data: {
        number: body.number,
        status: 'OCUPADA',
      },
    });
  } else if (table.status === 'OCUPADA') {
    // A mesa já está ocupada por clientes. Recusa requisição
    return next(new AppError('Table is already occupied', 400));
  } else {
    // 2b) Atualiza a mesa livre para ocupada
    table = await prisma.table.update({
      where: { id: table.id },
      data: { status: 'OCUPADA' },
    });
  }

  // 3) Automaticamente gera a comanda inicial em branco para agrupar os itens locais
  const newOrder = await prisma.order.create({
    data: {
      tableId: table.id,
      type: 'LOCAL',
      total: 0,
      status: 'NOVO',
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      table,
      order: newOrder,
    },
  });
};

exports.closeTable = async (req, res, next) => {
  const { id } = req.params;

  const table = await prisma.table.findUnique({
    where: { id: parseInt(id) },
    include: {
      Orders: {
        where: { status: { notIn: ['FINALIZADO', 'CANCELADO'] } },
      },
    },
  });

  if (!table) return next(new AppError('Table not found', 404));

  if (table.Orders.length > 0) {
    return next(new AppError('Cannot close table with active orders', 400));
  }

  const updatedTable = await prisma.table.update({
    where: { id: table.id },
    data: { status: 'LIVRE' },
  });

  res.status(200).json({
    status: 'success',
    data: {
      table: updatedTable,
    },
  });
};

exports.deleteTable = async (req, res, next) => {
  const { id } = req.params;

  try {
    await prisma.table.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    if (err.code === 'P2025') return next(new AppError('Table not found', 404));
    return next(err);
  }
};
