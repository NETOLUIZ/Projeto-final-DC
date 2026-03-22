const prisma = require('../prisma');
const AppError = require('../utils/AppError');
const { z } = require('zod');

// Schema menor apenas para validar a entrada de "Adicionais" embutidos em um produto
const productAdditionalSchema = z.object({
  name: z.string(),
  price: z.number().min(0),
});

// Schema completo para validar os dados do produto. Permite que o array 'additionals' 
// seja criado junto na mesma requisição.
const productSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Product name is required'),
    price: z.number().min(0, 'Price must be positive'),
    description: z.string().optional(),
    image: z.string().optional(),
    categoryId: z.number(),
    additionals: z.array(productAdditionalSchema).optional(),
  }),
});

// Retorna todos os produtos do cardápio preenchendo as relações com Categoria e Adicionais
exports.getAllProducts = async (req, res, next) => {
  const products = await prisma.product.findMany({
    include: {
      Category: true,
      Additionals: true,
    },
  });

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products,
    },
  });
};

exports.getProduct = async (req, res, next) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) },
    include: {
      Category: true,
      Additionals: true,
    },
  });

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
};

// Cria produto com suporte nested write (cria o produto E seus adicionais de uma só vez no banco)
exports.createProduct = async (req, res, next) => {
  const { body } = productSchema.parse(req);
  const { additionals, ...productData } = body;

  const product = await prisma.product.create({
    data: {
      ...productData,
      Additionals: additionals ? {
        create: additionals, // Prisma magic: Insere os adicionais automaticamente com a foreign key correntamente
      } : undefined,
    },
    include: {
      Category: true,
      Additionals: true,
    },
  });

  res.status(201).json({
    status: 'success',
    data: {
      product,
    },
  });
};

exports.updateProduct = async (req, res, next) => {
  const { id } = req.params;
  const { body } = productSchema.parse(req);
  const { additionals, ...productData } = body;

  try {
    // If we have additionals to update, we will simply delete existing ones and create new ones
    // For a real production app, you might want to match IDs and update/delete specifically.
    const updateData = {
      ...productData,
    };

    if (additionals) {
      updateData.Additionals = {
        deleteMany: {},
        create: additionals,
      };
    }

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        Category: true,
        Additionals: true,
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        product,
      },
    });
  } catch (err) {
    if (err.code === 'P2025') return next(new AppError('Product not found', 404));
    return next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  const { id } = req.params;

  try {
    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    if (err.code === 'P2025') return next(new AppError('Product not found', 404));
    return next(err);
  }
};
