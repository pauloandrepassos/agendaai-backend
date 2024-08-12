const CestoModel = require("../models/cestoCompras")
const LancheModel = require("../models/lanche")
const UserModel = require("../models/user")

class CestoService {
    async adicionarLancheAoCesto(userId, lanchoneteId, lancheId, quantidade) {
        try {
            // Verifica se o usuário existe
            const usuario = await UserModel.findByPk(userId)
            if (!usuario) {
                throw new Error('Usuário não encontrado')
            }

            // Verifica se o lanche existe
            const lanche = await LancheModel.findByPk(lancheId)
            if (!lanche) {
                throw new Error('Lanche não encontrado')
            }

            // Verifica se o usuário já tem um cesto para a lanchonete específica
            let cesto = await CestoModel.findOne({
                where: { usuarioId: userId, lanchoneteId: lanchoneteId },
            })

            // Se o cesto não existir, cria um novo já adicionando o lanche
            if (!cesto) {
                cesto = await CestoModel.create({
                    usuarioId: userId,
                    lanchoneteId: lanchoneteId,
                    lanches: [{
                        lancheId: lancheId,
                        quantidade: quantidade
                    }]
                })
            } else {
                // Cria um novo array para "lanches"
                let lanchesAtualizados = [...cesto.lanches]

                // Verifica se o lanche já está no cesto
                const lancheExistenteIndex = lanchesAtualizados.findIndex(
                    (item) => item.lancheId === lancheId
                )

                if (lancheExistenteIndex !== -1) {
                    // Atualiza a quantidade do lanche existente
                    lanchesAtualizados[lancheExistenteIndex] = {
                        ...lanchesAtualizados[lancheExistenteIndex],
                        quantidade: lanchesAtualizados[lancheExistenteIndex].quantidade + quantidade
                    }
                } else {
                    // Adiciona o novo lanche ao cesto
                    lanchesAtualizados.push({
                        lancheId: lancheId,
                        quantidade: quantidade
                    })
                }

                // Define o novo array de lanches no cesto
                cesto.lanches = lanchesAtualizados

                // Atualiza o cesto no banco de dados
                await cesto.save()
            }

            // Atualiza e retorna o cesto atualizado
            cesto = await CestoModel.findByPk(cesto.id)

            return cesto
        } catch (error) {
            throw error
        }
    }
}

module.exports = CestoService

