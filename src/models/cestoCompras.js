const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')
const UserModel = require('./user')
const LanchoneteModel = require('./lanchonete')

const CestoModel = sequelize.define('Cesto', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: UserModel,
            key: 'id'
        }
    },
    lanchoneteId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: LanchoneteModel,
            key: 'id'
        }
    },
    lanches: {
        type: DataTypes.JSON,
        // Exemplo de estrutura esperada: [{ idLanche: 1, quantidade: 2 }, { idLanche: 3, quantidade: 1 }]
        validate: {
            isArrayWithObjects(value) {
                if (!Array.isArray(value)) {
                    throw new Error('Lanches deve ser um array.')
                }
                value.forEach(item => {
                    if (typeof item.idLanche !== 'number' || typeof item.quantidade !== 'number') {
                        throw new Error('Cada item deve conter idLanche e quantidade como números.')
                    }
                })
            }
        }
    }
}, {
    tableName: 'cestos'
})

module.exports = CestoModel
