import AppDataSource from "../database/config";
import { User } from "../models/User";
import { Repository } from "typeorm";
import CustomError from "../utils/CustomError";
import { decrypt } from "../utils/encryption";

class UserService {
    private userRepository: Repository<User>;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
    }

    // Função para descriptografar o CPF
    private decryptCPF(encryptedCPF: string): string {
        return decrypt(encryptedCPF); // Passando os dois argumentos separados
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
            if (error instanceof CustomError) throw error
            throw new CustomError("Erro ao buscar todos os usuários.", 500, "GET_ALL_USERS_ERROR");
        }
    }

    public async getUserById(id: number): Promise<User> {
        try {
            const user = await this.userRepository.findOne({ where: { id } });

            if (!user) {
                throw new CustomError("Usuário não encontrado.", 404, "USER_NOT_FOUND");
            }
            if (user.cpf) {
                user.cpf = decrypt(user.cpf);  // Descriptografando o CPF
            }
            return user;
        } catch (error) {
            console.error("Erro ao buscar usuário por ID:", error);
            if (error instanceof CustomError) throw error
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
            if (error instanceof CustomError) throw error
            throw new CustomError("Erro ao buscar usuário por email.", 500, "GET_USER_BY_EMAIL_ERROR");
        }
    }

    public async updateUser(id: number, updatedData: { name?: string; phone?: string }): Promise<User> {
        try {
            const user = await this.userRepository.findOne({ where: { id } });
            if (!user) {
                throw new CustomError("Usuário não encontrado.", 404, "USER_NOT_FOUND");
            }

            if (updatedData.name) user.name = updatedData.name;
            if (updatedData.phone) user.phone = updatedData.phone;

            const updatedUser = await this.userRepository.save(user);

            return updatedUser;
        } catch (error) {
            console.error("Erro ao atualizar usuário:", error);
            throw new CustomError("Erro ao atualizar usuário.", 500, "UPDATE_USER_ERROR");
        }
    }


    public async updateUserImage(id: number, image: string): Promise<User> {
        try {
            const user = await this.userRepository.findOne({ where: { id } });
            if (!user) {
                throw new CustomError("Usuário não encontrado.", 404, "USER_NOT_FOUND");
            }
            user.image = image;
            const updatedUser = await this.userRepository.save(user);
            return updatedUser;
        } catch (error) {
            console.error("Erro ao atualizar imagem do usuário:", error);
            if (error instanceof CustomError) throw error
            throw new CustomError("Erro ao atualizar imagem do usuário.", 500, "UPDATE_USER_IMAGE_ERROR");
        }
    }

    public async getUsersCount(): Promise<number> {
        try {
            const count = await this.userRepository.count();
            return count;
        } catch (error) {
            console.error("Erro ao contar usuários:", error);
            throw new CustomError("Erro ao contar usuários.", 500, "COUNT_USERS_ERROR");
        }
    }
}

export default new UserService();
