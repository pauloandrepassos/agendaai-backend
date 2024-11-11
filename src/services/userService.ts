import AppDataSource from "../database/config";
import { User } from "../models/User";
import { Repository } from "typeorm";

class UserService {
    private userRepository: Repository<User>;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
    }

    public async getAllUsers() {
        return await this.userRepository.find();
    }

    public async getUserById(id: number) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) throw new Error("Usuário não encontrado");
        return user;
    }

    public async updateUser(id: number, updatedData: Partial<User>) {
        const user = await this.getUserById(id);
        Object.assign(user, updatedData);
        return await this.userRepository.save(user);
    }

    public async deleteUser(id: number) {
        const user = await this.getUserById(id);
        return await this.userRepository.remove(user);
    }
}

export default new UserService();
