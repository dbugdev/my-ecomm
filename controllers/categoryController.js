const { Category } = require('../models/Category')
const { createError } = require('../utils/createError')
const { isEmpty } = require('../utils/isEmpty')
const { isValidObjectId } = require('mongoose')

module.exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find()
    if (isEmpty(categories)) {
      throw createError('Not Found', 404)
    }
    return res.status(200).json({ data: categories })
  } catch (err) {
    next(err)
  }
}

module.exports.getCategoryById = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.categoryId)) {
      throw createError('Invalid category id', 400)
    }
    const category = await Category.findById(req.params.categoryId)
    if (!category) {
      throw createError('Not Found', 404)
    }
    return res.status(200).json({ data: category })
  } catch (err) {
    next(err)
  }
}

module.exports.postCategory = async (req, res, next) => {
  try {
    const category = new Category({
      name: req.body.name,
      icon: req.body.icon,
      color: req.body.color,
    })
    const result = await category.save()
    if (!result) {
      throw createError(`The category can't be created`, 404)
    }
    return res
      .status(201)
      .json({ data: result, msg: `Category created successfully` })
  } catch (err) {
    next(err)
  }
}

module.exports.updateCategoryById = async (req, res, next) => {
  try {
    const result = await Category.findByIdAndUpdate(
      req.params.categoryId,
      {
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,
      },
      { new: true }
    )
    if (!result) {
      throw createError(`Category not found`)
    }
    return res
      .status(200)
      .json({ data: result, msg: 'Category updated successfully' })
  } catch (err) {
    next(err)
  }
}

module.exports.deleteCategoryById = async (req, res, next) => {
  try {
    const result = await Category.findByIdAndDelete(req.params.categoryId)
    if (!result) {
      throw createError(`Category not found`)
    }
    return res.status(200).json({ msg: 'Category deleted successfully' })
  } catch (err) {
    next(err)
  }
}
