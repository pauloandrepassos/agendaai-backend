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
        return users
    }

    public async getUserById(id: number) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) throw new Error("Usuário não encontrado");
        return user
    }

    public async getUserByEmail(email: string) {
        const user = await this.userRepository.findOne({ where: { email }})
        if (!user) throw new Error("Usuário não encontrado");
        return user
    }

    public async updateUser(id: number, updatedData: Partial<User>) {
        const user = await this.getUserById(id);
        Object.assign(user, updatedData);
        const updatedUser = await this.userRepository.save(user);
        return updatedUser
    }

    public async updateUserImage(id: number, image: string) {
        console.log("chegou no service")
        const user = await this.getUserById(id)

        user.image = image

        const updatedUser = await this.userRepository.save(user)

        return updatedUser
    }
}

export default new UserService();
