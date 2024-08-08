const express = require('express')
const router = express.Router()

const LancheService = require('../services/lancheService')
const { verificarToken, verificarGerenteLanchonete } = require('../middleware/authMiddleware')
const lancheService = new LancheService()

router.get('/lanchonete/:id/lanche', async (req, res) => {
    try {
        const idLanchonete = req.params.id
        const lanches = await lancheService.listarLanches(idLanchonete)
        res.status(200).json(lanches)
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar lanches.' })
    }
})

router.post('/lanchonete/:id/lanche', verificarToken('gerente'), verificarGerenteLanchonete, async (req, res) => {
    try {
        const idLanchonete = req.params.id
        const { nome, descricao, preco, tipo, imagem } = req.body
        const lanche = await lancheService.cadastrarLanche(nome, descricao, preco, tipo, imagem, idLanchonete)
        res.status(201).json(lanche)
    } catch (error) {
        res.status(500).json({ error: `Erro ao cadastrar o lanche. ${error}` })
    }
})

router.get('/lanchonete/:id/lanche', async (req, res) => {
    try {
        
    } catch (error) {
        
    }
})

module.exports = router