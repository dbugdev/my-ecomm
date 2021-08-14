const { isValidObjectId } = require('mongoose')
const { Order } = require('../models/Order')
const { OrderItem } = require('../models/OrderItem')
const { createError } = require('../utils/createError')
const { isEmpty } = require('../utils/isEmpty')

module.exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name')
      .populate({
        path: 'orderItems',
        populate: { path: 'product', populate: 'category' },
      })
      .sort({ dateOrdered: -1 })
    if (isEmpty(orders)) {
      throw createError('Not Found', 404)
    }

    return res.status(200).json({ data: orders })
  } catch (err) {
    next(err)
  }
}

module.exports.getOrderById = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.orderId)) {
      throw createError('Invalid order id', 400)
    }
    const order = await Order.findById(req.params.orderId)
      .populate('user', 'name')
      .populate({
        path: 'orderItems',
        populate: { path: 'product', populate: 'category' },
      })

    if (!order) {
      throw createError('Not Found', 404)
    }

    return res.status(200).json({ data: order })
  } catch (err) {
    next(err)
  }
}

module.exports.postOrder = async (req, res, next) => {
  try {
    const orderItemsIds = Promise.all(
      req.body.orderItems.map(async (item) => {
        const orderItem = new OrderItem({
          quantity: item.quantity,
          product: item.product,
        })
        const result = await orderItem.save()
        return result._id
      })
    )
    const orderItemsIdsResolved = await orderItemsIds
    const totalPrices = await Promise.all(
      orderItemsIdsResolved.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate(
          'product',
          'price'
        )
        const totalPrice = orderItem.product.price * orderItem.quantity
        return totalPrice
      })
    )
    const totalPrice = totalPrices.reduce((a, b) => a + b, 0)
    const order = new Order({
      orderItems: orderItemsIdsResolved,
      shippingAddress1: req.body.shippingAddress1,
      shippingAddress2: req.body.shippingAddress2,
      city: req.body.city,
      zip: req.body.zip,
      country: req.body.country,
      phone: req.body.phone,
      status: req.body.status,
      totalPrice: totalPrice,
      user: req.body.user,
    })
    const result = await order.save()
    // const result = order
    if (!result) {
      throw createError(`The order can't be created`, 404)
    }
    return res
      .status(201)
      .json({ data: result, msg: `Order created successfully` })
  } catch (err) {
    next(err)
  }
}

module.exports.updateOrderById = async (req, res, next) => {
  try {
    const result = await Order.findByIdAndUpdate(
      req.params.orderId,
      {
        status: req.body.status,
      },
      { new: true }
    )
    if (!result) {
      throw createError(`Order not found`)
    }
    return res
      .status(200)
      .json({ data: result, msg: 'Order updated successfully' })
  } catch (err) {
    next(err)
  }
}

module.exports.deleteOrderById = async (req, res, next) => {
  try {
    const result = await Order.findByIdAndDelete(req.params.orderId)
    await result.orderItems.forEach(async (item) => {
      await OrderItem.findByIdAndDelete(item)
    })
    if (!result) {
      throw createError(`Order not found`)
    }
    return res.status(200).json({ msg: 'Order deleted successfully' })
  } catch (err) {
    next(err)
  }
}

module.exports.getTotalSales = async (req, res, next) => {
  try {
    const totalsales = await Order.aggregate([
      { $group: { _id: null, totalsales: { $sum: '$totalPrice' } } },
    ])

    if (!totalsales) {
      throw createError(`No Sales info available`)
    }
    return res
      .status(200)
      .json({ data: { totalsales: totalsales.pop().totalsales } })
  } catch (err) {
    next(err)
  }
}

module.exports.getOrderCount = async (req, res, next) => {
  try {
    const orderCount = await Order.countDocuments((count) => count)
    if (!orderCount) {
      throw createError('No order found', 500)
    }

    res.status(200).json({ data: { count: orderCount } })
  } catch (err) {
    next(err)
  }
}

module.exports.getUserOrdersByUserId = async (req, res, next) => {
  try {
    const userOrders = await Order.find({ user: req.params.userId })
      .populate({
        path: 'orderItems',
        populate: { path: 'product', populate: 'category' },
      })
      .sort({ dateOrdered: -1 })
    if (isEmpty(userOrders)) {
      throw createError('Not Found', 404)
    }

    return res.status(200).json({ data: userOrders })
  } catch (err) {
    next(err)
  }
}
