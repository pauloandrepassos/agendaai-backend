const express = require('express')
const router = express.Router() 

const AuthService = require('../services/authService')
const authService = new AuthService()
const SolicitacaoService = require('../services/solicitacaoService')
const { sendRegistrationConfirmationEmail } = require('../utils/emails')
const solicitacaoService = new SolicitacaoService()

router.post('/solicitacao', async (req, res) => {
    const { nome, email, password, nomeLanchonete, cnpj, imagem, cep, logradouro, numero, bairro, cidade, estado} = req.body
    const papel = 'gerente'

    try {
        const checkUserTemp= await authService.verificarUserTemp(email)
        if (checkUserTemp) {
            await authService.deletarUserTemp(email)
        }
        const checkUser = await authService.verificarUser(email)
        if (checkUser) {
            return res.status(409).json({ error: "Email já cadastrado" })
        }
        const { userTemp, token } = await authService.registerUserTemp(nome, email, password, papel)

        const solicitacao = await solicitacaoService.enviarSoliicitacao(userTemp.id,nomeLanchonete, cnpj, imagem, cep, logradouro, numero, bairro, cidade, estado)
        
        await sendRegistrationConfirmationEmail(email)
        return res.status(201).json({ message: "Solicitação criada com sucesso", solicitacao, token });
    } catch (error) {
        return res.status(500).json({ error: `Erro ao criar solicitação: ${error.message}` });
    }
})

module.exports = router