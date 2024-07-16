const express = require('express')
const router = express.Router()

const authRoutes = require('./auth')
const solicitacaoRoutes = require('./solicitacao')

router.use('/', authRoutes, solicitacaoRoutes)

module.exports = router