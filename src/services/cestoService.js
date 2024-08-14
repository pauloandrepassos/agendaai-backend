const CestoModel = require("../models/cestoCompras")
const LancheModel = require("../models/lanche")
const LanchoneteModel = require("../models/lanchonete")
const UserModel = require("../models/user")

class CestoService {
    async buscarCesto(userId) {
        try {
            const cesto = await CestoModel.findOne({
                where: { usuarioId: userId },
                include: [
                    {
                        model: LanchoneteModel,
                        as: 'lanchonete',
                        attributes: ['nome'] // Inclui apenas o nome da lanchonete
                    }
                ]
            })

            if (!cesto) {
                return
            }

            const idsLanche = cesto.lanches.map(item => item.idLanche)
            const lanchesDetalhados = await LancheModel.findAll({
                where: { id: idsLanche }
            })

            const lanchesComDetalhes = cesto.lanches.map(item => {
                const lancheDetalhado = lanchesDetalhados.find(lanche => lanche.id === item.idLanche)
                return {
                    idLanche: item.idLanche,
                    quantidade: item.quantidade,
                    nome: lancheDetalhado.nome,
                    preco: lancheDetalhado.preco,
                    imagem: lancheDetalhado.imagem
                }
            })

            return {
                id: cesto.id,
                usuarioId: cesto.usuarioId,
                lanchoneteId: cesto.lanchoneteId,
                lanchoneteNome: cesto.lanchonete.nome,
                lanches: lanchesComDetalhes,
                createdAt: cesto.createdAt,
                updatedAt: cesto.updatedAt
            }
        } catch (error) {
            throw error
        }
    }
    async adicionarLancheAoCesto(userId, lanchoneteId, idLanche, quantidade) {
        try {
            // Verifica se o usuário existe
            const usuario = await UserModel.findByPk(userId)
            if (!usuario) {
                throw new Error('Usuário não encontrado')
            }
    
            // Verifica se o lanche existe
            const lanche = await LancheModel.findByPk(idLanche)
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
                        idLanche: idLanche,
                        quantidade: quantidade
                    }]
                })
            } else {
                // Cria um novo array para "lanches"
                let lanchesAtualizados = [...cesto.lanches]
    
                // Verifica se o lanche já está no cesto
                const lancheExistenteIndex = lanchesAtualizados.findIndex(
                    (item) => item.idLanche === idLanche
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
                        idLanche: idLanche,
                        quantidade: quantidade
                    })
                }
    
                // Define o novo array de lanches no cesto
                cesto.lanches = lanchesAtualizados
    
                // Atualiza o cesto no banco de dados
                await cesto.save()
            }
    
            // Busca o cesto atualizado com os detalhes
            cesto = await CestoModel.findOne({
                where: { id: cesto.id },
                include: [
                    {
                        model: LanchoneteModel,
                        as: 'lanchonete',
                        attributes: ['nome'] // Inclui apenas o nome da lanchonete
                    }
                ]
            })
    
            const idsLanche = cesto.lanches.map(item => item.idLanche)
            const lanchesDetalhados = await LancheModel.findAll({
                where: { id: idsLanche }
            })
    
            const lanchesComDetalhes = cesto.lanches.map(item => {
                const lancheDetalhado = lanchesDetalhados.find(lanche => lanche.id === item.idLanche)
                return {
                    idLanche: item.idLanche,
                    quantidade: item.quantidade,
                    nome: lancheDetalhado.nome,
                    preco: lancheDetalhado.preco,
                    imagem: lancheDetalhado.imagem
                }
            })
    
            // Retorna o cesto com os detalhes atualizados
            return {
                id: cesto.id,
                usuarioId: cesto.usuarioId,
                lanchoneteId: cesto.lanchoneteId,
                lanchoneteNome: cesto.lanchonete.nome,
                lanches: lanchesComDetalhes,
                createdAt: cesto.createdAt,
                updatedAt: cesto.updatedAt
            }
        } catch (error) {
            throw error
        }
    }
    

    async removerLancheDoCesto(userId, idLanche) {
        try {
            // Busca o cesto do usuário
            const cesto = await CestoModel.findOne({
                where: { usuarioId: userId }
            })

            if (!cesto) {
                throw new Error('Cesto não encontrado')
            }

            // Verifica se o lanche está no cesto
            const lanchesAtualizados = cesto.lanches.filter(item => item.idLanche !== parseInt(idLanche))

            if (lanchesAtualizados.length === cesto.lanches.length) {
                throw new Error('Lanche não encontrado no cesto')
            }

            // Atualiza o cesto com a lista de lanches atualizada
            cesto.lanches = lanchesAtualizados

            // Salva as alterações
            await cesto.save()

            return cesto
        } catch (error) {
            throw error
        }
    }
    async removerCesto(idUsuario) {
        try {
            const cesto = await CestoModel.findOne({
                where: { usuarioId: idUsuario }
            })

            console.log(cesto)
    
            if (!cesto) {
                throw new Error('Cesto não encontrado')
            }
    
            await cesto.destroy()
    
            return { message: 'Cesto removido com sucesso' }
        } catch (error) {
            throw error
        }
    }
}

module.exports = CestoService

