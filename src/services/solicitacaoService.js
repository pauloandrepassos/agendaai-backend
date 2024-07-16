const SolicitacaoModel = require("../models/solicitacao");

class SolicitacaoService {
    async enviarSoliicitacao(idUserTemp, nomeLanchonete, cnpj, imagem, cep, logradouro, numero, bairro, cidade, estado) {
        try {
            const solicitacao = await SolicitacaoModel.create({
                idUserTemp,
                nomeLanchonete,
                cnpj,
                imagem,
                cep,
                logradouro,
                numero,
                bairro,
                cidade,
                estado
            })
            return solicitacao
        } catch (error) {
            throw error
        }
    }
}

module.exports = SolicitacaoService