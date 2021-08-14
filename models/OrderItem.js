const { Schema, model } = require('mongoose')

const orderItemSchema = new Schema({
  quantity: {
    type: Number,
    required: true,
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
  },
})

module.exports.OrderItem = model('OrderItem', orderItemSchema)
