require('dotenv').config()
const cors = require('cors')
const express = require('express')
const app = express()
const morgan = require('morgan')
const mongoose = require('mongoose')
const { isEmpty } = require('./utils/isEmpty')
const { Product } = require('./models/Product')

const userRouter = require('./routers/userRouter')
const categoryRouter = require('./routers/categoryRouter')
const orderRouter = require('./routers/orderRouter')
const productRouter = require('./routers/productRouter')
const authJwt = require('./helpers/jwt')

app.use(cors())
app.options('*', cors())

// middlewares
app.use(express.json())
app.use(morgan('tiny'))
app.use(authJwt())
app.use('/public/uploads', express.static(`${__dirname}/public/uploads`))

const api = process.env.API_URL

// routes
app.use(`${api}/users`, userRouter)
app.use(`${api}/products`, productRouter)
app.use(`${api}/categories`, categoryRouter)
app.use(`${api}/orders`, orderRouter)

app.use((err, req, res, next) => {
  console.log(err.name)
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      msg: 'Unauthorized',
      error: true,
    })
  }
  if (err.name === 'ValidationError') {
    return res.status(401).json({
      msg: err.message,
      error: true,
    })
  }
  const status = err.statusCode || 500
  return res.status(status).json({
    msg: err.message,
    error: true,
  })
})

const PORT = process.env.PORT || 3000
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then((result) => {
    console.log('Connected to Database')
    app.listen(PORT, () => {
      console.log(api)
      console.log(`Listening on the port : ${PORT}`)
    })
  })
