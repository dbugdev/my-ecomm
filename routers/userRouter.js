const {
  postUser,
  getUsers,
  getUserById,
  postLogin,
  getUserCount,
  deleteUserById,
} = require('../controllers/userController')

const router = require('express').Router()

router.get('/', getUsers)
router.get('/:userId', getUserById)
router.post('/', postUser)
router.post('/login', postLogin)
router.post('/register', postUser)
router.get('/get/count', getUserCount)
router.delete('/:userId', deleteUserById)

module.exports = router
