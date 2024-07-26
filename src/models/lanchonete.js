const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const LanchoneteModel = sequelize.define('Lanchonete', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    cnpj: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true
        }
    },
    imagem: {
        type: DataTypes.STRING
    },
    gerente: { //referencia id de usuario
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
}, {
    tableName: 'lanchonetes'
})

module.exports = LanchoneteModel