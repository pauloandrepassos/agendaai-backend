const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const HorarioFuncionamentoModel = sequelize.define('HorarioFuncionamento', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    idLanchonete: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'lanchonetes',
            key: 'id',
        }
    },
    diaSemana: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    horarioAbertura: {
        type: DataTypes.TIME,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    horarioFechamento: {
        type: DataTypes.TIME,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
}, {
    tableName: 'horarios_funcionamento'
})

module.exports = HorarioFuncionamentoModel