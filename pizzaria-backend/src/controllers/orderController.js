const prisma = require('../prisma');
const AppError = require('../utils/AppError');
const { getIo, emitToAll } = require('../sockets'); // Ferramentas de notificação em tempo real
const { z } = require('zod');

// Schema de validação Zod: Um item do pedido deve conter no mínimo qual produto foi escolhido, a quantidade e o preço.
const orderItemSchema = z.object({
  productId: z.number().int().positive(),
  size: z.string().optional(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  observation: z.string().optional(),
  additionals: z.array(z.object({
    additionalId: z.number().int().positive(),
    price: z.number().min(0),
  })).optional(),
});

// Schema de validação Zod para o Pedido completo (Carrinho).
// Dependendo do 'type' (DELIVERY, RESTAURANTE, LOCAL), podemos ter um "address" ou um "tableId".
const orderSchema = z.object({
  body: z.object({
    customerId: z.number().int().positive().optional().nullable(),
    tableId: z.number().int().positive().optional().nullable(),
    type: z.enum(['DELIVERY', 'RETIRADA', 'LOCAL']),
    paymentMethod: z.enum(['PIX', 'CARTAO', 'DINHEIRO']),
    items: z.array(orderItemSchema).min(1, 'Order must have at least one item'),
    address: z.object({
      street: z.string(),
      number: z.string(),
      neighborhood: z.string(),
      city: z.string(),
      state: z.string(),
      zipCode: z.string().optional(),
      complement: z.string().optional(),
    }).optional(),
  }),
});

const statusSchema = z.object({
  body: z.object({
    status: z.enum(['NOVO', 'RECEBIDO', 'EM_PREPARO', 'PRONTO', 'SAIU_PARA_ENTREGA', 'FINALIZADO', 'CANCELADO']),
  }),
});

exports.getAllOrders = async (req, res, next) => {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      Customer: true,
      Table: true,
      Driver: true,
      Items: { include: { Product: true, Additionals: true } },
      Address: true,
      Payments: true,
    },
  });

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      orders,
    },
  });
};

exports.getOrder = async (req, res, next) => {
  const { id } = req.params;

  const order = await prisma.order.findUnique({
    where: { id: parseInt(id) },
    include: {
      Customer: true,
      Table: true,
      Driver: true,
      Items: { include: { Product: true, Additionals: true } },
      Address: true,
      Payments: true,
    },
  });

  if (!order) return next(new AppError('No order found with that ID', 404));

  res.status(200).json({
    status: 'success',
    data: {
      order,
    },
  });
};

exports.createOrder = async (req, res, next) => {
  const { body } = orderSchema.parse(req); // Valida dados com Zod
  const { items, address, paymentMethod, ...orderData } = body;

  // 1) Calcula o total numérico do pedido no momento da criação da requisição.
  // Pega unidade x quantidade e soma todos os adicionais solicitados.
  let total = 0;
  const processedItems = items.map(item => {
    let itemTotal = item.unitPrice * item.quantity;
    if (item.additionals) {
      item.additionals.forEach(add => {
        itemTotal += add.price * item.quantity;
      });
    }
    total += itemTotal;
    
    // Devolve o item formatado para a Nested Write do Prisma (Cascade Creation)
    return {
      productId: item.productId,
      size: item.size,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: itemTotal,
      observation: item.observation,
      Additionals: {
        create: item.additionals ? item.additionals.map(a => ({
          additionalId: a.additionalId,
          price: a.price
        })) : []
      }
    };
  });

  // 2) Insere o pedido no banco.
  // Prisma permite criar o pedido, os itens, os endereços e a forma de pgto em UMA ÚNICA transação.
  const order = await prisma.order.create({
    data: {
      ...orderData,
      total,
      paymentMethod,
      Items: {
        create: processedItems
      },
      Address: address ? {
        create: address
      } : undefined,
      Payments: {
        create: [{ method: paymentMethod, amount: total }]
      }
    },
    // Inclui informações completas na resposta (útil pro front-end popular o painel)
    include: {
      Items: { include: { Product: true, Additionals: true } },
      Address: true,
      Customer: true,
      Table: true,
    }
  });

  // 3) Emite um evento WebSocket para o mundo inteiro
  // A tela principal do PDV que estiver conectada ouvirá 'pedido:novo' e apitará na tela automaticamente.
  emitToAll('pedido:novo', order);

  res.status(201).json({
    status: 'success',
    data: {
      order,
    },
  });
};

exports.updateOrderStatus = async (req, res, next) => {
  const { id } = req.params;
  const { body } = statusSchema.parse(req);

  const order = await prisma.order.update({
    where: { id: parseInt(id) },
    data: { status: body.status },
    include: {
      Customer: true,
      Table: true,
    }
  });

  // Emit real-time event
  emitToAll('pedido:status', { orderId: order.id, status: order.status, order });
  
  res.status(200).json({
    status: 'success',
    data: {
      order,
    },
  });
};

exports.assignDriver = async (req, res, next) => {
  const { id } = req.params;
  const { driverId } = req.body;

  if (!driverId) return next(new AppError('Driver ID is required', 400));

  const order = await prisma.order.update({
    where: { id: parseInt(id) },
    data: { 
      driverId: parseInt(driverId),
      status: 'SAIU_PARA_ENTREGA'
    },
    include: { Driver: true }
  });

  await prisma.deliveryDriver.update({
    where: { id: parseInt(driverId) },
    data: { status: 'EM_ENTREGA' }
  });

  emitToAll('pedido:atualizado', order);

  res.status(200).json({
    status: 'success',
    data: {
      order,
    },
  });
};

exports.cancelOrder = async (req, res, next) => {
  const { id } = req.params;

  const order = await prisma.order.update({
    where: { id: parseInt(id) },
    data: { status: 'CANCELADO' },
  });

  emitToAll('pedido:status', { orderId: order.id, status: order.status });

  res.status(200).json({
    status: 'success',
    data: {
      order,
    },
  });
};
