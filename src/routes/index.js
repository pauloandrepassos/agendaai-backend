const express = require('express')
const router = express.Router()

const authRoutes = require('./auth')
const solicitacaoRoutes = require('./solicitacao')
const lanchoneteRoutes = require('./lanchonete')
const lancheRoutes = require('./lanches')
const cestoRoutes = require('./cesto')
const pedidosRoutes = require('./pedidos')
const userRoutes = require('./user')

router.use('/', authRoutes, solicitacaoRoutes, lanchoneteRoutes, lancheRoutes, cestoRoutes, pedidosRoutes, userRoutes)

module.exports = router