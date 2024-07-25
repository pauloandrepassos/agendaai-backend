const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const UserModel = sequelize.define('User', {
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
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    papel: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    ultimo_login: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'users',
    hooks: {
        beforeUpdate: (user, options) => {
            if (user.changed('email')) {
                throw new Error('O email não pode ser alterado após a criação')
            }
        }
    }
})

module.exports = UserModel