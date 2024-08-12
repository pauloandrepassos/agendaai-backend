const PedidoModel = require('../models/pedido')
const PedidoLancheModel = require('../models/pedidoLanche')
const LancheModel = require('../models/lanche')
const CestoModel = require('../models/cestoCompras')

class PedidoService {
    async cadastrarPedido(idUsuario, idLanchonete, lanches) {
        const transaction = await PedidoModel.sequelize.transaction()
        try {
            // Criar o pedido
            const pedido = await PedidoModel.create({ idUsuario, idLanchonete }, { transaction })
    
            // Adicionar os lanches ao pedido
            let total = 0
    
            for (const lancheData of lanches) {
                const { idLanche, quantidade } = lancheData
                
                // Buscar o lanche pelo id
                const lanche = await LancheModel.findByPk(idLanche)
                if (!lanche) {
                    throw new Error(`Lanche com id ${idLanche} não encontrado`)
                }
    
                const precoUnitario = lanche.preco
                const totalLanche = quantidade * precoUnitario
    
                await PedidoLancheModel.create({
                    idPedido: pedido.id,
                    idLanche,
                    quantidade,
                    precoUnitario,
                    total: totalLanche,
                }, { transaction })
    
                total += totalLanche
            }
    
            // Atualizar o total do pedido
            pedido.total = total
            await pedido.save({ transaction })

            await CestoModel.destroy({
                where: { usuarioId: idUsuario },
                transaction
            })
    
            await transaction.commit()
            return pedido
        } catch (error) {
            await transaction.rollback()
            throw error
        }
    }    

    async listarPedidosUsuario(idUsuario) {
        try {
            const pedidos = await PedidoModel.findAll({
                where: { idUsuario },
                include: [{
                    model: LancheModel,
                    as: 'itens',
                    through: {
                        attributes: ['quantidade', 'precoUnitario', 'total']
                    }
                }],
                order: [['createdAt', 'DESC']]
            })
            return pedidos
        } catch (error) {
            throw error
        }
    }

    async listarPedidosLanchonete(idLanchonete) {
        try {
            const pedidos = await PedidoModel.findAll({
                where: { idLanchonete },
                include: [{
                    model: LancheModel,
                    as: 'itens',
                    through: {
                        attributes: ['quantidade', 'precoUnitario', 'total']
                    }
                }],
                order: [['createdAt', 'DESC']]
            })
            return pedidos
        } catch (error) {
            throw error
        }
    }    

    async atualizarStatusPedido(idPedido, status) {
        try {
            const pedido = await PedidoModel.findByPk(idPedido)
            if (!pedido) {
                throw new Error('Pedido não encontrado.')
            }
            pedido.status = status
            await pedido.save()
            return pedido
        } catch (error) {
            throw error
        }
    }
}

module.exports = PedidoService
