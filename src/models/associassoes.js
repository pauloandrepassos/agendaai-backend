const UserTempModel = require('./user_temp')
const SolicitacaoModel = require('./solicitacao')

// Definindo a associação hasOne no UserTempModel
UserTempModel.hasOne(SolicitacaoModel, {
    foreignKey: 'idUserTemp',
    as: 'solicitacao',
    onDelete: 'CASCADE',
});

// Definindo a associação belongsTo no SolicitacaoModel
SolicitacaoModel.belongsTo(UserTempModel, {
    foreignKey: 'idUserTemp',
    as: 'usuarioTemporario',
});

async function verificarECriarTabelas() {
    try {
        await UserTempModel.sync({ force: false });
        await SolicitacaoModel.sync({ force: false });

        await UserTempModel.sync({ alter: true });
        await SolicitacaoModel.sync({ alter: true });


        console.log('Tabelas verificadas e, se necessário, criadas com sucesso.');
    } catch (error) {
        console.error('Erro ao verificar/criar as tabelas:', error);
    }
}

verificarECriarTabelas();

module.exports = {
    UserTempModel,
    SolicitacaoModel
};
