const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const UserModel = require('../models/user')
const TempUserModel = require('../models/user_temp')
const { sendVerificationEmail } = require('../utils/emails')
const UserTempModel = require('../models/user_temp')

class AuthService {
    async registerUserTemp(nome, email, password, papel) {
        try {
            const hashedPassword = await bcrypt.hash(password, 10)
            const userTemp = await TempUserModel.create({
                nome,
                email,
                password: hashedPassword,
                papel
            })
            const token = jwt.sign({ id: userTemp.id }, process.env.SECRET_KEY, { expiresIn: '1h' });

            if(papel == 'cliente') {
                await sendVerificationEmail(email, token)
            }

            return { userTemp, token }
        } catch (error) {
            throw error
        }
    }
    async verifyUserEmail(token, email) {
        try {
            const userTemp = await TempUserModel.findOne({ where: { email } })
            if (!userTemp) {
                throw new Error('Usuário não encontrado ou já verificado')
            }

            let decoded
            try {
                decoded = jwt.verify(token, process.env.SECRET_KEY)
            } catch (error) {
                throw new Error('Token inválido ou expirado')
            }

            if (decoded.id !== userTemp.id) {
                throw new Error('Token não corresponde ao usuário')
            }

            const user = await UserModel.create({
                nome: userTemp.nome,
                email: userTemp.email,
                password: userTemp.password,
                papel: userTemp.papel
            })

            await UserTempModel.destroy({
                where: {
                    email
                }
            })

            return user
        } catch (error) {
            throw error
        }
    }

    async signIn(email, password) {
        try {
            const user = await UserModel.findOne({
                where: {
                    email: email
                }
            })
            if (!user) {
                throw new Error('Usuário não encontrado')
            }
            const senhaValida = bcrypt.compareSync(password, user.password)
            if (!user || !senhaValida) {
                console.log("invalido")
                throw new Error('Email ou senha inválido!')
            }
            user.ultimo_login = new Date();
            await user.save();
            const token = jwt.sign({ id: user.id, email: user.email, papel: user.papel }, process.env.SECRET_KEY, { expiresIn: '10h' })
            return { user, token }
        } catch (error) {
            throw error
        }
    }

    async verificarUserTemp(email) {
        try {
            const userTemp = await TempUserModel.findOne({
                where: {
                    email: email
                }
            })
            return userTemp
        } catch (error) {
            throw error
        }
    }
    async deletarUserTemp(email) {
        try {
            await TempUserModel.destroy({
                where: {
                    email: email
                }
            })
        } catch (error) {
            
        }
    }
    async verificarUser(email) {
        try {
            const userTemp = await UserModel.findOne({
                where: {
                    email: email
                }
            })
            return userTemp
        } catch (error) {
            throw error
        }
    }

    async verificarSenha(email, senhaFornecida) {
        const user = await UserModel.findOne({
            where: {
                email: email
            }
        })

        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        console.log('as')

        const senhavalida = bcrypt.compareSync(senhaFornecida, user.password)

        if (senhavalida) {
            console.log('A senha corresponde ao hash')
            return true
        } else {
            console.log('Não corresponde ao hash')
            return false
        }
    }
}

module.exports = AuthService