require('dotenv').config()

const cors = require('cors')
const express = require('express')

const connectDB = require('./config/db')
const productsRoute = require('./routes/products')
const reviewsRoute = require('./routes/reviews')
const imagesRoute = require('./routes/images')
const categoriesRoute = require('./routes/categories')
const summariesRoute = require('./routes/summaries')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/api/products', productsRoute)
app.use('/api/reviews', reviewsRoute)
app.use('/api/images', imagesRoute)
app.use('/api/categories', categoriesRoute)
app.use('/api', summariesRoute)

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({
    message: error.message || 'Internal server error',
  })
})

async function startServer() {
  await connectDB()
  const port = Number(process.env.PORT) || 5000
  app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`)
  })
}

startServer().catch((error) => {
  console.error('Failed to start server:', error)
  process.exit(1)
})
