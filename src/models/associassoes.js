const UserTempModel = require('./user_temp')
const SolicitacaoModel = require('./solicitacao');
const UserModel = require('./user');
const LanchoneteModel = require('./lanchonete');
const EnderecoModel = require('./endereco');
const HorarioFuncionamentoModel = require('./horarioFuncionamento');
const LancheModel = require('./lanche');

UserTempModel.hasOne(SolicitacaoModel, {
    foreignKey: 'idUserTemp',
    as: 'solicitacao',
    onDelete: 'CASCADE',
});

SolicitacaoModel.belongsTo(UserTempModel, {
    foreignKey: 'idUserTemp',
    as: 'usuarioTemporario',
});

UserModel.hasOne(LanchoneteModel, {
    foreignKey: 'gerente',
    as: 'lanchoneteGerenciada',
    onDelete: 'CASCADE'
})

LanchoneteModel.belongsTo(UserModel, {
    foreignKey: 'gerente',
    as: 'gerenteUsuario'
});

LanchoneteModel.hasOne(EnderecoModel, {
    foreignKey: 'idLanchonete',
    as: 'endereco',
    onDelete: 'CASCADE'
})

EnderecoModel.belongsTo(LanchoneteModel, {
    foreignKey: 'idLanchonete',
    as: 'enderecoLanchonete'
})

LanchoneteModel.hasMany(HorarioFuncionamentoModel, {
    foreignKey: 'idLanchonete',
    as: 'horariosDeFuncionamento',
    onDelete: 'CASCADE'    
})

EnderecoModel.belongsTo(LanchoneteModel, {
    foreignKey: 'idLanchonete',
    as: 'horariosDeFuncionamento'
})

// Associação Lanchonete tem muitos Lanches
LanchoneteModel.hasMany(LancheModel, {
    foreignKey: 'idLanchonete',
    as: 'lanches',
    onDelete: 'CASCADE'
});

// Associação Lanche pertence a uma Lanchonete
LancheModel.belongsTo(LanchoneteModel, {
    foreignKey: 'idLanchonete',
    as: 'lanchonete'
});

async function verificarECriarTabelas() {
    try {
        await UserTempModel.sync({ force: false });
        await SolicitacaoModel.sync({ force: false });
        await UserModel.sync({ force: false });
        await LanchoneteModel.sync({ force: false });
        await EnderecoModel.sync({ force: false });
        await HorarioFuncionamentoModel.sync({ force: false })
        await LancheModel.sync({ force: false });

        await UserTempModel.sync({ alter: true });
        await SolicitacaoModel.sync({ alter: true });
        await UserModel.sync({ alter: true });
        await LanchoneteModel.sync({ alter: true });
        await EnderecoModel.sync({ alter: true });
        await HorarioFuncionamentoModel.sync({ alter: true })
        await LancheModel.sync({ alter: true });


        console.log('Tabelas verificadas e, se necessário, criadas com sucesso.');
    } catch (error) {
        console.error('Erro ao verificar/criar as tabelas:', error);
    }
}

verificarECriarTabelas();

module.exports = {
    UserTempModel,
    SolicitacaoModel,
    UserModel,
    LanchoneteModel,
    EnderecoModel,
    HorarioFuncionamentoModel,
    LancheModel
};
