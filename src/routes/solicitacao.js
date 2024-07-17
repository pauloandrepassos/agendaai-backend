const express = require('express')
const router = express.Router()

const AuthService = require('../services/authService')
const authService = new AuthService()
const SolicitacaoService = require('../services/solicitacaoService')
const { sendRegistrationConfirmationEmail } = require('../utils/emails')
const { verificarToken } = require('../middleware/authMiddleware')
const solicitacaoService = new SolicitacaoService()

router.get('/solicitacao', async (req, res) => {
    try {
        const solicitacoes = await solicitacaoService.listarSolicitacoes()
        return res.status(200).json(solicitacoes)
    } catch (error) {
        return res.status(500).json({ error: `Erro ao buscar solicitações: ${error.message}` });
    }
})

router.get('/solicitacao/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const solicitacao = await solicitacaoService.getSolicitacaoById(id);
        return res.status(200).json(solicitacao);
    } catch (error) {
        return res.status(500).json({ error: `Erro ao buscar solicitação: ${error.message}` });
    }
});

router.post('/solicitacao', async (req, res) => {
    const { nome, email, password, nomeLanchonete, cnpj, imagem, cep, logradouro, numero, bairro, cidade, estado } = req.body
    const papel = 'gerente'

    try {
        const checkUserTemp = await authService.verificarUserTemp(email)
        if (checkUserTemp) {
            await authService.deletarUserTemp(email)
        }
        const checkUser = await authService.verificarUser(email)
        if (checkUser) {
            return res.status(409).json({ error: "Email já cadastrado" })
        }
        const { userTemp, token } = await authService.registerUserTemp(nome, email, password, papel)

        const solicitacao = await solicitacaoService.enviarSolicitacao(userTemp.id, nomeLanchonete, cnpj, imagem, cep, logradouro, numero, bairro, cidade, estado)

        await sendRegistrationConfirmationEmail(email)
        return res.status(201).json({ message: "Solicitação criada com sucesso", solicitacao, token });
    } catch (error) {
        return res.status(500).json({ error: `Erro ao criar solicitação: ${error.message}` });
    }
})

router.put('/solicitacao/:id', verificarToken('admin'), async(req, res) => {
    const { id } = req.params

    try {
        const solicitacao = await solicitacaoService.verificarSolicitação(id);
        return res.status(200).json({ message: 'Status atualizado com sucesso', solicitacao });
    } catch (error) {
        return res.status(500).json({ error: `Erro ao atualizar status: ${error.message}` });
    }
})

module.exports = router