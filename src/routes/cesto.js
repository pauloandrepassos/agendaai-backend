const express = require('express')
const router = express.Router()

const CestoService = require('../services/cestoService')
const { verificarToken } = require('../middleware/authMiddleware')
const cestoService = new CestoService()

router.get('/cesto', verificarToken('cliente'), async (req, res) => {
    try {
        const idUsuario = req.userId
        const cesto = await cestoService.buscarCesto(idUsuario)
        if(!cesto) {
            res.status(404).json({ error: `Cesto não encontrado` })
        }
        res.status(200).json(cesto)
    } catch (error) {
        res.status(500).json({ error: `Erro ao buscar cesto: ${error}` })
    }
})
router.post('/cesto/adicionar', verificarToken('cliente'), async (req, res) => {
    console.log('chegou na rota')
    try {
        const { idLanchonete, idLanche, quantidade } = req.body
        const idUsuario = req.userId
        const cesto = await cestoService.adicionarLancheAoCesto(idUsuario, idLanchonete, idLanche, quantidade)
        res.status(200).json(cesto)
    } catch (error) {
        res.status(500).json({ error: `Erro ao adicionar lanche ao cesto. ${error.message}` })
    }
})

module.exports = router
