const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.PG_BANCO, 
    process.env.PG_USUARIO, 
    process.env.PG_SENHA, 
    {
        host: process.env.PG_HOST,
        dialect: 'postgres',
        port: process.env.PG_PORT,
    }
);

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexão com o banco de dados foi bem-sucedida.');
    } catch (error) {
        console.error('Não foi possível conectar ao banco de dados:', error);
    }
};

//testConnection();

module.exports = sequelize;
