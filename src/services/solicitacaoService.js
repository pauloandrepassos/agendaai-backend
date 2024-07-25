const jwt = require('jsonwebtoken')

const SolicitacaoModel = require("../models/solicitacao");
const UserTempModel = require("../models/user_temp");
const { sendRegistrationCompletionEmail } = require('../utils/emails');
const sequelize = require('../config/db');
const UserModel = require('../models/user');
const EnderecoModel = require('../models/endereco');
const LanchoneteModel = require('../models/lanchonete');

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

            const user_temp = await UserTempModel.findByPk(solicitacao.idUserTemp)

            if (user_temp) {
                solicitacao.status = "verificado";
                await solicitacao.save();

                const token = jwt.sign({ solicitacaoId: id }, process.env.SECRET_KEY)

                await sendRegistrationCompletionEmail(user_temp.email, token)
            } else {
                throw new Error('User_temp não encontrado')
            }

            return solicitacao;
        } catch (error) {
            throw error;
        }
    }

    async confirmarRegistro(token, email) {
        try {
            const userTemp = await UserTempModel.findOne({
                where: {
                    email: email
                }
            });
            if (!userTemp) {
                throw new Error('Usuário não encontrado ou já verificado');
            }

            let decoded;
            try {
                decoded = jwt.verify(token, process.env.SECRET_KEY);
            } catch (error) {
                throw new Error('Token inválido ou expirado');
            }

            const solicitacao = await SolicitacaoModel.findByPk(decoded.solicitacaoId);
            if (solicitacao.idUserTemp !== userTemp.id) {
                throw new Error('Token não corresponde ao usuário');
            }

            let result;

            await sequelize.transaction(async (t) => {
                const user = await UserModel.create({
                    nome: userTemp.nome,
                    email: userTemp.email,
                    password: userTemp.password,
                    papel: userTemp.papel
                }, { transaction: t });

                const endereco = await EnderecoModel.create({
                    cep: solicitacao.cep,
                    logradouro: solicitacao.logradouro,
                    numero: solicitacao.numero,
                    bairro: solicitacao.bairro,
                    cidade: solicitacao.cidade,
                    estado: solicitacao.estado
                }, { transaction: t });

                const lanchonete = await LanchoneteModel.create({
                    nome: solicitacao.nomeLanchonete,
                    cnpj: solicitacao.cnpj,
                    imagem: solicitacao.imagem,
                    gerente: user.id,
                    idEndereco: endereco.id
                }, { transaction: t });

                await UserTempModel.destroy({
                    where: {
                        email: email
                    },
                    transaction: t
                });

                await SolicitacaoModel.destroy({
                    where: {
                        id: solicitacao.id
                    },
                    transaction: t
                })

                result = {
                    user,
                    endereco,
                    lanchonete
                };
            });

            return result;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = SolicitacaoService