import AppDataSource from "../database/config";
import { User } from "../models/User";
import { Repository } from "typeorm";
import { UserType } from "../models/User"; // Importando o enum

class UserService {
    private userRepository: Repository<User>;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
    }

    // Criar um novo usuário
    public async newUser(userData: Partial<User>) {
        const user = this.userRepository.create({
            ...userData,
            user_type: userData.user_type || UserType.CLIENT, // Default: CLIENT
        });
        return await this.userRepository.save(user);
    }

    // Listar todos os usuários
    public async getAllUsers() {
        return await this.userRepository.find();
    }

    // Obter um usuário por ID
    public async getUserById(id: number) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) throw new Error("Usuário não encontrado");
        return user;
    }

    // Atualizar um usuário
    public async updateUser(id: number, updatedData: Partial<User>) {
        const user = await this.getUserById(id);
        Object.assign(user, updatedData);
        return await this.userRepository.save(user);
    }

    // Deletar um usuário
    public async deleteUser(id: number) {
        const user = await this.getUserById(id);
        return await this.userRepository.remove(user);
    }
}

export default new UserService();
