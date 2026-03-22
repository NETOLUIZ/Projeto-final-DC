const prisma = require('../prisma');
const AppError = require('../utils/AppError');
const { hashPassword } = require('../utils/password');
const { z } = require('zod');

const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['ADMIN', 'ATENDENTE', 'COZINHA', 'ENTREGADOR']),
  }),
});

const updateUserSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    role: z.enum(['ADMIN', 'ATENDENTE', 'COZINHA', 'ENTREGADOR']).optional(),
  }),
});

exports.getAllUsers = async (req, res, next) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
};

exports.createUser = async (req, res, next) => {
  const { body } = createUserSchema.parse(req);

  // Hash password
  body.password = await hashPassword(body.password);

  const newUser = await prisma.user.create({
    data: body,
  });

  newUser.password = undefined;

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
};

exports.updateUser = async (req, res, next) => {
  const { id } = req.params;
  const { body } = updateUserSchema.parse(req);

  if (body.password) {
    body.password = await hashPassword(body.password);
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: body,
    });

    updatedUser.password = undefined;

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  } catch (err) {
    if (err.code === 'P2025') {
      return next(new AppError('No user found with that ID', 404));
    }
    return next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  const { id } = req.params;

  try {
    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    if (err.code === 'P2025') {
      return next(new AppError('No user found with that ID', 404));
    }
    return next(err);
  }
};
