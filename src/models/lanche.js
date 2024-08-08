const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const LancheModel =  sequelize.define('Lanche', {
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
    descricao: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    preco: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    tipo: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    imagem: {
        type: DataTypes.STRING
    },
    idLanchonete: {
        type: DataTypes.INTEGER,
        references: {
            model: 'lanchonetes',
            key: 'id'
        }
    }
}, {
    tableName: 'lanches'
})

module.exports = LancheModel