const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')
const UserModel = require('./user')
const LanchoneteModel = require('./lanchonete')

const PedidoModel = sequelize.define('Pedido', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    total: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            notEmpty: true,
            isFloat: true,
            min: 0
        },
        defaultValue: 0
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        },
        defaultValue: 'Pendente'
    },
    idUsuario: {
        type: DataTypes.INTEGER,
        references: {
            model: UserModel,
            key: 'id'
        }
    },
    idLanchonete: {
        type: DataTypes.INTEGER,
        references: {
            model: LanchoneteModel,
            key: 'id'
        }
    }
}, {
    tableName: 'pedidos'
})

module.exports = PedidoModel
