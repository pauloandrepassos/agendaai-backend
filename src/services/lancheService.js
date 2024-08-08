const LancheModel = require("../models/lanche");


class LancheService {
    async cadastrarLanche(nome, descricao, preco, tipo, imagem, idLanchonete) {
        try {
            const lanche = await LancheModel.create({ nome, descricao, preco, tipo, imagem, idLanchonete })
            return lanche

        } catch (error) {
            throw error
        }
    }

    async listarLanches(idLanchonete) {
        try {
            const lanches = await LancheModel.findAll({
                where: { idLanchonete: idLanchonete },
                order: [['tipo', 'ASC']]
            })
            return lanches
        } catch (error) {
            throw error
        }
    }

    async buscarLanche(id) {

    }
}

module.exports = LancheService