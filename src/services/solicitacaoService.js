const SolicitacaoModel = require("../models/solicitacao");
const UserTempModel = require("../models/user_temp");

class SolicitacaoService {
    async enviarSolicitacao(idUserTemp, nomeLanchonete, cnpj, imagem, cep, logradouro, numero, bairro, cidade, estado) {
        try {
            const solicitacao = await SolicitacaoModel.create({
                idUserTemp,
                nomeLanchonete,
                cnpj,
                imagem,
                cep,
                logradouro,
                numero,
                bairro,
                cidade,
                estado
            })
            return solicitacao
        } catch (error) {
            throw error
        }
    }

    async listarSolicitacoes() {
        try {
            const solicitacoes = await SolicitacaoModel.findAll({
                attributes: ['id', 'status', 'nomeLanchonete', 'cnpj', 'imagem', 'cep', 'logradouro', 'numero', 'bairro', 'cidade', 'estado'],
                include: {
                    model: UserTempModel,
                    attributes: ['nome', 'email'],
                    as: 'usuarioTemporario' //nome colocado na associação
                },
            })
            const formattedSolicitacoes = solicitacoes.map(solicitacao => ({
                id: solicitacao.id,
                status: solicitacao.status,
                nomeLanchonete: solicitacao.nomeLanchonete,
                gerente: solicitacao.usuarioTemporario.nome,
                email: solicitacao.usuarioTemporario.email,
                cnpj: solicitacao.cnpj,
                imagem: solicitacao.imagem,
                cep: solicitacao.cep,
                logradouro: solicitacao.logradouro,
                numero: solicitacao.numero,
                bairro: solicitacao.bairro,
                cidade: solicitacao.cidade,
                estado: solicitacao.estado,
            }))
            return formattedSolicitacoes
        } catch (error) {
            throw error
        }
    }

    async getSolicitacaoById(id) {
        try {
            const solicitacao = await SolicitacaoModel.findByPk(id, {
                attributes: ['id', 'status', 'nomeLanchonete', 'cnpj', 'imagem', 'cep', 'logradouro', 'numero', 'bairro', 'cidade', 'estado'],
                include: {
                    model: UserTempModel,
                    attributes: ['nome', 'email'],
                    as: 'usuarioTemporario'  // Alias da associação
                },
            });

            if (!solicitacao) {
                throw new Error('Solicitação não encontrada');
            }

            const formattedSolicitacao = {
                id: solicitacao.id,
                status: solicitacao.status,
                nomeLanchonete: solicitacao.nomeLanchonete,
                gerente: solicitacao.usuarioTemporario.nome,
                email: solicitacao.usuarioTemporario.email,
                cnpj: solicitacao.cnpj,
                imagem: solicitacao.imagem,
                cep: solicitacao.cep,
                logradouro: solicitacao.logradouro,
                numero: solicitacao.numero,
                bairro: solicitacao.bairro,
                cidade: solicitacao.cidade,
                estado: solicitacao.estado,
            };

            return formattedSolicitacao;
        } catch (error) {
            throw error;
        }
    }
    async verificarSolicitação(id) {
        try {
            const solicitacao = await SolicitacaoModel.findByPk(id)
            if (!solicitacao) {
                throw new Error('Solicitação não encontrada');
            }

            solicitacao.status = "verificado";
            await solicitacao.save();

            return solicitacao;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = SolicitacaoService