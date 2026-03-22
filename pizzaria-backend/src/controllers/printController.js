const prisma = require('../prisma');
const AppError = require('../utils/AppError');
const { formatOrderForPrint } = require('../services/printService');

exports.printOrder = async (req, res, next) => {
  const { id } = req.params;

  const order = await prisma.order.findUnique({
    where: { id: parseInt(id) },
    include: {
      Customer: true,
      Table: true,
      Items: { include: { Product: true, Additionals: true } },
      Address: true,
    },
  });

  if (!order) return next(new AppError('Order not found', 404));

  const printPayload = formatOrderForPrint(order);

  res.status(200).json({
    status: 'success',
    data: {
      printPayload,
    },
  });
};
