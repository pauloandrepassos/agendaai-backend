const express = require('express')
const router = express.Router()

const authRoutes = require('./auth')
const solicitacaoRoutes = require('./solicitacao')
const lanchonereRoutes = require('./lanchonete')

router.use('/', authRoutes, solicitacaoRoutes, lanchonereRoutes)

module.exports = router