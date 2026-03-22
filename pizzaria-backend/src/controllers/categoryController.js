const prisma = require('../prisma');
const AppError = require('../utils/AppError');
const { z } = require('zod');

// Schema de validação Zod: Criação/Atualização de categoria exige 'name' em string.
const categorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Category name is required'),
  }),
});

// Lista todas as categorias e já "popula" (include) os produtos que pertencem a cada uma delas.
exports.getAllCategories = async (req, res, next) => {
  const categories = await prisma.category.findMany({
    include: {
      Products: true,
    },
  });

  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: {
      categories,
    },
  });
};

// Cria uma nova categoria baseada no corpo da requisição já validado.
exports.createCategory = async (req, res, next) => {
  const { body } = categorySchema.parse(req); // Pode estourar um erro se for inválido, que o errorHandler lida.

  const category = await prisma.category.create({
    data: body,
  });

  res.status(201).json({
    status: 'success',
    data: {
      category,
    },
  });
};

exports.updateCategory = async (req, res, next) => {
  const { id } = req.params;
  const { body } = categorySchema.parse(req);

  try {
    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: body,
    });

    res.status(200).json({
      status: 'success',
      data: {
        category,
      },
    });
  } catch (err) {
    if (err.code === 'P2025') return next(new AppError('Category not found', 404));
    return next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  const { id } = req.params;

  try {
    await prisma.category.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    if (err.code === 'P2025') return next(new AppError('Category not found', 404));
    return next(err);
  }
};
