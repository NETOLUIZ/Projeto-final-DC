const prisma = require('../prisma');

exports.getSummary = async (req, res, next) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const todayOrders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: { not: 'CANCELADO' }
    },
    select: {
      total: true,
      status: true,
    }
  });

  const totalOrders = todayOrders.length;
  const faturamento = todayOrders.reduce((acc, order) => acc + Number(order.total), 0);
  
  const inProgress = todayOrders.filter(o => !['FINALIZADO', 'CANCELADO'].includes(o.status)).length;
  const finished = todayOrders.filter(o => o.status === 'FINALIZADO').length;

  res.status(200).json({
    status: 'success',
    data: {
      totalOrders,
      faturamento,
      inProgress,
      finished,
    },
  });
};

exports.getTopProducts = async (req, res, next) => {
  const topItems = await prisma.orderItem.groupBy({
    by: ['productId'],
    _sum: { quantity: true },
    orderBy: {
      _sum: { quantity: 'desc' },
    },
    take: 5,
  });

  const productIds = topItems.map((item) => item.productId);

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, image: true, price: true },
  });

  // Map sums back to products
  const result = products.map((prod) => ({
    ...prod,
    totalSold: topItems.find((t) => t.productId === prod.id)?._sum.quantity || 0,
  })).sort((a, b) => b.totalSold - a.totalSold);

  res.status(200).json({
    status: 'success',
    data: {
      topProducts: result,
    },
  });
};
