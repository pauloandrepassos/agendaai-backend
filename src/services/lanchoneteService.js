//const LanchoneteModel = require('../models/lanchonete')

const LanchoneteModel = require("../models/lanchonete")

class LanchoneteService {
    async listarLanchonetes() {
        try {
            const lanchonetes = await LanchoneteModel.findAll()
            return lanchonetes
        } catch (error) {
            throw error
        }
    }
    async buscarLanchonete(id) {
        try {
            const lanchonete = await LanchoneteModel.findByPk(id)
            return lanchonete
        } catch (error) {
            throw error
        }
    }
}

module.exports = LanchoneteService