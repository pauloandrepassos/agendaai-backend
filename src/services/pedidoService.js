const PedidoModel = require('../models/pedido')
const PedidoLancheModel = require('../models/pedidoLanche')
const LancheModel = require('../models/lanche')
const CestoModel = require('../models/cestoCompras')
const LanchoneteModel = require('../models/lanchonete')
const UserModel = require('../models/user')

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
                include: [
                    {
                        model: LancheModel,
                        as: 'itens',
                        through: {
                            attributes: ['quantidade', 'precoUnitario'],
                        },
                    },
                    {
                        model: LanchoneteModel,
                        as: 'lanchonete',
                        attributes: ['nome'],
                    }
                ],
                order: [['createdAt', 'DESC']],
            });
    
            // Mapeando os pedidos para o formato desejado
            return pedidos.map(pedido => ({
                id: pedido.id,
                total: pedido.total,
                status: pedido.status,
                idUsuario: pedido.idUsuario,
                idLanchonete: pedido.idLanchonete,
                nomeLanchonete: pedido.lanchonete.nome,
                itens: pedido.itens.map(item => ({
                    id: item.id,
                    nome: item.nome,
                    descricao: item.descricao,
                    tipo: item.tipo,
                    imagem: item.imagem,
                    quantidade: item.PedidoLanche.quantidade,
                    precoUnitario: item.PedidoLanche.precoUnitario,
                })),
            }));
        } catch (error) {
            throw error;
        }
    }
    

    async listarPedidosLanchonete(idLanchonete) {
        try {
            const pedidos = await PedidoModel.findAll({
                where: { idLanchonete },
                include: [
                    {
                        model: LancheModel,
                        as: 'itens',
                        through: {
                            attributes: ['quantidade', 'precoUnitario', 'total']
                        }
                    },
                    {
                        model: UserModel, // Incluir o modelo de usuário
                        as: 'usuario', // Certifique-se de que o alias está configurado corretamente no modelo de pedido
                        attributes: ['nome', 'imagem'], // Selecionar o nome e a imagem do usuário
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            // Mapeando os pedidos para o formato desejado
            return pedidos.map(pedido => ({
                id: pedido.id,
                total: pedido.total,
                status: pedido.status,
                idUsuario: pedido.idUsuario,
                nomeUsuario: pedido.usuario.nome, // Nome do usuário
                imagemUsuario: pedido.usuario.imagem, // imagem do usuário
                idLanchonete: pedido.idLanchonete,
                itens: pedido.itens.map(item => ({
                    id: item.id,
                    nome: item.nome,
                    descricao: item.descricao,
                    tipo: item.tipo,
                    imagem: item.imagem,
                    quantidade: item.PedidoLanche.quantidade,
                    precoUnitario: item.PedidoLanche.precoUnitario,
                    total: item.PedidoLanche.total,
                })),
            }));
        } catch (error) {
            throw error;
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
