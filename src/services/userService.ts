import { omit } from "../utils/omit";
import AppDataSource from "../database/config";
import { User } from "../models/User";
import { Repository } from "typeorm";

class UserService {
    private userRepository: Repository<User>;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
    }

    public async getAllUsers() {
        const users = await this.userRepository.find()
        return users.map(user => omit(user, 'password', 'cpf'))
    }

    public async getUserById(id: number) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) throw new Error("Usuário não encontrado");
        return omit(user, "password");
    }

    public async updateUser(id: number, updatedData: Partial<User>) {
        const user = await this.getUserById(id);
        Object.assign(user, updatedData);
        const updatedUser = await this.userRepository.save(user);
        return omit(updatedUser, "password")
    }

    public async updateUserImage(id: number, image: string) {
        console.log("chegou no service")
        const user = await this.getUserById(id)

        user.image = image

        const updatedUser = await this.userRepository.save(user)

        return omit(updatedUser, 'password')
    }
}

export default new UserService();
