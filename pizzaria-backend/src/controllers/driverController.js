const prisma = require('../prisma');
const AppError = require('../utils/AppError');
const { z } = require('zod');

const driverSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Driver name is required'),
    phone: z.string().optional(),
    status: z.enum(['DISPONIVEL', 'EM_ENTREGA', 'INATIVO']).optional(),
  }),
});

exports.getAllDrivers = async (req, res, next) => {
  const drivers = await prisma.deliveryDriver.findMany();

  res.status(200).json({
    status: 'success',
    results: drivers.length,
    data: {
      drivers,
    },
  });
};

exports.createDriver = async (req, res, next) => {
  const { body } = driverSchema.parse(req);

  const driver = await prisma.deliveryDriver.create({
    data: body,
  });

  res.status(201).json({
    status: 'success',
    data: {
      driver,
    },
  });
};

exports.updateDriver = async (req, res, next) => {
  const { id } = req.params;
  const { body } = driverSchema.parse(req);

  try {
    const driver = await prisma.deliveryDriver.update({
      where: { id: parseInt(id) },
      data: body,
    });

    res.status(200).json({
      status: 'success',
      data: {
        driver,
      },
    });
  } catch (err) {
    if (err.code === 'P2025') return next(new AppError('Driver not found', 404));
    return next(err);
  }
};

exports.deleteDriver = async (req, res, next) => {
  const { id } = req.params;

  try {
    await prisma.deliveryDriver.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    if (err.code === 'P2025') return next(new AppError('Driver not found', 404));
    return next(err);
  }
};
