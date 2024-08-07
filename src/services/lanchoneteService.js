//const LanchoneteModel = require('../models/lanchonete')

const EnderecoModel = require("../models/endereco");
const LanchoneteModel = require("../models/lanchonete")

class LanchoneteService {
    async listarLanchonetes() {
        try {
            const lanchonetes = await LanchoneteModel.findAll({
                include: [{ model: EnderecoModel, as: 'endereco' }]
            });
            return lanchonetes;
        } catch (error) {
            throw error;
        }
    }

    async buscarLanchonete(id) {
        try {
            const lanchonete = await LanchoneteModel.findByPk(id, {
                include: [{ model: EnderecoModel, as: 'endereco' }]
            });
            return lanchonete;
        } catch (error) {
            throw error;
        }
    }

    async buscarLanchonetePorGerente(gerente) {
        try {
            const lanchonete = await LanchoneteModel.findOne({
                where: { gerente },
                include: [{ model: EnderecoModel, as: 'endereco' }]
            });
            return lanchonete;
        } catch (error) {
            throw new Error(`Erro ao buscar lanchonete por gerente`);
        }
    }
}

module.exports = LanchoneteService