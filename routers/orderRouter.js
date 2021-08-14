const {
  getOrders,
  postOrder,
  getOrderById,
  updateOrderById,
  deleteOrderById,
  getTotalSales,
  getOrderCount,
  getUserOrdersByUserId,
} = require('../controllers/orderController')

const router = require('express').Router()
router.get('/', getOrders)
router.get('/:orderId', getOrderById)
router.put('/:orderId', updateOrderById)
router.delete('/:orderId', deleteOrderById)
router.post('/', postOrder)
router.get('/get/totalsales', getTotalSales)
router.get('/get/count', getOrderCount)
router.get('/get/userorders/:userId', getUserOrdersByUserId)
module.exports = router
