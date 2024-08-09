const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')
const PedidoModel = require('./pedido')
const LancheModel = require('./lanche')

const PedidoLancheModel = sequelize.define('PedidoLanche', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    quantidade: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: true,
            isInt: true,
            min: 1
        }
    },
    precoUnitario: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            notEmpty: true,
            isFloat: true,
            min: 0
        }
    },
    total: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            notEmpty: true,
            isFloat: true,
            min: 0
        }
    },
    idPedido: {
        type: DataTypes.INTEGER,
        references: {
            model: PedidoModel,
            key: 'id'
        }
    },
    idLanche: {
        type: DataTypes.INTEGER,
        references: {
            model: LancheModel,
            key: 'id'
        }
    }
}, {
    tableName: 'pedidos_lanches'
})

module.exports = PedidoLancheModel
