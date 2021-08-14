const { isValidObjectId } = require('mongoose')
const { Category } = require('../models/Category')
const { Product } = require('../models/Product')
const { createError } = require('../utils/createError')
const { isEmpty } = require('../utils/isEmpty')

module.exports.postProduct = async (req, res, next) => {
  try {
    const category = await Category.findById(req.body.category)
    if (!category) {
      throw createError('Invalid Category', 400)
    }
    const file = req.file
    if (!file) {
      throw createError('No image in request', 400)
    }
    const fileName = req.file.filename
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: `${basePath}${fileName}`,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    })
    const result = await product.save()
    if (!result) {
      throw createError(`Product can't be created`)
    }
    return res
      .status(201)
      .json({ data: result, msg: `Product created successfully` })
  } catch (err) {
    next(err)
  }
}

module.exports.getProducts = async (req, res, next) => {
  try {
    //localhost:3000/api/v1/products?categories=
    let filter = {}
    if (req.query.categories) {
      filter = { category: req.query.categories.split(',') }
    }
    const products = await Product.find(filter).populate('category')
    if (isEmpty(products)) {
      throw createError('Not found')
    }

    return res.status(200).json({ data: products })
  } catch (err) {
    next(err)
  }
}

module.exports.getProductById = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.productId)) {
      throw createError('Invalid product id', 400)
    }
    const product = await Product.findById(req.params.productId).populate(
      'category'
    )
    if (!product) {
      throw createError('Not Found', 404)
    }
    return res.status(200).json({ data: product })
  } catch (err) {
    next(err)
  }
}

module.exports.updateProductById = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.productId)) {
      throw createError('Invalid product id', 400)
    }
    const category = await Category.findById(req.body.category)
    if (!category) {
      throw createError('Invalid Category', 400)
    }
    const result = await Product.findByIdAndUpdate(
      req.params.productId,
      {
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
      },
      { new: true }
    )
    if (!result) {
      throw createError(`Product not found`)
    }
    return res
      .status(200)
      .json({ data: result, msg: 'Product updated successfully' })
  } catch (err) {
    next(err)
  }
}

module.exports.deleteProductById = async (req, res, next) => {
  try {
    const result = await Product.findByIdAndDelete(req.params.productId)
    if (!result) {
      throw createError(`Product not found`)
    }
    return res.status(200).json({ msg: 'Product deleted successfully' })
  } catch (err) {
    next(err)
  }
}

module.exports.getProductCount = async (req, res, next) => {
  try {
    const productCount = await Product.countDocuments((count) => count)
    if (!productCount) {
      throw createError('No product found', 500)
    }

    res.status(200).json({ data: { count: productCount } })
  } catch (err) {
    next(err)
  }
}

module.exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const count = req.query.count || 0
    const products = await Product.find({ isFeatured: true }).limit(+count)
    if (isEmpty(products)) {
      throw createError('No product found', 500)
    }

    res.status(200).json({ data: products })
  } catch (err) {
    next(err)
  }
}

module.exports.updateGalaryImages = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.productId)) {
      throw createError('Invalid product id', 400)
    }
    const files = req.files
    let imagePaths = []
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`

    if (files) {
      files.forEach((file) => {
        imagePaths.push(`${basePath}${file.filename}`)
      })
    }

    const result = await Product.findByIdAndUpdate(
      req.params.productId,
      {
        images: imagePaths,
      },
      { new: true }
    )

    if (!result) {
      throw createError('Product not found', 404)
    }
    return res
      .status(201)
      .json({ data: result, msg: `Product Updated successfully` })
  } catch (err) {
    next(err)
  }
}
