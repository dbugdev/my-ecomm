const {
  postProduct,
  getProducts,
  getProductById,
  updateProductById,
  deleteProductById,
  getProductCount,
  getFeaturedProducts,
  updateGalaryImages,
} = require('../controllers/productController')
const path = require('path')

const router = require('express').Router()
const multer = require('multer')

const FILE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype]
    let uploadError = new Error('Invalid image type')
    if (isValid) {
      uploadError = null
    }
    cb(uploadError, 'public/uploads')
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname)
    const fileName = file.originalname.split(' ').join('-').replace(ext, '')
    const extension = FILE_TYPE_MAP[file.mimetype]
    cb(null, `${fileName}-${Date.now()}.${extension}`)
  },
})

const upload = multer({ storage: storage })

// GET ALL PRODUCTS
router.get('/', getProducts)

// CREATE PRODUCT
router.post('/', upload.single('image'), postProduct)
router.get('/:productId', getProductById)
router.put('/:productId', updateProductById)
router.delete('/:productId', deleteProductById)
router.get('/get/count', getProductCount)
router.get('/get/featured/', getFeaturedProducts)
router.put(
  '/gallery-images/:productId',
  upload.array('images', 10),
  updateGalaryImages
)

module.exports = router
