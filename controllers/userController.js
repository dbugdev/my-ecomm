const { User } = require('../models/User')
const bcrypt = require('bcrypt')
const { isEmpty } = require('../utils/isEmpty')
const { createError } = require('../utils/createError')
const { isValidObjectId } = require('mongoose')
const jwt = require('jsonwebtoken')

module.exports.postUser = async (req, res, next) => {
  try {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      passwordHash: bcrypt.hashSync(req.body.password, 10),
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      street: req.body.street,
      apartment: req.body.apartment,
      zip: req.body.zip,
      city: req.body.city,
      country: req.body.country,
    })
    const result = await user.save()
    if (!result) {
      throw createError(`User can't be created`)
    }
    return res
      .status(201)
      .json({ data: result, msg: `User created successfully` })
  } catch (err) {
    next(err)
  }
}

module.exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash')
    if (isEmpty(users)) {
      throw createError('Not Found', 404)
    }
    return res.status(200).json({ data: users })
  } catch (err) {
    next(err)
  }
}
module.exports.getUserById = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.userId)) {
      throw createError('Invalid user id', 400)
    }
    const user = await User.findById(req.params.userId).select('-passwordHash')
    if (!user) {
      throw createError('Not Found', 404)
    }
    return res.status(200).json({ data: user })
  } catch (err) {
    next(err)
  }
}

module.exports.postLogin = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
      throw createError('Invalid credentials', 404)
    }
    const isvalidpass = await bcrypt.compare(
      req.body.password,
      user.passwordHash
    )
    if (!isvalidpass) {
      throw createError('Invalid credentials', 404)
    }
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h',
      }
    )
    return res.status(200).json({ data: { user: user.email, token: token } })
  } catch (err) {
    next(err)
  }
}

module.exports.getUserCount = async (req, res, next) => {
  try {
    const userCount = await User.countDocuments((count) => count)
    if (!userCount) {
      throw createError('No user found', 500)
    }

    res.status(200).json({ data: { count: userCount } })
  } catch (err) {
    next(err)
  }
}

module.exports.deleteUserById = async (req, res, next) => {
  try {
    const result = await User.findByIdAndDelete(req.params.userId)
    if (!result) {
      throw createError(`User not found`)
    }
    return res.status(200).json({ msg: 'User deleted successfully' })
  } catch (err) {
    next(err)
  }
}
