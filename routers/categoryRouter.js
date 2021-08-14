const {
  getCategories,
  postCategory,
  getCategoryById,
  deleteCategoryById,
  updateCategoryById,
} = require('../controllers/categoryController')

const router = require('express').Router()

router.get('/', getCategories)
router.get('/:categoryId', getCategoryById)
router.put('/:categoryId', updateCategoryById)
router.post('/', postCategory)
router.delete('/:categoryId', deleteCategoryById)

module.exports = router
