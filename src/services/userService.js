const UserModel = require('../models/user')

class UserService {
    async listarUsuarios() {
        try {
            const users = await UserModel.findAll({
                attributes: { exclude: ['password'] }
            })
            return users
        } catch (error) {
            throw error
        }
    }

    async buscarUsuario(id) {
        try {
            const user = await UserModel.findByPk(id, {
                attributes: { exclude: ['password'] }
            })
            return user
        } catch (error) {
            throw error
        }
    }
}

module.exports = UserService
