const express = require('express')
const router = express.Router()

const authRoutes = require('./auth')
const solicitacaoRoutes = require('./solicitacao')
const lanchoneteRoutes = require('./lanchonete')
const lancheRoutes = require('./lanches')

router.use('/', authRoutes, solicitacaoRoutes, lanchoneteRoutes, lancheRoutes)

module.exports = router