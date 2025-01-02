import AppDataSource from "../database/config";
import { User } from "../models/User";
import { Repository } from "typeorm";
import CustomError from "../utils/CustomError";
class UserService {
    private userRepository: Repository<User>;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
    }

    public async getAllUsers(): Promise<User[]> {
        try {
            const users = await this.userRepository.find();
            if (!users.length) {
                throw new CustomError("Nenhum usuário encontrado.", 404, "NO_USERS_FOUND");
            }
            return users;
        } catch (error) {
            console.error("Erro ao buscar todos os usuários:", error);
            if(error instanceof CustomError) throw error
            throw new CustomError("Erro ao buscar todos os usuários.", 500, "GET_ALL_USERS_ERROR");
        }
    }

    public async getUserById(id: number): Promise<User> {
        try {
            const user = await this.userRepository.findOne({ where: { id } });
            if (!user) {
                throw new CustomError("Usuário não encontrado.", 404, "USER_NOT_FOUND");
            }
            return user;
        } catch (error) {
            console.error("Erro ao buscar usuário por ID:", error);
            if(error instanceof CustomError) throw error
            throw new CustomError("Erro ao buscar usuário por ID.", 500, "GET_USER_BY_ID_ERROR");
        }
    }

    public async getUserByEmail(email: string): Promise<User> {
        try {
            const user = await this.userRepository.findOne({ where: { email } });
            if (!user) {
                throw new CustomError("Usuário não encontrado.", 404, "USER_NOT_FOUND");
            }
            return user;
        } catch (error) {
            if(error instanceof CustomError) throw error
            throw new CustomError("Erro ao buscar usuário por email.", 500, "GET_USER_BY_EMAIL_ERROR");
        }
    }

    public async updateUser(id: number, updatedData: Partial<User>): Promise<User> {
        try {
            const user = await this.getUserById(id);
            Object.assign(user, updatedData);
            const updatedUser = await this.userRepository.save(user);
            return updatedUser;
        } catch (error) {
            console.error("Erro ao atualizar usuário:", error);
            if(error instanceof CustomError) throw error
            throw new CustomError("Erro ao atualizar usuário.", 500, "UPDATE_USER_ERROR");
        }
    }

    public async updateUserImage(id: number, image: string): Promise<User> {
        try {
            const user = await this.getUserById(id);
            user.image = image;
            const updatedUser = await this.userRepository.save(user);
            return updatedUser;
        } catch (error) {
            console.error("Erro ao atualizar imagem do usuário:", error);
            if(error instanceof CustomError) throw error
            throw new CustomError("Erro ao atualizar imagem do usuário.", 500, "UPDATE_USER_IMAGE_ERROR");
        }
    }
}

export default new UserService();
