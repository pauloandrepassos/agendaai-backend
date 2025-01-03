import { EstablishmentRequest, RequestStatus } from "../models/EstablishmentRequest";
import AppDataSource from "../database/config";
import { Repository } from "typeorm";
import jwt from "jsonwebtoken";
import { sendRegistrationCompletionEmail } from "../utils/emails";
import userService from "./userService";
import establishmentService from "./establishmentService";
import CustomError from "../utils/CustomError";

class EstablishmentRequestService {
    private establishmentRequest: Repository<EstablishmentRequest>;

    constructor() {
        this.establishmentRequest = AppDataSource.getRepository(EstablishmentRequest);
    }

    public async getAll() {
        return await this.establishmentRequest.find();
    }

    public async getById(id: number) {
        const establishmentRequest = await this.establishmentRequest.findOne({
            where: { id },
            relations: ["vendor"],
        });
        if (!establishmentRequest) {
            throw new CustomError("Solicitação não encontrada", 404, "REQUEST_NOT_FOUND");
        }
        return establishmentRequest;
    }

    public async getByVendorId(id: number) {
        const establishmentRequest = await this.establishmentRequest.findOne({
            where: { vendor_id: id },
        });
        if (!establishmentRequest) {
            throw new CustomError("Solicitação não encontrada para o vendedor", 404, "REQUEST_NOT_FOUND");
        }
        return establishmentRequest;
    }

    public async create(establishmentRequestData: Partial<EstablishmentRequest>) {
        const establishmentRequest = this.establishmentRequest.create(establishmentRequestData);
        return await this.establishmentRequest.save(establishmentRequest);
    }

    public async approveRequest(id: number) {
        const establishmentRequest = await this.establishmentRequest.findOne({
            where: { id },
            relations: ["vendor"],
        });

        if (!establishmentRequest) {
            throw new CustomError("Solicitação não encontrada", 404, "REQUEST_NOT_FOUND");
        }

        const secretKey = process.env.SECRET_KEY;

        if (!secretKey) {
            throw new CustomError("SECRET_KEY não definida nas variáveis de ambiente", 500, "CONFIG_ERROR");
        }

        const token = jwt.sign(
            { id: establishmentRequest.id, email: establishmentRequest.vendor.email },
            secretKey
        );

        sendRegistrationCompletionEmail(establishmentRequest.vendor.email, token);

        establishmentRequest.status = RequestStatus.APPROVED;
        return await this.establishmentRequest.save(establishmentRequest);
    }

    public async completeRegistration(token: string, email: string) {
        const secretKey = process.env.SECRET_KEY;

        if (!secretKey) {
            throw new CustomError("SECRET_KEY não está definida nas variáveis de ambiente", 500, "CONFIG_ERROR");
        }

        let decodedToken;
        try {
            decodedToken = jwt.verify(token, secretKey) as { id: number; email: string };
        } catch (error) {
            throw new CustomError("Token inválido ou expirado", 400, "INVALID_TOKEN");
        }

        if (decodedToken.email !== email) {
            throw new CustomError("Token não corresponde ao email fornecido", 400, "TOKEN_MISMATCH");
        }

        const user = await userService.getUserByEmail(email);
        if (!user) {
            throw new CustomError("Usuário não encontrado", 404, "USER_NOT_FOUND");
        }

        const establishmentRequest = await this.establishmentRequest.findOne({
            where: { id: decodedToken.id },
        });
        if (!establishmentRequest) {
            throw new CustomError("Solicitação não encontrada", 404, "REQUEST_NOT_FOUND");
        }

        const establishmentData = {
            name: establishmentRequest.name,
            logo: establishmentRequest.logo,
            background_image: establishmentRequest.background_image,
            cnpj: establishmentRequest.cnpj,
            vendor_id: establishmentRequest.vendor_id,
        };

        const addressData = {
            zip_code: establishmentRequest.zip_code,
            state: establishmentRequest.state,
            city: establishmentRequest.city,
            neighborhood: establishmentRequest.neighborhood,
            street: establishmentRequest.street,
            number: establishmentRequest.number,
            complement: establishmentRequest.complement,
            reference_point: establishmentRequest.reference_point,
        };

        const newEstablishment = await establishmentService.newEstablishment(establishmentData, addressData);

        await this.establishmentRequest.delete(establishmentRequest.id);

        return newEstablishment;
    }
}

export default new EstablishmentRequestService();
